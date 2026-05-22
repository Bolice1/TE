"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import { getCurrentAcademicYear } from "@/utils/academic-year";
import {
  Calendar,
  BookOpen,
  Plus,
  Layers,
  Sparkles,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const { academicYear, className, availableClasses } = useFilters();
  const currentAcademicYear = getCurrentAcademicYear();
  const isHistoricalView = academicYear < currentAcademicYear;
  const [activeTab, setActiveTab] = useState<"schedule" | "create-assignment" | "courses">("schedule");

  // State for Course Form
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseOutcome, setCourseOutcome] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [periods, setPeriods] = useState("3");
  const [courseClassName, setCourseClassName] = useState(className || "S1");

  // State for Assignment Form
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignType, setAssignType] = useState<"assignment" | "quiz">("assignment");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [maxScore, setMaxScore] = useState("10");
  const [assignWeight, setAssignWeight] = useState("1");
  const [assignDate, setAssignDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [compTagInput, setCompTagInput] = useState("");
  const [competencyFocus, setCompetencyFocus] = useState<string[]>(["Critical Thinking", "Research"]);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Queries
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["assignments-list", className, academicYear],
    queryFn: () => api.assignments.list({ className: className || undefined, year: academicYear }),
  });

  const assignments = assignmentsData?.assignments || [];
  const courses = assignmentsData?.courses || [];

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: api.courses.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments-list"] });
      queryClient.invalidateQueries({ queryKey: ["courses-list"] });
      setCourseName("");
      setCourseCode("");
      setCourseOutcome("");
      setCourseDesc("");
      setPeriods("3");
      setCourseClassName(className || "S1");
      setFormSuccess("Course created successfully!");
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to create course.");
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: api.assignments.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      setAssignTitle("");
      setAssignDesc("");
      setAssignDate("");
      setDueDate("");
      setStartTime("");
      setEndTime("");
      setFormSuccess("Assessment scheduled successfully!");
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to schedule assessment.");
    },
  });

  const handleAddCompetencyTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (compTagInput.trim() && !competencyFocus.includes(compTagInput.trim())) {
      setCompetencyFocus([...competencyFocus, compTagInput.trim()]);
      setCompTagInput("");
    }
  };

  const handleRemoveCompetencyTag = (tag: string) => {
    setCompetencyFocus(competencyFocus.filter((t) => t !== tag));
  };

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!courseName || !courseOutcome || !periods) {
      setFormError("Name, Learning Outcome and Periods per week are required.");
      return;
    }
    if (!courseClassName) {
      setFormError("Please choose the class this course belongs to.");
      return;
    }
    createCourseMutation.mutate({
      name: courseName,
      code: courseCode || undefined,
      className: courseClassName,
      year: currentAcademicYear,
      outcome: courseOutcome,
      description: courseDesc || undefined,
      numberOfPeriodsInAWeek: Number(periods),
    });
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const selectedCourse = courses.find((c: any) => c._id === selectedCourseId);
    if (!selectedCourse) {
      setFormError("Please select a course.");
      return;
    }
    if (!assignTitle || !maxScore || !assignWeight) {
      setFormError("Title, max score, and weight are required.");
      return;
    }

    createAssignmentMutation.mutate({
      courseId: selectedCourseId,
      type: assignType,
      title: assignTitle,
      description: assignDesc || undefined,
      className: selectedCourse.className,
      year: selectedCourse.year,
      maxScore: Number(maxScore),
      weight: Number(assignWeight),
      assignmentDate: assignDate ? new Date(assignDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      startTime: startTime ? new Date(`${assignDate || new Date().toISOString().slice(0, 10)}T${startTime}`) : undefined,
      endTime: endTime ? new Date(`${assignDate || new Date().toISOString().slice(0, 10)}T${endTime}`) : undefined,
      competencyFocus,
    });
  };

  return (
    <div className="space-y-8">
      {/* Sub tabs */}
      <div className="flex border-b border-border text-sm">
        <button
          onClick={() => {
            setActiveTab("schedule");
            setFormError(null);
            setFormSuccess(null);
          }}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "schedule"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          Assessment Schedule
        </button>
        <button
          onClick={() => {
            setActiveTab("create-assignment");
            setFormError(null);
            setFormSuccess(null);
          }}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "create-assignment"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          Plan Assessment Task
        </button>
        <button
          onClick={() => {
            setActiveTab("courses");
            setFormError(null);
            setFormSuccess(null);
          }}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "courses"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          Manage Courses
        </button>
      </div>

      {formError && (
        <div className="p-4 bg-danger/5 border border-danger/25 text-danger rounded-xl text-sm max-w-2xl">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="p-4 bg-success/5 border border-success/25 text-success rounded-xl text-sm max-w-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>{formSuccess}</span>
        </div>
      )}

      {isHistoricalView && (
        <div className="max-w-3xl rounded-2xl border border-warning/25 bg-warning/5 p-4 text-sm text-foreground">
          <p className="font-semibold">You are viewing historical data for {academicYear}.</p>
          <p className="mt-1 text-xs text-muted-text">
            Past academic years are available for review only. New courses and assessments are created in {currentAcademicYear}.
          </p>
        </div>
      )}

      {/* 1. SCHEDULE TIMELINE TAB */}
      {activeTab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assessment timeline */}
          <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-6">Upcoming Assessment Timeline</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : assignments.length > 0 ? (
              <div className="relative border-l-2 border-border pl-6 ml-3 space-y-8">
                {assignments.map((assign: any) => (
                  <div key={assign._id} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow" />

                    <div className="bg-background border border-border p-5 rounded-2xl hover:shadow-md transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {assign.type}
                        </span>
                        <span className="text-xs text-muted-text flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due Date: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : "Open ended"}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-foreground mb-1">{assign.title}</h4>
                      <p className="text-xs text-muted-text mb-3">{assign.description || "No description provided."}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs border-t border-border/60 pt-3 mt-3">
                        <span className="font-semibold text-foreground">
                          Course: <span className="font-normal text-muted-text">{assign.course?.name} ({assign.className})</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          Weight: <span className="font-normal text-muted-text">{assign.weight || 1}x</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          Max Score: <span className="font-normal text-muted-text">{assign.maxScore} Marks</span>
                        </span>
                      </div>

                      {/* Competency indicators */}
                      {assign.competencyFocus && assign.competencyFocus.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {assign.competencyFocus.map((focus: string) => (
                            <span key={focus} className="text-[9px] font-medium bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-lg">
                              🎯 {focus}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-text text-sm space-y-4">
                <p>No planned assessments found. Schedule an assessment to get started.</p>
                {courses.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("courses")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow shadow-primary/15"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Course</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Course List Card */}
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-foreground mb-4">Active Courses ({courses.length})</h3>
            <div className="space-y-3 overflow-y-auto max-h-[450px]">
              {courses.length > 0 ? (
                courses.map((course: any) => (
                  <div key={course._id} className="p-4 bg-background border border-border rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold text-foreground">{course.name}</h4>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {course.code || "N/A"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-text mb-3 line-clamp-2">{course.outcome}</p>
                    <div className="flex justify-between text-[9px] font-semibold text-muted-text border-t border-border/60 pt-2">
                      <span>Class {course.className} • {course.year}</span>
                      <span>{course.numberOfPeriodsInAWeek} periods/wk</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-text text-center py-10">
                  No registered courses. Click "Manage Courses" to create one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE ASSIGNMENT FORM TAB */}
      {activeTab === "create-assignment" && (
        <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm max-w-3xl">
          <h3 className="text-lg font-bold text-foreground mb-6">Plan Assessment Task</h3>
          {courses.length === 0 && (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              <p className="font-semibold">Create a course first before planning assessments.</p>
              <p className="mt-1 text-xs text-muted-text">
                Courses belong to a teacher and class workspace. Once a course is created, it will appear here for assignment planning.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow shadow-primary/15"
              >
                <Plus className="h-4 w-4" />
                <span>Go To Course Setup</span>
              </button>
            </div>
          )}
          <form onSubmit={handleCreateAssignmentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Select Associated Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  required
                  disabled={courses.length === 0 || isHistoricalView}
                >
                  <option value="">Choose Course...</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {course.name} (Class {course.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Assessment Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      checked={assignType === "assignment"}
                      onChange={() => setAssignType("assignment")}
                      className="accent-primary"
                    />
                    Assignment
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      checked={assignType === "quiz"}
                      onChange={() => setAssignType("quiz")}
                      className="accent-primary"
                    />
                    Quiz / Exam
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Assessment Title
              </label>
              <input
                type="text"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                placeholder="e.g. Algebra I Test, Term 1 Projects"
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Description / Rubric Notes
              </label>
              <textarea
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
                placeholder="Details of the assessment task..."
                rows={3}
                className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Maximum Attainable Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Weight Multiplier (Co-efficient)
                </label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={assignWeight}
                  onChange={(e) => setAssignWeight(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Due Date (Soft limit)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Start Time (Optional)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  End Time (Optional)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Competency Focus array tags */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                CBC Competency Focus Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={compTagInput}
                  onChange={(e) => setCompTagInput(e.target.value)}
                  placeholder="e.g. Critical Thinking, Cooperation, Problem Solving"
                  className="flex-1 py-2 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCompetencyTag}
                  className="py-2 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {competencyFocus.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-xl font-medium"
                  >
                    <span>🎯 {tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetencyTag(tag)}
                      className="hover:text-danger text-muted-text text-[10px] font-bold ml-1.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={createAssignmentMutation.isPending || isHistoricalView}
              className="py-3 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-75"
            >
              {createAssignmentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Publish Assessment Task</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. MANAGE COURSES TAB */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create course form */}
          <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm lg:col-span-1">
            <h3 className="text-base font-bold text-foreground mb-6">Create New Course Workspace</h3>
            <form onSubmit={handleCreateCourseSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Course Name (Subject)
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Mathematics, English Literacy"
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Course Reference Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. MATH-S1, ENG-P4"
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Learning Outcome Focus (Rwanda CBC outcome)
                </label>
                <textarea
                  value={courseOutcome}
                  onChange={(e) => setCourseOutcome(e.target.value)}
                  placeholder="Identify algebraic concepts and apply..."
                  rows={2}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Brief Course Syllabus Description
                </label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Additional syllabus notes..."
                  rows={2}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm"
                />
              </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1.5 uppercase">
                    Class Target
                  </label>
                  <select
                    value={courseClassName}
                    onChange={(e) => setCourseClassName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Periods in a Week
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={periods}
                    onChange={(e) => setPeriods(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createCourseMutation.isPending || isHistoricalView}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow shadow-primary/15"
              >
                {createCourseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Register Course</span>
              </button>
            </form>
          </div>

          {/* Detailed Course Benchmarking */}
          <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-6">Registered Course Catalog</h3>
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.map((course: any) => (
                  <div key={course._id} className="p-5 bg-background border border-border rounded-2xl hover:shadow transition-all flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm">{course.name}</h4>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {course.code || "No Code"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary">
                        CBC Outcome: <span className="font-normal text-muted-text">{course.outcome}</span>
                      </p>
                      {course.description && (
                        <p className="text-xs text-muted-text">{course.description}</p>
                      )}
                    </div>
                    <div className="md:text-right shrink-0 border-t md:border-t-0 border-border pt-3 md:pt-0 flex md:flex-col justify-between items-end gap-1.5 text-xs text-muted-text font-medium">
                      <span>Class target: <strong className="text-foreground">{course.className}</strong></span>
                      <span>Year: <strong className="text-foreground">{course.year}</strong></span>
                      <span>Weekly Periods: <strong className="text-foreground">{course.numberOfPeriodsInAWeek}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-text text-sm">
                  No courses registered in this class workspace yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
