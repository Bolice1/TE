"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Keyboard,
  Info,
} from "lucide-react";

export default function MarksEntryPage() {
  const queryClient = useQueryClient();
  const { academicYear, term, className, courseId } = useFilters();

  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  // Grid editing states
  const [scores, setScores] = useState<Record<string, string>>({}); // studentId -> score string
  const [comments, setComments] = useState<Record<string, string>>({}); // studentId -> comment string

  // Keep references to inputs for keyboard arrow navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 1. Fetch Students
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ["marks-students", className, academicYear],
    queryFn: () => api.students.list({ className: className || undefined, year: academicYear }),
    enabled: !!className,
  });
  const students = studentsData?.students || [];

  // 2. Fetch Assignments for Course
  const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
    queryKey: ["marks-assignments", className, academicYear, courseId],
    queryFn: () => api.assignments.list({ className: className || undefined, year: academicYear, courseId: courseId || undefined }),
    enabled: !!courseId,
  });
  const assignments = assignmentsData?.assignments || [];
  const selectedAssignment = assignments.find((a: any) => a._id === selectedAssignmentId);

  // 3. Fetch Existing Marks
  const { data: marksData, isLoading: loadingMarks } = useQuery({
    queryKey: ["marks-list", academicYear, term, className, courseId, selectedAssignmentId],
    queryFn: () =>
      api.marks.list({
        year: academicYear,
        term,
        className: className || undefined,
        courseId: courseId || undefined,
      }),
    enabled: !!courseId && !!selectedAssignmentId,
  });
  const existingMarks = marksData?.marks || [];

  // Populate local states when existing marks are fetched
  useEffect(() => {
    if (existingMarks.length > 0 && selectedAssignmentId) {
      const newScores: Record<string, string> = {};
      const newComments: Record<string, string> = {};

      students.forEach((student: any) => {
        const studentMark = existingMarks.find(
          (m: any) =>
            m.student?._id === student._id &&
            m.assignment?._id === selectedAssignmentId
        );
        newScores[student._id] = studentMark ? studentMark.score.toString() : "";
        newComments[student._id] = studentMark ? studentMark.comment || "" : "";
      });

      setScores(newScores);
      setComments(newComments);
    } else {
      // Clear scores if assignment changes or has no marks
      const clearedScores: Record<string, string> = {};
      const clearedComments: Record<string, string> = {};
      students.forEach((student: any) => {
        clearedScores[student._id] = "";
        clearedComments[student._id] = "";
      });
      setScores(clearedScores);
      setComments(clearedComments);
    }
  }, [existingMarks, students, selectedAssignmentId]);

  // Mutations
  const saveMarkMutation = useMutation({
    mutationFn: (payload: {
      studentId: string;
      score: number;
      comment: string;
      markId?: string;
    }) => {
      if (payload.markId) {
        return api.marks.update(payload.markId, {
          score: payload.score,
          comment: payload.comment,
        });
      } else {
        return api.marks.save({
          studentId: payload.studentId,
          courseId,
          assignmentId: selectedAssignmentId,
          score: payload.score,
          term,
          year: academicYear,
          comment: payload.comment || undefined,
        });
      }
    },
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["marks-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
    onError: (err: any) => {
      setSaveStatus("error");
      setSaveErrorMessage(err.message || "Failed to autosave mark.");
    },
  });

  const handleCellBlur = (studentId: string) => {
    const rawScore = scores[studentId];
    const comment = comments[studentId] || "";

    if (rawScore === "") return; // Skip saving empty scores

    const scoreNum = Number(rawScore);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setSaveStatus("error");
      setSaveErrorMessage("Score must be a positive number.");
      return;
    }

    if (selectedAssignment && scoreNum > selectedAssignment.maxScore) {
      setSaveStatus("error");
      setSaveErrorMessage(
        `Score cannot exceed max marks of ${selectedAssignment.maxScore}.`
      );
      return;
    }

    // Check if mark already exists
    const existingMark = existingMarks.find(
      (m: any) =>
        m.student?._id === studentId && m.assignment?._id === selectedAssignmentId
    );

    saveMarkMutation.mutate({
      studentId,
      score: scoreNum,
      comment,
      markId: existingMark?._id,
    });
  };

  // Keyboard navigation listener helper
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: "score" | "comment"
  ) => {
    const totalStudents = students.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.min(rowIndex + 1, totalStudents - 1);
      const nextStudentId = students[nextIndex]._id;
      inputRefs.current[`${nextStudentId}-${field}`]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = Math.max(rowIndex - 1, 0);
      const prevStudentId = students[prevIndex]._id;
      inputRefs.current[`${prevStudentId}-${field}`]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      // On enter, trigger blur (autosave) and move down
      e.currentTarget.blur();
      const nextIndex = Math.min(rowIndex + 1, totalStudents - 1);
      if (nextIndex !== rowIndex) {
        const nextStudentId = students[nextIndex]._id;
        inputRefs.current[`${nextStudentId}-${field}`]?.focus();
      }
    } else if (e.key === "ArrowRight" && field === "score") {
      // Focus comment in same row
      const currentStudentId = students[rowIndex]._id;
      inputRefs.current[`${currentStudentId}-comment`]?.focus();
    } else if (e.key === "ArrowLeft" && field === "comment") {
      // Focus score in same row
      const currentStudentId = students[rowIndex]._id;
      inputRefs.current[`${currentStudentId}-score`]?.focus();
    }
  };

  // Check if course filter is set
  if (!courseId) {
    return (
      <div className="p-8 border border-border bg-surface rounded-2xl text-center max-w-md mx-auto space-y-4 shadow-sm">
        <Info className="w-8 h-8 text-primary mx-auto" />
        <h3 className="text-base font-bold text-foreground">Select a Course</h3>
        <p className="text-xs text-muted-text">
          Use the persistent global filter bar at the top to choose a course first before entering students marks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Configuration Header Card */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">CBC Academic Marks Grid</h3>
          <p className="text-xs text-muted-text">
            Enter marks for class: <strong>{className || "All"}</strong> • Academic Year: <strong>{academicYear}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-text shrink-0">Select Assessment:</span>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="py-2 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">Choose task...</option>
              {assignments.map((assign: any) => (
                <option key={assign._id} value={assign._id}>
                  {assign.title} ({assign.type})
                </option>
              ))}
            </select>
          </div>

          {/* Autosave indicators */}
          <div className="text-xs">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-primary font-bold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Autosaving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-success font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                All changes saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-danger font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                Error: {saveErrorMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spreadsheet Workspace */}
      {selectedAssignmentId ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-background border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-text flex items-center gap-1">
              <Keyboard className="w-4 h-4 text-primary" />
              Keyboard Help: Use Arrow keys to navigate cells. Press Enter to submit and move down.
            </span>
            <span className="text-xs font-bold text-foreground">
              Maximum Marks: <strong className="text-primary">{selectedAssignment?.maxScore || 10} Marks</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-background border-b border-border font-bold text-muted-text text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Student Name</th>
                  <th className="p-4">Student Code</th>
                  <th className="p-4 w-36">Score (Max: {selectedAssignment?.maxScore || 10})</th>
                  <th className="p-4 pl-6">Assessment Rubric Comment</th>
                  <th className="p-4 text-center w-24">Sync State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student: any, rowIndex: number) => {
                  const studentMark = existingMarks.find(
                    (m: any) =>
                      m.student?._id === student._id &&
                      m.assignment?._id === selectedAssignmentId
                  );
                  const isGraded = studentMark !== undefined;

                  return (
                    <tr key={student._id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-foreground">
                        {student.name}
                      </td>
                      <td className="p-4 text-muted-text font-mono text-xs">
                        {student.studentCode}
                      </td>
                      <td className="p-3">
                        <input
                          ref={(el) => {
                            inputRefs.current[`${student._id}-score`] = el;
                          }}
                          type="text"
                          value={scores[student._id] ?? ""}
                          onChange={(e) =>
                            setScores({ ...scores, [student._id]: e.target.value })
                          }
                          onBlur={() => handleCellBlur(student._id)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, "score")}
                          placeholder="--"
                          className="w-full text-center py-1.5 rounded-lg border border-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </td>
                      <td className="p-3 pl-6">
                        <input
                          ref={(el) => {
                            inputRefs.current[`${student._id}-comment`] = el;
                          }}
                          type="text"
                          value={comments[student._id] ?? ""}
                          onChange={(e) =>
                            setComments({
                              ...comments,
                              [student._id]: e.target.value,
                            })
                          }
                          onBlur={() => handleCellBlur(student._id)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, "comment")}
                          placeholder="Enter observation notes..."
                          className="w-full py-1.5 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </td>
                      <td className="p-4 text-center">
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-text bg-background px-2 py-0.5 rounded-full border border-border">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 border border-border bg-surface rounded-2xl text-center max-w-md mx-auto space-y-4 shadow-sm">
          <FileCheck className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-base font-bold text-foreground">Select an Assessment Task</h3>
          <p className="text-xs text-muted-text">
            Choose an assignment from the dropdown above to load the student spreadsheet roster.
          </p>
        </div>
      )}
    </div>
  );
}
