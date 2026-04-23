"use client";

import { use } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Activity,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TeacherDetails {
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
  };
  students: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    level: string;
    isActive: boolean;
  }[];
  courses: {
    _id: string;
    name: string;
    code: string;
    level: string;
    academicYear: string;
    term: string;
    isActive: boolean;
  }[];
  quizzes: {
    _id: string;
    title: string;
    type: string;
    totalMarks: number;
    course: { name: string; code: string };
  }[];
  reports: {
    _id: string;
    student: { firstName: string; lastName: string; studentId: string };
    academicYear: string;
    term: string;
    grade: string;
    percentage: number;
  }[];
  activities: {
    _id: string;
    action: string;
    details: string;
    createdAt: string;
  }[];
  stats: {
    students: number;
    courses: number;
    quizzes: number;
    reports: number;
  };
}

export default function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR<TeacherDetails>(
    `/api/admin/teachers/${id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-lg font-medium">Teacher not found</p>
        <Link href="/admin/teachers">
          <Button variant="link">Back to teachers</Button>
        </Link>
      </div>
    );
  }

  const { teacher, students, courses, quizzes, reports, activities, stats } = data;

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/teachers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {teacher.firstName} {teacher.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">Teacher Details</p>
        </div>
      </div>

      {/* Teacher Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {format(new Date(teacher.createdAt), "MMMM d, yyyy")}</span>
              </div>
              <Badge
                variant={teacher.isActive ? "default" : "secondary"}
                className={teacher.isActive ? "bg-green-500" : "bg-gray-500"}
              >
                {teacher.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <Users className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold">{stats.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <BookOpen className="mx-auto h-6 w-6 text-blue-500" />
                <p className="mt-2 text-2xl font-bold">{stats.courses}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <ClipboardList className="mx-auto h-6 w-6 text-purple-500" />
                <p className="mt-2 text-2xl font-bold">{stats.quizzes}</p>
                <p className="text-xs text-muted-foreground">Quizzes</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <FileText className="mx-auto h-6 w-6 text-green-500" />
                <p className="mt-2 text-2xl font-bold">{stats.reports}</p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different data */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Registered Students</CardTitle>
              <CardDescription>{students.length} student(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.level}</TableCell>
                          <TableCell>
                            <Badge variant={student.isActive ? "default" : "secondary"}>
                              {student.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No students registered</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>{courses.length} course(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Year/Term</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course._id}>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.level}</TableCell>
                          <TableCell>
                            {course.academicYear} - {course.term}
                          </TableCell>
                          <TableCell>
                            <Badge variant={course.isActive ? "default" : "secondary"}>
                              {course.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No courses created</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quizzes</CardTitle>
              <CardDescription>{quizzes.length} quiz(zes)</CardDescription>
            </CardHeader>
            <CardContent>
              {quizzes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Total Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz._id}>
                          <TableCell className="font-medium">{quiz.title}</TableCell>
                          <TableCell>
                            {quiz.course?.name} ({quiz.course?.code})
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{quiz.type}</Badge>
                          </TableCell>
                          <TableCell>{quiz.totalMarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No quizzes created</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Cards</CardTitle>
              <CardDescription>{reports.length} report(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell className="font-medium">
                            {report.student?.firstName} {report.student?.lastName}
                          </TableCell>
                          <TableCell>{report.academicYear}</TableCell>
                          <TableCell>{report.term}</TableCell>
                          <TableCell>
                            <Badge>{report.grade}</Badge>
                          </TableCell>
                          <TableCell>{report.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No reports generated</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Last 20 activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatAction(activity.action)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No activity recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
