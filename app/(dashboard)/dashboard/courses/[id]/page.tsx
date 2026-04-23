"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CourseForm } from "@/components/courses/course-form";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  BookOpen,
} from "lucide-react";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  isOrphan: boolean;
}

interface Course {
  _id: string;
  name: string;
  description?: string;
  level: string;
  academicYear: string;
  term: "Term 1" | "Term 2" | "Term 3";
  students: Student[];
}

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const response = await fetch(`/api/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
      } else {
        toast.error("Course not found");
        router.push("/dashboard/courses");
      }
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch("/api/students?limit=1000");
      const data = await response.json();
      if (data.success) {
        setAllStudents(data.data);
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchAllStudents();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) return;
    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });
      if (response.ok) {
        toast.success("Students enrolled successfully");
        setSelectedStudents([]);
        fetchCourse();
      } else {
        toast.error("Failed to enroll students");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/courses/${id}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (response.ok) {
        toast.success("Student removed from course");
        fetchCourse();
      } else {
        toast.error("Failed to remove student");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!course) return null;

  const enrolledIds = new Set(course.students.map((s) => s._id));
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s._id));

  const formData = {
    name: course.name,
    description: course.description || "",
    level: course.level,
    academicYear: course.academicYear,
    term: course.term,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{course.name}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {course.level}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {course.academicYear} - {course.term}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students.length} students
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="edit">Edit Course</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Enrolled Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrolled Students ({course.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.students.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No students enrolled yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {course.students.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {student.gender || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove {student.firstName} {student.lastName} from
                                this course? This won&apos;t delete the student
                                from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveStudent(student._id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : availableStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    All your students are enrolled in this course
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                      {availableStudents.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedStudents((prev) =>
                              prev.includes(student._id)
                                ? prev.filter((id) => id !== student._id)
                                : [...prev, student._id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedStudents.includes(student._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents((prev) => [
                                  ...prev,
                                  student._id,
                                ]);
                              } else {
                                setSelectedStudents((prev) =>
                                  prev.filter((id) => id !== student._id)
                                );
                              }
                            }}
                          />
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {student.gender || "Not specified"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleEnroll}
                      disabled={selectedStudents.length === 0 || enrolling}
                      className="w-full"
                    >
                      {enrolling && <Spinner className="mr-2" />}
                      Enroll {selectedStudents.length} Student
                      {selectedStudents.length !== 1 ? "s" : ""}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <CourseForm initialData={formData} courseId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
