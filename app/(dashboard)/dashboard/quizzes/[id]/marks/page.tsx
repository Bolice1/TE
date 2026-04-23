"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { GRADING_SCALE } from "@/lib/utils/grading";
import { ArrowLeft, Save, Users, FileQuestion } from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Mark {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string };
  marksObtained: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
}

interface Quiz {
  _id: string;
  title: string;
  type: string;
  totalMarks: number;
  courseId: {
    _id: string;
    name: string;
    level: string;
    students: Student[];
  };
  marks: Mark[];
}

interface MarkEntry {
  studentId: string;
  marksObtained: number;
  remarks: string;
}

interface QuizMarksPageProps {
  params: Promise<{ id: string }>;
}

export default function QuizMarksPage({ params }: QuizMarksPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markEntries, setMarkEntries] = useState<Record<string, MarkEntry>>({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${id}`);
        const data = await response.json();
        if (data.success) {
          setQuiz(data.data);
          
          // Initialize mark entries from existing marks
          const entries: Record<string, MarkEntry> = {};
          const students = data.data.courseId?.students || [];
          const existingMarks = data.data.marks || [];
          
          students.forEach((student: Student) => {
            const existingMark = existingMarks.find(
              (m: Mark) => m.studentId._id === student._id
            );
            entries[student._id] = {
              studentId: student._id,
              marksObtained: existingMark?.marksObtained ?? 0,
              remarks: existingMark?.remarks || "",
            };
          });
          setMarkEntries(entries);
        } else {
          toast.error("Quiz not found");
          router.push("/dashboard/quizzes");
        }
      } catch {
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, router]);

  const updateMark = (studentId: string, field: keyof MarkEntry, value: string | number) => {
    setMarkEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const calculateGradeForMark = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    for (const grade of GRADING_SCALE) {
      if (percentage >= grade.min && percentage <= grade.max) {
        return { percentage: percentage.toFixed(1), ...grade };
      }
    }
    return GRADING_SCALE[GRADING_SCALE.length - 1];
  };

  const handleSave = async () => {
    if (!quiz) return;
    setSaving(true);

    try {
      const marks = Object.values(markEntries).map((entry) => ({
        studentId: entry.studentId,
        marksObtained: Number(entry.marksObtained),
        remarks: entry.remarks,
      }));

      const response = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id, marks }),
      });

      if (response.ok) {
        toast.success("Marks saved successfully");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save marks");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!quiz) return null;

  const students = quiz.courseId?.students || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quizzes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{quiz.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <FileQuestion className="h-4 w-4" />
                {quiz.type} - {quiz.totalMarks} marks
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {students.length} students
              </span>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Marks
        </Button>
      </div>

      {/* Grading Scale Reference */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Grading Scale</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {GRADING_SCALE.map((grade) => (
              <Badge key={grade.grade} variant="outline" className="text-xs">
                {grade.grade} ({grade.min}-{grade.max}%): {grade.description}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marks Entry */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students enrolled</h3>
            <p className="text-muted-foreground mb-4">
              Enroll students in the course first to record marks
            </p>
            <Link href={`/dashboard/courses/${quiz.courseId._id}`}>
              <Button>Go to Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => {
            const entry = markEntries[student._id] || {
              studentId: student._id,
              marksObtained: 0,
              remarks: "",
            };
            const gradeInfo = calculateGradeForMark(
              Number(entry.marksObtained),
              quiz.totalMarks
            );

            return (
              <Card key={student._id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={quiz.totalMarks}
                          className="w-20"
                          value={entry.marksObtained}
                          onChange={(e) =>
                            updateMark(
                              student._id,
                              "marksObtained",
                              e.target.value
                            )
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          / {quiz.totalMarks}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            gradeInfo.grade === "F" ? "destructive" : "default"
                          }
                          className="w-16 justify-center"
                        >
                          {gradeInfo.grade} ({gradeInfo.percentage}%)
                        </Badge>
                      </div>

                      <Input
                        placeholder="Remarks (optional)"
                        className="w-full sm:w-40"
                        value={entry.remarks}
                        onChange={(e) =>
                          updateMark(student._id, "remarks", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
