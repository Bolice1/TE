"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  FileQuestion,
  Edit,
  Trash2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  type: string;
  totalMarks: number;
  weight?: number;
  dueDate?: string;
  academicYear: string;
  term: string;
  courseId: {
    _id: string;
    name: string;
    level: string;
  };
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const quizTypes = ["CAT", "Exam", "Assignment", "Other"];

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (type) params.set("type", type);

      const response = await fetch(`/api/quizzes?${params}`);
      const data = await response.json();

      if (data.success) {
        setQuizzes(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, type]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/quizzes/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Quiz deleted successfully");
        fetchQuizzes();
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const getTypeBadgeVariant = (quizType: string) => {
    switch (quizType) {
      case "Exam":
        return "destructive";
      case "CAT":
        return "default";
      case "Assignment":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground">
            Create and manage assessments for your courses
          </p>
        </div>
        <Link href="/dashboard/quizzes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Quiz Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {quizTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {type && (
          <Button variant="ghost" size="sm" onClick={() => setType("")}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              {type
                ? "Try a different filter"
                : "Create your first quiz to get started"}
            </p>
            {!type && (
              <Link href="/dashboard/quizzes/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {quiz.courseId?.name || "Unknown Course"} -{" "}
                        {quiz.courseId?.level}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/quizzes/${quiz._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(quiz._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getTypeBadgeVariant(quiz.type)}>
                      {quiz.type}
                    </Badge>
                    <Badge variant="outline">{quiz.totalMarks} marks</Badge>
                    {quiz.weight && (
                      <Badge variant="outline">{quiz.weight}% weight</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {quiz.academicYear} - {quiz.term}
                    </span>
                    <Link href={`/dashboard/quizzes/${quiz._id}/marks`}>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Record Marks
                      </Button>
                    </Link>
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
                of {pagination.total} quizzes
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
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This will also delete
              all associated marks. This action cannot be undone.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
