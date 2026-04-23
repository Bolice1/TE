"use client";

import { useState } from "react";
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

interface CourseFormData {
  name: string;
  description: string;
  level: string;
  academicYear: string;
  term: "Term 1" | "Term 2" | "Term 3";
}

interface CourseFormProps {
  initialData?: CourseFormData;
  courseId?: string;
}

const currentYear = new Date().getFullYear();
const academicYears = [
  `${currentYear - 1}-${currentYear}`,
  `${currentYear}-${currentYear + 1}`,
  `${currentYear + 1}-${currentYear + 2}`,
];

const levels = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Secondary 1",
  "Secondary 2",
  "Secondary 3",
  "Secondary 4",
  "Secondary 5",
  "Secondary 6",
];

const terms = ["Term 1", "Term 2", "Term 3"] as const;

const defaultFormData: CourseFormData = {
  name: "",
  description: "",
  level: "",
  academicYear: `${currentYear}-${currentYear + 1}`,
  term: "Term 1",
};

export function CourseForm({ initialData, courseId }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(
    initialData || defaultFormData
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = courseId ? `/api/courses/${courseId}` : "/api/courses";
      const method = courseId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save course");
      }

      toast.success(
        courseId ? "Course updated successfully" : "Course created successfully"
      );
      router.push("/dashboard/courses");
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
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics, English, Science"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the course..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData({ ...formData, level: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) =>
                  setFormData({ ...formData, academicYear: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term *</Label>
              <Select
                value={formData.term}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    term: value as "Term 1" | "Term 2" | "Term 3",
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2" />}
          {courseId ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
