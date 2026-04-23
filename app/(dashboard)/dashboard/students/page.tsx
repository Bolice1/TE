"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
  Search,
  Users,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  isOrphan: boolean;
  enrollmentDate: string;
  parents: { name: string; phone: string }[];
  guardianInfo?: { name?: string; phone?: string };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
      });

      const response = await fetch(`/api/students?${params}`);
      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/students/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Student removed successfully");
        fetchStudents();
      } else {
        toast.error("Failed to remove student");
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
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage your students and their information
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
        />
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">
              {search
                ? "Try a different search term"
                : "Start by adding your first student"}
            </p>
            {!search && (
              <Link href="/dashboard/students/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card key={student._id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {student.gender || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/students/${student._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(student._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {student.isOrphan ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                          Guardian Care
                        </span>
                        {student.guardianInfo?.name && (
                          <span className="text-muted-foreground truncate">
                            {student.guardianInfo.name}
                          </span>
                        )}
                      </div>
                    ) : student.parents.length > 0 ? (
                      <div className="text-muted-foreground">
                        Contact: {student.parents[0].phone}
                      </div>
                    ) : null}
                    <div className="text-muted-foreground">
                      Enrolled:{" "}
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </div>
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
                of {pagination.total} students
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
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student? This action will
              deactivate their account but preserve their records.
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
