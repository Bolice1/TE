"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface QuizFormData {
  courseId: string;
  title: string;
  description: string;
  type: "CAT" | "Exam" | "Assignment" | "Other";
  totalMarks: number;
  weight: number;
  dueDate: string;
}

interface Course {
  _id: string;
  name: string;
  level: string;
  academicYear: string;
  term: string;
}

interface QuizFormProps {
  initialData?: QuizFormData;
  quizId?: string;
}

const quizTypes = ["CAT", "Exam", "Assignment", "Other"] as const;

const defaultFormData: QuizFormData = {
  courseId: "",
  title: "",
  description: "",
  type: "CAT",
  totalMarks: 100,
  weight: 0,
  dueDate: "",
};

export function QuizForm({ initialData, quizId }: QuizFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<QuizFormData>(
    initialData || defaultFormData
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses?limit=100");
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = quizId ? `/api/quizzes/${quizId}` : "/api/quizzes";
      const method = quizId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalMarks: Number(formData.totalMarks),
          weight: Number(formData.weight),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save quiz");
      }

      toast.success(
        quizId ? "Quiz updated successfully" : "Quiz created successfully"
      );
      router.push("/dashboard/quizzes");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseId">Course *</Label>
            {loadingCourses ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Loading courses...
                </span>
              </div>
            ) : (
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.name} - {course.level} ({course.academicYear},{" "}
                      {course.term})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Mid-Term Exam, CAT 1, Assignment 1"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the quiz..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Quiz Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as "CAT" | "Exam" | "Assignment" | "Other",
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {quizTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks *</Label>
              <Input
                id="totalMarks"
                type="number"
                min="1"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalMarks: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (% of final grade)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || loadingCourses}>
          {loading && <Spinner className="mr-2" />}
          {quizId ? "Update Quiz" : "Create Quiz"}
        </Button>
      </div>
    </form>
  );
}
