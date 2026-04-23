"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Users,
  BookOpen,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    students: number;
    courses: number;
    quizzes: number;
    reports: number;
  };
}

export default function AdminTeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const { data: teachers, mutate, isLoading } = useSWR<Teacher[]>(
    `/api/admin/teachers?search=${searchTerm}&status=${statusFilter}`,
    fetcher
  );

  const handleToggleStatus = async (teacher: Teacher) => {
    setIsToggling(teacher._id);
    try {
      const response = await fetch(`/api/admin/teachers/${teacher._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !teacher.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update teacher status");

      mutate();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update teacher status");
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/teachers/${selectedTeacher._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete teacher");

      mutate();
      setDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Failed to delete teacher");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Teacher Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View, manage, and delete teacher accounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Teachers</CardTitle>
          <CardDescription>
            {teachers?.length || 0} teacher(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teachers && teachers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Stats</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {teacher.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {teacher.stats.students}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {teacher.stats.courses}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {teacher.stats.reports}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {format(new Date(teacher.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={teacher.isActive ? "default" : "secondary"}
                          className={
                            teacher.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500"
                          }
                        >
                          {teacher.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/admin/teachers/${teacher._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(teacher)}
                            disabled={isToggling === teacher._id}
                          >
                            {isToggling === teacher._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : teacher.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(teacher)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Teachers will appear here once they register.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Teacher Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              teacher account and all associated data including:
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="font-medium">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTeacher.email}
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>The following data will be deleted:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>{selectedTeacher.stats.students} student record(s)</li>
                  <li>{selectedTeacher.stats.courses} course(s)</li>
                  <li>{selectedTeacher.stats.quizzes} quiz(zes)</li>
                  <li>{selectedTeacher.stats.reports} report card(s)</li>
                  <li>All marks and activity logs</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Teacher"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
