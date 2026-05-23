"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, triggerFileDownload } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import { queryKeys } from "@/lib/query-keys";
import { invalidateReportsQueries } from "@/lib/query-invalidation";
import {
  FileText,
  User,
  Printer,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const reportQueryParams = (
  academicYear: string,
  term: string,
  reportType: "term" | "annual"
) => ({
  year: academicYear,
  term: reportType === "term" ? term : undefined,
  reportType,
});

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const { academicYear, term, className } = useFilters();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<"term" | "annual">("term");

  const [teacherComment, setTeacherComment] = useState("");
  const [headTeacherComment, setHeadTeacherComment] = useState("");
  const [strengthInput, setStrengthInput] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknessInput, setWeaknessInput] = useState("");
  const [weaknesses, setWeaknesses] = useState<string[]>([]);

  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: queryKeys.students.list({ className, year: academicYear }),
    queryFn: () => api.students.list({ className, year: academicYear }),
    staleTime: 60_000,
  });

  const { data: reportsData } = useQuery({
    queryKey: queryKeys.reports.studentCard(selectedStudentId, {
      year: academicYear,
      term: reportType === "term" ? term : undefined,
      reportType,
    }),
    queryFn: () =>
      api.reports.list({
        studentId: selectedStudentId!,
        year: academicYear,
        term: reportType === "term" ? term : undefined,
        reportType,
      }),
    enabled: !!selectedStudentId,
    staleTime: 30_000,
  });

  const loadPreview = useCallback(async () => {
    if (!selectedStudentId) {
      setPreviewHtml(null);
      return;
    }

    const existingReport = reportsData?.reports?.[0];
    if (!existingReport) {
      setPreviewHtml(null);
      return;
    }

    setPreviewLoading(true);
    setActionError(null);

    try {
      const html = await api.reports.fetchPrintHtml(
        selectedStudentId,
        reportQueryParams(academicYear, term, reportType)
      );
      setPreviewHtml(html);
    } catch (err: unknown) {
      setPreviewHtml(null);
      setActionError(err instanceof Error ? err.message : "Failed to load report preview.");
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedStudentId, reportsData, academicYear, term, reportType]);

  useEffect(() => {
    const existingReport = reportsData?.reports?.[0];
    if (existingReport) {
      setTeacherComment(existingReport.teacherComment || "");
      setHeadTeacherComment(existingReport.headTeacherComment || "");
      setStrengths(existingReport.strengths || []);
      setWeaknesses(existingReport.weaknesses || []);
      void loadPreview();
    } else {
      setTeacherComment("");
      setHeadTeacherComment("");
      setStrengths([]);
      setWeaknesses([]);
      setPreviewHtml(null);
    }
  }, [reportsData, loadPreview]);

  const generateReportMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.reports.generate(selectedStudentId!, reportQueryParams(academicYear, term, reportType), body),
    onSuccess: () => {
      setActionSuccess("Report generated successfully.");
      void invalidateReportsQueries(queryClient);
      void loadPreview();
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to generate report.");
    },
    onSettled: () => {
      void invalidateReportsQueries(queryClient);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.reports.sendEmail(selectedStudentId!, reportQueryParams(academicYear, term, reportType), body),
    onSuccess: () => {
      setActionSuccess("Report sent to parent email.");
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to send report email.");
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

  const handleDownloadPdf = async () => {
    if (!selectedStudentId) return;
    setActionError(null);
    try {
      const blob = await api.reports.downloadBlob(
        selectedStudentId,
        reportQueryParams(academicYear, term, reportType)
      );
      const student = studentsData?.students?.find((s) => s._id === selectedStudentId);
      const filename = `${(student?.name || "student").replace(/\s+/g, "_").toLowerCase()}-report.pdf`;
      triggerFileDownload(blob, filename);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to download PDF.");
    }
  };

  const students = studentsData?.students || [];
  const hasReport = Boolean(reportsData?.reports?.[0]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm xl:col-span-1 flex flex-col h-[700px]">
        <h3 className="text-sm font-bold text-foreground mb-4">Students</h3>
        {loadingStudents ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-text">No students in this class filter.</p>
        ) : (
          <ul className="space-y-2 overflow-y-auto flex-1 pr-1">
            {students.map((student) => (
              <li key={student._id}>
                <button
                  type="button"
                  onClick={() => setSelectedStudentId(student._id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedStudentId === student._id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-background"
                  }`}
                >
                  <p className="text-sm font-bold truncate">{student.name}</p>
                  <p className="text-[10px] text-muted-text">{student.studentCode}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="xl:col-span-3 space-y-6">
        {!selectedStudentId ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center">
            <User className="w-10 h-10 text-muted-text mx-auto mb-3" />
            <p className="text-sm text-muted-text">Select a student to build a report card.</p>
          </div>
        ) : (
          <>
            {actionSuccess && (
              <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-success text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Report Builder
                </h3>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as "term" | "annual")}
                  className="text-sm font-semibold border border-border rounded-xl px-3 py-2 bg-background"
                >
                  <option value="term">Term Report</option>
                  <option value="annual">Annual Report</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Teacher Comment</label>
                  <textarea
                    value={teacherComment}
                    onChange={(e) => setTeacherComment(e.target.value)}
                    rows={3}
                    placeholder="Academic observations..."
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Head Teacher Comment</label>
                  <textarea
                    value={headTeacherComment}
                    onChange={(e) => setHeadTeacherComment(e.target.value)}
                    rows={3}
                    placeholder="Principal remarks..."
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Strengths</label>
                  <form onSubmit={handleAddStrength} className="flex gap-2 mb-2">
                    <input
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      placeholder="Add strength"
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background"
                    />
                    <button type="submit" className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
                      Add
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1">
                    {strengths.map((item) => (
                      <span key={item} className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                        {item}
                        <button type="button" className="ml-1" onClick={() => setStrengths(strengths.filter((s) => s !== item))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Focus Areas</label>
                  <form onSubmit={handleAddWeakness} className="flex gap-2 mb-2">
                    <input
                      value={weaknessInput}
                      onChange={(e) => setWeaknessInput(e.target.value)}
                      placeholder="Add focus area"
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background"
                    />
                    <button type="submit" className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
                      Add
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1">
                    {weaknesses.map((item) => (
                      <span key={item} className="text-xs bg-danger/10 text-danger px-2 py-1 rounded-full">
                        {item}
                        <button type="button" className="ml-1" onClick={() => setWeaknesses(weaknesses.filter((w) => w !== item))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold"
                >
                  {generateReportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Generate Report
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownloadPdf()}
                  disabled={!hasReport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handleSendToParent}
                  disabled={!hasReport || sendEmailMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-primary disabled:opacity-50"
                >
                  {sendEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send to Parent
                </button>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden min-h-[480px]">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Preview</span>
                {hasReport && (
                  <button type="button" onClick={() => void loadPreview()} className="text-xs font-semibold text-primary flex items-center gap-1">
                    Refresh <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              {previewLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : previewHtml ? (
                <iframe
                  title="Report preview"
                  srcDoc={previewHtml}
                  className="w-full h-[600px] bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-text">
                  <FileText className="w-10 h-10 mb-3 opacity-40" />
                  Generate a report to preview it here.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
