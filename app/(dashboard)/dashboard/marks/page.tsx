"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
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
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

interface Mark {
  _id: string;
  studentId: { _id: string; firstName: string; lastName: string };
  quizId: { _id: string; title: string; type: string; totalMarks: number };
  courseId: { _id: string; name: string; level: string };
  marksObtained: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
  createdAt: string;
}

interface Course {
  _id: string;
  name: string;
  level: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchMarks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (courseId) params.set("courseId", courseId);

      const response = await fetch(`/api/marks?${params}`);
      const data = await response.json();

      if (data.success) {
        setMarks(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to fetch marks");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, courseId]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses?limit=100");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch {
      console.error("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [fetchMarks]);

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case "A":
        return "default";
      case "B":
      case "C":
        return "secondary";
      case "D":
      case "E":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marks Overview</h2>
        <p className="text-muted-foreground">
          View all recorded marks across your courses
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.name} - {course.level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {courseId && (
          <Button variant="ghost" size="sm" onClick={() => setCourseId("")}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Marks Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : marks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No marks recorded</h3>
            <p className="text-muted-foreground">
              {courseId
                ? "No marks found for this course"
                : "Start recording marks for your quizzes"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {marks.map((mark) => (
              <Card key={mark._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {mark.studentId.firstName} {mark.studentId.lastName}
                    </CardTitle>
                    <Badge variant={getGradeBadgeVariant(mark.grade)}>
                      {mark.grade} ({mark.percentage}%)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quiz:</span>
                    <span>{mark.quizId.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span>{mark.courseId.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marks:</span>
                    <span>
                      {mark.marksObtained} / {mark.quizId.totalMarks}
                    </span>
                  </div>
                  {mark.remarks && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">Remarks: </span>
                      {mark.remarks}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((mark) => (
                    <TableRow key={mark._id}>
                      <TableCell className="font-medium">
                        {mark.studentId.firstName} {mark.studentId.lastName}
                      </TableCell>
                      <TableCell>
                        {mark.courseId.name}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {mark.courseId.level}
                        </span>
                      </TableCell>
                      <TableCell>{mark.quizId.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{mark.quizId.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {mark.marksObtained} / {mark.quizId.totalMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getGradeBadgeVariant(mark.grade)}>
                          {mark.grade} ({mark.percentage}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {mark.remarks || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} marks
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
    </div>
  );
}
