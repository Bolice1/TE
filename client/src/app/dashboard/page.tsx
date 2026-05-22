"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  School,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { academicYear, term, className, courseId } = useFilters();

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["dashboard-analytics", academicYear, term, className, courseId],
    queryFn: () => api.analytics.getDashboard({ academicYear, term, className, courseId }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-text font-medium">
          Running analytics engine aggregates...
        </p>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="p-8 border border-danger/10 bg-danger/5 rounded-2xl text-center max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-danger mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground mb-1">Failed to load analytics</h3>
        <p className="text-sm text-muted-text">
          Double check your database or server connection. Add some courses, assignments, and marks first to see calculations.
        </p>
      </div>
    );
  }

  const {
    summaryCards = [],
    chartDatasets = {
      gradeDistribution: [],
      trends: [],
      classAverages: [],
      coursePerformance: [],
    },
    rankings = {
      topStudents: [],
      weakestStudents: [],
      classes: [],
    },
    recentActivity = [],
    upcomingAssignments = [],
    recommendations = {
      studentsNeedingIntervention: [],
      weakClasses: [],
      difficultCourses: [],
      decliningPerformance: [],
    },
  } = dashboardData;

  const cardIcons: Record<string, any> = {
    students: Users,
    courses: BookOpen,
    classes: School,
    average: TrendingUp,
  };

  const cardColors: Record<string, string> = {
    students: "bg-blue-500/10 text-blue-600",
    courses: "bg-indigo-500/10 text-indigo-600",
    classes: "bg-emerald-500/10 text-emerald-600",
    average: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card: any, idx: number) => {
          const Icon = cardIcons[card.key] || Sparkles;
          const iconColor = cardColors[card.key] || "bg-primary/10 text-primary";
          const isPercentage = card.key === "average";
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={card.key}
              className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300"
            >
              <div>
                <span className="text-xs font-semibold text-muted-text uppercase tracking-wider block">
                  {card.label}
                </span>
                <span className="text-3xl font-extrabold text-foreground mt-1.5 block tracking-tight font-display">
                  {card.value}
                  {isPercentage ? "%" : ""}
                </span>
              </div>
              <div className={`p-4 rounded-xl shrink-0 ${iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. RESPONSIVE CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Performance Line Chart */}
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Academic Progress Trend</h3>
            <p className="text-xs text-muted-text">Timeline of student score performance averages</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            {chartDatasets.trends && chartDatasets.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDatasets.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="averagePercentage"
                    name="Class Average"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-text">
                No performance data to display in trend.
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground">Grade Distribution</h3>
            <p className="text-xs text-muted-text">Ratios of score bands inside classes</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            {chartDatasets.gradeDistribution && chartDatasets.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDatasets.gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="value" name="Student Count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-text">
                No grades distribution.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RANKINGS & RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Top Performers Leaderboard */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Top-Performing Students</h3>
              <p className="text-xs text-muted-text">Highest class performance averages</p>
            </div>
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4 flex-1">
            {rankings.topStudents && rankings.topStudents.length > 0 ? (
              rankings.topStudents.slice(0, 5).map((student: any, idx: number) => (
                <div key={student.studentId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{student.studentName}</h4>
                      <p className="text-[10px] text-muted-text">Class {student.className} • Code: {student.studentCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-primary font-display">
                      {student.averagePercentage}%
                    </span>
                    <span className="block text-[9px] font-bold text-success uppercase tracking-wider">
                      Grade {student.grade}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-text py-10">
                No student analytics records registered.
              </div>
            )}
          </div>
        </div>

        {/* Intervention Alerts & Weak Students */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Intervention Alerts</h3>
              <p className="text-xs text-muted-text">Students with averages under 50%</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-danger animate-pulse" />
          </div>
          <div className="space-y-4 flex-1">
            {recommendations.studentsNeedingIntervention && recommendations.studentsNeedingIntervention.length > 0 ? (
              recommendations.studentsNeedingIntervention.slice(0, 5).map((student: any) => (
                <div key={student.studentId} className="p-3 bg-danger/5 border border-danger/10 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{student.studentName}</h4>
                    <p className="text-[9px] text-muted-text">Class: {student.className} • Needs help in: {student.weaknesses?.join(", ") || "All subjects"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-danger">
                      {student.averagePercentage}% Avg
                    </span>
                    <span className="block text-[8px] font-semibold text-danger/80">
                      Fail Risk
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-text py-10">
                🎉 No students currently require immediate academic intervention.
              </div>
            )}
          </div>
        </div>

        {/* Student Performance Movement */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Declining Trend Watch</h3>
              <p className="text-xs text-muted-text">Students whose grade scores dropped recently</p>
            </div>
            <TrendingDown className="w-5 h-5 text-warning" />
          </div>
          <div className="space-y-4 flex-1">
            {recommendations.decliningPerformance && recommendations.decliningPerformance.length > 0 ? (
              recommendations.decliningPerformance.slice(0, 5).map((student: any) => (
                <div key={student.studentId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{student.studentName}</h4>
                    <p className="text-[10px] text-muted-text">Class performance dropped recently</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-warning font-bold text-xs bg-warning/5 border border-warning/10 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{student.improvement}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-text py-10">
                No students flagged for declining performance trends.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY & UPCOMING ASSIGNMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Grading Actions */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-foreground mb-6">Recent Grading Activity</h3>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((act: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 py-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{act.title}</h4>
                    <p className="text-[10px] text-muted-text">{act.subtitle} • {new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border shrink-0">
                    {act.score}/{act.maxScore}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-text text-center py-10">
                No grading activities recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">Upcoming Assessments</h3>
            <span className="text-xs font-bold text-primary">Scheduled Timeline</span>
          </div>
          <div className="space-y-4">
            {upcomingAssignments && upcomingAssignments.length > 0 ? (
              upcomingAssignments.slice(0, 5).map((assign: any) => (
                <div key={assign.assignmentId} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{assign.title}</h4>
                      <p className="text-[10px] text-muted-text">{assign.courseName} ({assign.className}) • {assign.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
                    Due: {new Date(assign.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-text text-center py-10">
                No upcoming assessments scheduled. Use the Assignments Planner to schedule assignments.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
