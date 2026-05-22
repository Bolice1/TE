"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import { queryKeys } from "@/lib/query-keys";
import { invalidateReportsQueries } from "@/lib/query-invalidation";
import {
  FileText,
  User,
  Plus,
  Trash2,
  Printer,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
} from "lucide-react";

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { academicYear, term, className } = useFilters();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<"term" | "annual">("term");

  // Comment Form States
  const [teacherComment, setTeacherComment] = useState("");
  const [headTeacherComment, setHeadTeacherComment] = useState("");
  const [strengthInput, setStrengthInput] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknessInput, setWeaknessInput] = useState("");
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  // Preview state (triggers iframe refresh)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 1. Fetch Students
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: queryKeys.students.list({ className: className || undefined, year: academicYear }),
    queryFn: () => api.students.list({ className: className || undefined, year: academicYear }),
    staleTime: 60_000,
  });
  const students = studentsData?.students || [];

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  // Load existing report comments if available
  const { data: reportsData } = useQuery({
    queryKey: queryKeys.reports.studentCard(selectedStudentId, {
      year: academicYear,
      term: reportType === "term" ? term : undefined,
      reportType,
    }),
    queryFn: () =>
      api.reports.list({
        studentId: selectedStudentId || undefined,
        year: academicYear,
        term: reportType === "term" ? term : undefined,
        reportType,
      }),
    enabled: !!selectedStudentId,
  });

  useEffect(() => {
    const existingReport = reportsData?.reports?.[0];
    if (existingReport) {
      setTeacherComment(existingReport.teacherComment || "");
      setHeadTeacherComment(existingReport.headTeacherComment || "");
      setStrengths(existingReport.strengths || []);
      setWeaknesses(existingReport.weaknesses || []);
      // Trigger preview load
      const url = api.reports.printUrl(selectedStudentId!, {
        year: academicYear,
        term: reportType === "term" ? term : undefined,
        reportType,
      });
      setPreviewUrl(url);
    } else {
      setTeacherComment("");
      setHeadTeacherComment("");
      setStrengths([]);
      setWeaknesses([]);
      setPreviewUrl(null);
    }
  }, [reportsData, selectedStudentId, academicYear, term, reportType]);

  // Mutations
  const generateReportMutation = useMutation({
    mutationFn: (body: any) =>
      api.reports.generate(
        selectedStudentId!,
        { year: academicYear, term: reportType === "term" ? term : undefined, reportType },
        body
      ),
    onMutate: async (body: any) => {
      const reportKey = queryKeys.reports.studentCard(selectedStudentId, {
        year: academicYear,
        term: reportType === "term" ? term : undefined,
        reportType,
      });
      await queryClient.cancelQueries({ queryKey: reportKey });
      const previousReport = queryClient.getQueryData<typeof reportsData>(reportKey);
      if (selectedStudentId) {
        queryClient.setQueryData(reportKey, {
          reports: [
            {
              _id: "optimistic-report",
              student: selectedStudentId,
              year: academicYear,
              term: reportType === "term" ? term : undefined,
              reportType,
              teacherComment: body.teacherComment,
              headTeacherComment: body.headTeacherComment,
              strengths: body.strengths,
              weaknesses: body.weaknesses,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        });
      }
      return { previousReport, reportKey };
    },
    onSuccess: (data) => {
      setActionSuccess("Report card compiled and cached successfully!");
      void invalidateReportsQueries(queryClient);
      // Update iframe source
      const url = api.reports.printUrl(selectedStudentId!, {
        year: academicYear,
        term: reportType === "term" ? term : undefined,
        reportType,
      });
      // Force reload by appending timestamp
      setPreviewUrl(`${url}&t=${Date.now()}`);
    },
    onError: (err: any, _body, context) => {
      if (context?.previousReport) {
        queryClient.setQueryData(context.reportKey, context.previousReport);
      }
      setActionError(err.message || "Failed to generate report.");
    },
    onSettled: () => {
      void invalidateReportsQueries(queryClient);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (body: any) =>
      api.reports.sendEmail(
        selectedStudentId!,
        { year: academicYear, term: reportType === "term" ? term : undefined, reportType },
        body
      ),
    onSuccess: () => {
      setActionSuccess("PDF compiled and dispatched to parent's email address!");
    },
    onError: (err: any) => {
      setActionError(err.message || "Failed to dispatch email.");
    },
  });

  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthInput.trim() && !strengths.includes(strengthInput.trim())) {
      setStrengths([...strengths, strengthInput.trim()]);
      setStrengthInput("");
    }
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (weaknessInput.trim() && !weaknesses.includes(weaknessInput.trim())) {
      setWeaknesses([...weaknesses, weaknessInput.trim()]);
      setWeaknessInput("");
    }
  };

  const handleGenerateReport = () => {
    setActionError(null);
    setActionSuccess(null);
    if (!selectedStudentId) return;

    generateReportMutation.mutate({
      teacherComment,
      headTeacherComment,
      strengths,
      weaknesses,
      sendToParent: false,
    });
  };

  const handleSendToParent = () => {
    setActionError(null);
    setActionSuccess(null);
    if (!selectedStudentId) return;

    sendEmailMutation.mutate({
      teacherComment,
      headTeacherComment,
      strengths,
      weaknesses,
      sendToParent: true,
    });
  };

  const handleDownloadPdf = () => {
    if (!selectedStudentId) return;
    const url = api.reports.printUrl(selectedStudentId!, {
      year: academicYear,
      term: reportType === "term" ? term : undefined,
      reportType,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* 1. STUDENT ROSTER LIST COLUMN */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm xl:col-span-1 flex flex-col h-[700px]">
        <h3 className="text-sm font-bold text-foreground mb-4">Select Student Roster</h3>
        {loadingStudents ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : students.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-2">
            {students.map((student: any) => {
              const isSelected = selectedStudentId === student._id;
              return (
                <button
                  key={student._id}
                  onClick={() => {
                    setActionSuccess(null);
                    setActionError(null);
                    setSelectedStudentId(student._id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 border-primary text-primary shadow-sm"
                      : "bg-background border-transparent hover:border-border text-muted-text hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs block truncate text-foreground">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-muted-text font-mono">
                      Code: {student.studentCode}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-text text-center">
            No students found in class {className}.
          </div>
        )}
      </div>

      {/* 2. COMMENT EDITORS COLUMN */}
      <div className="xl:col-span-3 space-y-6">
        {selectedStudentId && selectedStudent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form Column */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Grading Report Comments</h3>
                  <p className="text-xs text-muted-text">Student: {selectedStudent.name}</p>
                </div>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="py-1 px-3 border border-border rounded-lg text-xs bg-background focus:outline-none cursor-pointer"
                >
                  <option value="term">Term Report</option>
                  <option value="annual">Annual Report</option>
                </select>
              </div>

              {actionError && (
                <div className="p-3 bg-danger/5 border border-danger/25 text-danger rounded-xl text-xs">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 bg-success/5 border border-success/20 text-success rounded-xl text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Form Input fields */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Teacher Observations & Remarks</label>
                  <textarea
                    value={teacherComment}
                    onChange={(e) => setTeacherComment(e.target.value)}
                    placeholder="Enter academic observation remarks..."
                    rows={3}
                    className="w-full py-2 px-3 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Head Teacher Remarks</label>
                  <textarea
                    value={headTeacherComment}
                    onChange={(e) => setHeadTeacherComment(e.target.value)}
                    placeholder="Enter school principal head remarks..."
                    rows={2}
                    className="w-full py-2 px-3 border border-border bg-background rounded-xl focus:outline-none"
                  />
                </div>

                {/* Strengths bullet builder */}
                <div className="space-y-2">
                  <label className="block font-semibold text-foreground">Key Strengths List</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      placeholder="Add strength..."
                      className="flex-1 py-1.5 px-3 border border-border bg-background rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddStrength}
                      className="py-1.5 px-3 bg-primary text-white font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {strengths.map((str) => (
                      <span key={str} className="inline-flex items-center gap-1 bg-success/10 text-success px-2.5 py-0.5 rounded-full font-semibold">
                        <span>{str}</span>
                        <button type="button" onClick={() => setStrengths(strengths.filter((s) => s !== str))} className="font-bold hover:text-danger text-[10px] ml-1">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weaknesses bullet builder */}
                <div className="space-y-2">
                  <label className="block font-semibold text-foreground">Academic Focus Areas / Weaknesses</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weaknessInput}
                      onChange={(e) => setWeaknessInput(e.target.value)}
                      placeholder="Add weakness..."
                      className="flex-1 py-1.5 px-3 border border-border bg-background rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddWeakness}
                      className="py-1.5 px-3 bg-primary text-white font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {weaknesses.map((weak) => (
                      <span key={weak} className="inline-flex items-center gap-1 bg-danger/10 text-danger px-2.5 py-0.5 rounded-full font-semibold">
                        <span>{weak}</span>
                        <button type="button" onClick={() => setWeaknesses(weaknesses.filter((w) => w !== weak))} className="font-bold hover:text-danger text-[10px] ml-1">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-6 mt-4 space-y-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow shadow-primary/10"
                >
                  {generateReportMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Compile Preview</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={!previewUrl}
                    className="py-2.5 border border-border hover:bg-background text-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleSendToParent}
                    disabled={!previewUrl || sendEmailMutation.isPending}
                    className="py-2.5 border border-border bg-background hover:bg-primary/5 text-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendEmailMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Send to Parent</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Iframe Column */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col h-[600px] lg:h-auto">
              <h3 className="font-bold text-foreground text-sm mb-4">Live Report Card Preview</h3>
              <div className="flex-1 border border-border rounded-xl bg-background overflow-hidden relative">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-none"
                    title="Report preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs text-muted-text">
                    <FileText className="w-10 h-10 text-primary mb-3" />
                    <h4 className="font-bold text-foreground mb-1">No Report Generated Yet</h4>
                    <p>Enter observations in the form and click "Compile Preview" to load the Rwanda CBC-aligned printable report card.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface border border-border p-16 rounded-2xl shadow-sm text-center max-w-md mx-auto space-y-4">
            <User className="w-8 h-8 text-primary mx-auto" />
            <h3 className="text-base font-bold text-foreground">Select a Student</h3>
            <p className="text-xs text-muted-text">
              Choose a student from the sidebar directory roster to start grading report cards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
