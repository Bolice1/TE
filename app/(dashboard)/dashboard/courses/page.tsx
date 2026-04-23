"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  BookOpen,
  Users,
  Calendar,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Course {
  _id: string;
  name: string;
  description?: string;
  level: string;
  academicYear: string;
  term: string;
  students: { _id: string; firstName: string; lastName: string }[];
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const currentYear = new Date().getFullYear();
const academicYears = [
  `${currentYear - 1}-${currentYear}`,
  `${currentYear}-${currentYear + 1}`,
  `${currentYear + 1}-${currentYear + 2}`,
];

const terms = ["Term 1", "Term 2", "Term 3"];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (academicYear) params.set("academicYear", academicYear);
      if (term) params.set("term", term);

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, academicYear, term]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/courses/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Course archived successfully");
        fetchCourses();
      } else {
        toast.error("Failed to archive course");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Manage your courses and enrolled students
          </p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={term} onValueChange={setTerm}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {terms.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(academicYear || term) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAcademicYear("");
              setTerm("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {academicYear || term
                ? "Try different filters"
                : "Start by creating your first course"}
            </p>
            {!academicYear && !term && (
              <Link href="/dashboard/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {course.level}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/courses/${course._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(course._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {course.academicYear}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent/10 text-accent">
                      {course.term}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Users className="h-4 w-4" />
                    <span>{course.students.length} students enrolled</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} courses
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this course? This will hide it
              from your active courses but preserve all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Spinner className="mr-2" /> : null}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
