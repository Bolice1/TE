"use client";

import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Stats {
  overview: {
    totalTeachers: number;
    activeTeachers: number;
    inactiveTeachers: number;
    totalStudents: number;
    totalCourses: number;
    totalQuizzes: number;
    totalReports: number;
    recentLogins: number;
  };
  teachersByMonth: { _id: { year: number; month: number }; count: number }[];
  studentsByLevel: { _id: string; count: number }[];
  topTeachers: { teacherName: string; studentCount: number; email: string }[];
  activityBreakdown: { _id: string; count: number }[];
  recentActivities: {
    _id: string;
    action: string;
    details: string;
    createdAt: string;
    userRole: string;
  }[];
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/admin/stats", fetcher, {
    refreshInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "delete_teacher":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          System overview and management
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {stats?.overview.totalTeachers || 0}
                  </p>
                  <span className="text-xs text-green-500">
                    {stats?.overview.activeTeachers || 0} active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">
                  {stats?.overview.totalStudents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-500/10 p-3">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">
                  {stats?.overview.totalCourses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Report Cards</p>
                <p className="text-2xl font-bold">
                  {stats?.overview.totalReports || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Teachers by Students
            </CardTitle>
            <CardDescription>
              Teachers with the most registered students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topTeachers && stats.topTeachers.length > 0 ? (
              <div className="space-y-4">
                {stats.topTeachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{teacher.teacherName}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {teacher.studentCount} students
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No teachers with students yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Students by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Students by Level
            </CardTitle>
            <CardDescription>Distribution of students across levels</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.studentsByLevel && stats.studentsByLevel.length > 0 ? (
              <div className="space-y-3">
                {stats.studentsByLevel.map((level) => (
                  <div key={level._id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{level._id}</span>
                      <span className="font-medium">{level.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${
                            (level.count / (stats.overview.totalStudents || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No student data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {getActionIcon(activity.action)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatAction(activity.action)}
                      </Badge>
                      <Badge
                        variant={
                          activity.userRole === "admin" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {activity.userRole}
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
            <p className="text-center text-muted-foreground">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Breakdown (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.activityBreakdown && stats.activityBreakdown.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.activityBreakdown.slice(0, 8).map((activity) => (
                <div
                  key={activity._id}
                  className="rounded-lg border p-4 text-center"
                >
                  <p className="text-2xl font-bold">{activity.count}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatAction(activity._id)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No activity data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
