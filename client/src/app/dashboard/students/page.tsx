"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Grid,
  List,
  Search,
  Plus,
  X,
  Phone,
  Mail,
  Calendar,
  Award,
  AlertTriangle,
  FileText,
  User,
  Loader2,
  TrendingUp,
  Briefcase,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const { academicYear, className } = useFilters();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Register Form state
  const [studentName, setStudentName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [dob, setDob] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Queries
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students-list", className, academicYear],
    queryFn: () => api.students.list({ className: className || undefined, year: academicYear }),
  });
  const students = studentsData?.students || [];

  // Filter students by search bar
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Single Student Queries (for Profile Drawer)
  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  const { data: studentMarksData } = useQuery({
    queryKey: ["student-marks", selectedStudentId],
    queryFn: () => api.marks.list({ studentId: selectedStudentId || undefined }),
    enabled: !!selectedStudentId,
  });
  const studentMarks = studentMarksData?.marks || [];

  // Single Student Report Cards
  const { data: studentReportsData } = useQuery({
    queryKey: ["student-reports", selectedStudentId],
    queryFn: () => api.reports.list({ studentId: selectedStudentId || undefined }),
    enabled: !!selectedStudentId,
  });
  const studentReports = studentReportsData?.reports || [];

  // Calculate Student Profile averages
  const calculateStudentAvg = () => {
    if (studentMarks.length === 0) return 0;
    const totals = studentMarks.reduce(
      (acc, mark) => {
        const weight = mark.assignment?.weight || 1;
        acc.score += mark.score * weight;
        acc.max += (mark.assignment?.maxScore || 10) * weight;
        return acc;
      },
      { score: 0, max: 0 }
    );
    return totals.max > 0 ? Number(((totals.score / totals.max) * 100).toFixed(1)) : 0;
  };

  const studentAvg = calculateStudentAvg();
  const needsIntervention = studentMarks.length > 0 && studentAvg < 50;

  // Chart data for student marks trend
  const chartData = studentMarks
    .map((mark) => {
      const percentage = mark.assignment?.maxScore > 0 ? (mark.score / mark.assignment.maxScore) * 100 : 0;
      return {
        name: mark.assignment?.title?.slice(0, 10) || "Test",
        score: Number(percentage.toFixed(1)),
      };
    })
    .reverse();

  // Mutations
  const registerStudentMutation = useMutation({
    mutationFn: api.students.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      setStudentName("");
      setStudentCode("");
      setParentName("");
      setParentEmail("");
      setParentPhone("");
      setDob("");
      setFormSuccess("Student registered successfully!");
      setTimeout(() => {
        setRegisterModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to register student.");
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!studentName || !studentCode || !parentName) {
      setFormError("Name, Code, and Parent name are required.");
      return;
    }
    registerStudentMutation.mutate({
      name: studentName,
      studentCode,
      className: className || "S1",
      year: academicYear,
      dateOfBirth: dob ? new Date(dob) : undefined,
      parentName,
      parentEmail: parentEmail || undefined,
      parentPhone: parentPhone || undefined,
    });
  };

  return (
    <div className="space-y-8 relative">
      {/* 1. FILTER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border p-6 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students name or code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* View toggles & Add actions */}
        <div className="flex items-center gap-4">
          <div className="flex bg-background border border-border rounded-xl p-1 text-muted-text">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-surface text-foreground shadow-sm" : "hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === "grid" ? "bg-surface text-foreground shadow-sm" : "hover:text-foreground"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setRegisterModalOpen(true);
            }}
            className="py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* 2. DIRECTORY VIEWS */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredStudents.length > 0 ? (
        viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-background border-b border-border font-bold text-muted-text text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Student Name</th>
                    <th className="p-4">Student Code</th>
                    <th className="p-4">Class Target</th>
                    <th className="p-4">Academic Year</th>
                    <th className="p-4">Parent / Guardian</th>
                    <th className="p-4 text-center">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-foreground">
                        {student.name}
                      </td>
                      <td className="p-4 text-muted-text font-mono text-xs">
                        {student.studentCode}
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        Class {student.className}
                      </td>
                      <td className="p-4 text-muted-text">
                        {student.year}
                      </td>
                      <td className="p-4 space-y-0.5">
                        <span className="font-semibold text-foreground block text-xs">
                          {student.parentName}
                        </span>
                        {student.parentEmail && (
                          <span className="text-[10px] text-muted-text block leading-none">
                            {student.parentEmail}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedStudentId(student._id)}
                          className="py-1 px-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID / CARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{student.name}</h4>
                      <span className="text-[10px] font-mono text-muted-text block">{student.studentCode}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-text">Class Workspace</span>
                      <span className="text-foreground">Class {student.className}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-text">Parent Name</span>
                      <span className="text-foreground">{student.parentName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudentId(student._id)}
                  className="mt-6 w-full py-2 bg-background hover:bg-primary/5 text-primary text-xs font-semibold border border-primary/10 hover:border-primary/20 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Academic Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 text-muted-text text-sm">
          No students registered matching criteria. Use "Register Student" to expand database.
        </div>
      )}

      {/* 3. REGISTER STUDENT MODAL */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Register New Student Record</h3>
              <button onClick={() => setRegisterModalOpen(false)}>
                <X className="w-5 h-5 text-muted-text" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-danger/5 border border-danger/25 text-danger rounded-xl text-xs">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-success/5 border border-success/25 text-success rounded-xl text-xs flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Ineza Marie"
                    className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    National Student ID Code
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="e.g. ST-2026-99"
                    className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Class Destination
                  </label>
                  <div className="py-2 px-3 bg-background border border-border rounded-xl text-sm font-semibold text-muted-text">
                    Class {className || "S1"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Birth Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-3">
                  Parent / Guardian Information
                </span>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Parent Full Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Gasana Jean"
                      className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Parent Email Address
                      </label>
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@gmail.rw"
                        className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Parent Phone Contact
                      </label>
                      <input
                        type="text"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="+250788111222"
                        className="w-full py-2 px-3 border border-border bg-background rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerStudentMutation.isPending}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-primary/10 mt-6"
              >
                {registerStudentMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>Register Student File</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. STUDENT DETAILS DRAWER (SLIDE IN RIGHT) */}
      {selectedStudentId && selectedStudent && (
        <div className="fixed inset-0 z-40 bg-black/30 flex justify-end">
          <div className="w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col z-50">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">{selectedStudent.name}</h3>
                  <span className="text-[10px] font-mono text-muted-text block">{selectedStudent.studentCode}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="p-1 rounded-lg border border-border hover:bg-background cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-text" />
              </button>
            </div>

            {/* Profile Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Alert Warning for fail risk */}
              {needsIntervention ? (
                <div className="p-4 bg-danger/5 border border-danger/25 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-danger">Requires Academic Support</h4>
                    <p className="text-[10px] text-danger/80 mt-0.5">
                      Student is performing below the class average with a {studentAvg}% average. They are flagged for intervention support.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-success/5 border border-success/20 rounded-2xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-success">Good Standing</h4>
                    <p className="text-[10px] text-success/80 mt-0.5">
                      Performing well with a class-average coefficient of {studentAvg}%.
                    </p>
                  </div>
                </div>
              )}

              {/* KPI average details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border border-border p-4 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Overall Average</span>
                  <span className={`text-2xl font-extrabold block mt-1 font-display ${needsIntervention ? "text-danger" : "text-primary"}`}>
                    {studentAvg}%
                  </span>
                </div>
                <div className="bg-background border border-border p-4 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Graded Tests</span>
                  <span className="text-2xl font-extrabold text-foreground block mt-1 font-display">
                    {studentMarks.length}
                  </span>
                </div>
              </div>

              {/* Recharts progress history */}
              <div className="bg-background border border-border p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-foreground mb-4">Historical Grade Progress Trend</h4>
                <div className="h-[180px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" fontSize={9} stroke="#64748B" />
                        <YAxis domain={[0, 100]} fontSize={9} stroke="#64748B" />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] text-muted-text">
                      No assessment results recorded to plot trend.
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground border-b border-border pb-2">Parent/Guardian Contact File</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-background border border-border rounded-xl flex items-center gap-2.5">
                    <User className="w-4 h-4 text-muted-text" />
                    <div>
                      <span className="text-[10px] text-muted-text block leading-none">Guardian Name</span>
                      <span className="font-semibold text-foreground">{selectedStudent.parentName}</span>
                    </div>
                  </div>
                  {selectedStudent.parentPhone && (
                    <div className="p-3 bg-background border border-border rounded-xl flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-muted-text" />
                      <div>
                        <span className="text-[10px] text-muted-text block leading-none">Guardian Phone</span>
                        <span className="font-semibold text-foreground">{selectedStudent.parentPhone}</span>
                      </div>
                    </div>
                  )}
                  {selectedStudent.parentEmail && (
                    <div className="p-3 bg-background border border-border rounded-xl flex items-center gap-2.5 md:col-span-2">
                      <Mail className="w-4 h-4 text-muted-text" />
                      <div>
                        <span className="text-[10px] text-muted-text block leading-none">Guardian Email</span>
                        <span className="font-semibold text-foreground">{selectedStudent.parentEmail}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment reports list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground border-b border-border pb-2">Issued Report Cards</h4>
                <div className="space-y-2">
                  {studentReports.length > 0 ? (
                    studentReports.map((rep: any) => (
                      <div key={rep._id} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <div>
                            <span className="text-xs font-bold text-foreground block uppercase">
                              {rep.reportType} report
                            </span>
                            <span className="text-[9px] text-muted-text">{rep.year} • {rep.term || "Annual"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-primary block">{rep.average}% Avg</span>
                          <span className="text-[9px] text-muted-text">Grade {rep.grade}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-text text-center py-4">
                      No report cards generated yet. Use the Reports module to create report cards.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
