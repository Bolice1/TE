"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useFilters } from "@/features/courses/filter-context";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Award,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
} from "lucide-react";

export default function AnalyticsPage() {
  const { academicYear, term, className, courseId } = useFilters();
  const [activeTab, setActiveTab] = useState<"performance" | "distribution" | "difficulty">("performance");

  // Fetch detailed analytics sub-endpoints
  const { data: gradesData, isLoading: loadingGrades } = useQuery({
    queryKey: ["analytics-grades", academicYear, term, className, courseId],
    queryFn: () => api.analytics.getGrades({ academicYear, term, className, courseId }),
  });

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ["analytics-courses", academicYear, term, className, courseId],
    queryFn: () => api.analytics.getCourses({ academicYear, term, className, courseId }),
  });

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["analytics-classes", academicYear, term, className, courseId],
    queryFn: () => api.analytics.getClasses({ academicYear, term, className, courseId }),
  });

  const { data: trendsData, isLoading: loadingTrends } = useQuery({
    queryKey: ["analytics-trends", academicYear, term, className, courseId],
    queryFn: () => api.analytics.getTrends({ academicYear, term, className, courseId }),
  });

  const isLoading = loadingGrades || loadingCourses || loadingClasses || loadingTrends;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-text font-medium">
          Compiling academic metrics and visual charts...
        </p>
      </div>
    );
  }

  // Pass Fail Pie Chart Data
  const passFailData = gradesData?.passFail
    ? [
        { name: "Passing (>=50%)", value: gradesData.passFail.pass, color: "#16A34A" },
        { name: "Failing (<50%)", value: gradesData.passFail.fail, color: "#DC2626" },
      ]
    : [];

  const totalStudents = (gradesData?.passFail?.pass || 0) + (gradesData?.passFail?.fail || 0);
  const passRate = totalStudents > 0 && gradesData?.passFail ? ((gradesData.passFail.pass / totalStudents) * 100).toFixed(1) : "0.0";

  // Performance Bands Bar Chart Data
  const performanceBandsData = gradesData?.performanceBands
    ? Object.keys(gradesData.performanceBands).map((band) => ({
        name: band,
        count: gradesData.performanceBands[band],
      }))
    : [];

  // Course Difficulty Data: sorted by average percentage ascending (lowest average is hardest)
  const sortedCourses = coursesData ? [...coursesData].sort((a, b) => a.averagePercentage - b.averagePercentage) : [];

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex border-b border-border text-sm">
        <button
          onClick={() => setActiveTab("performance")}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "performance"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          School Performance Comparisons
        </button>
        <button
          onClick={() => setActiveTab("distribution")}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "distribution"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          Grade Bands & Pass/Fail
        </button>
        <button
          onClick={() => setActiveTab("difficulty")}
          className={`pb-4 px-6 font-bold cursor-pointer transition-all border-b-2 ${
            activeTab === "difficulty"
              ? "border-primary text-primary"
              : "border-transparent text-muted-text hover:text-foreground"
          }`}
        >
          Subject Difficulty Tracker
        </button>
      </div>

      {/* 1. PERFORMANCE COMPARISONS TAB */}
      {activeTab === "performance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Class comparison */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-base font-bold text-foreground">Class Average Benchmarking</h3>
                <p className="text-xs text-muted-text">Average scores compiled across classrooms</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                {classesData && classesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="className" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="averagePercentage" fill="#2563EB" radius={[4, 4, 0, 0]} name="Average Score" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-text">
                    No classroom data found.
                  </div>
                )}
              </div>
            </div>

            {/* Course comparison */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
              <div className="mb-6">
                <h3 className="text-base font-bold text-foreground">Course-Wise Benchmarking</h3>
                <p className="text-xs text-muted-text">Average scores of registered academic courses</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                {coursesData && coursesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coursesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="courseName" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="averagePercentage" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Average Score" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-text">
                    No course analytics found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Area progress timeline */}
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <div className="mb-6">
              <h3 className="text-base font-bold text-foreground">Timeline Analytics Area Chart</h3>
              <p className="text-xs text-muted-text">Academic growth averages plotted by assignment dates</p>
            </div>
            <div className="h-[300px]">
              {trendsData?.trends && trendsData.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
                    <Area type="monotone" dataKey="averagePercentage" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" name="Average Score" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-text">
                  No chronological trends to display yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. GRADE BANDS & PASS FAIL TAB */}
      {activeTab === "distribution" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Bands Count */}
          <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-base font-bold text-foreground">CBC Performance Band Counts</h3>
              <p className="text-xs text-muted-text">Outstanding, Strong, Moderate, and Weak distributions</p>
            </div>
            <div className="flex-1 min-h-[300px]">
              {performanceBandsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceBandsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Student Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-text">
                  No bands distribution logged.
                </div>
              )}
            </div>
          </div>

          {/* Pass Fail Pie chart */}
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Pass vs Fail Ratios</h3>
              <p className="text-xs text-muted-text mb-6">Percentage of students exceeding pass limits (50%)</p>
            </div>
            <div className="h-[200px] relative">
              {passFailData.length > 0 && passFailData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passFailData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {passFailData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-text">
                  No students graded yet.
                </div>
              )}
              {passFailData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-foreground font-display">{passRate}%</span>
                  <span className="text-[10px] text-muted-text uppercase font-bold">Pass Rate</span>
                </div>
              )}
            </div>
            <div className="space-y-2.5 mt-6 border-t border-border pt-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-success">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Passing Students
                </span>
                <span className="text-foreground">{gradesData?.passFail?.pass || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-danger">
                  <XCircle className="w-3.5 h-3.5" />
                  Failing Students
                </span>
                <span className="text-foreground">{gradesData?.passFail?.fail || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBJECT DIFFICULTY TRACKER TAB */}
      {activeTab === "difficulty" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses sorted by Difficulty Index */}
          <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-1">Subject Difficulty Index</h3>
            <p className="text-xs text-muted-text mb-6">Comparison of average failure risk index (100% minus average score)</p>
            <div className="space-y-5">
              {sortedCourses.length > 0 ? (
                sortedCourses.map((course: any) => {
                  const difficulty = (100 - course.averagePercentage).toFixed(1);
                  const isHighRisk = course.averagePercentage < 55;
                  return (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground">{course.courseName} ({course.courseCode || "No Code"})</span>
                        <span className={isHighRisk ? "text-danger" : "text-primary"}>
                          Difficulty: {difficulty}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-background rounded-full overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isHighRisk ? "bg-danger" : "bg-primary"
                          }`}
                          style={{ width: `${difficulty}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-text">
                        <span>Average Score: {course.averagePercentage}%</span>
                        <span>Pass Rate: {course.passRate}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-muted-text text-center py-10">
                  No registered courses or scores available.
                </div>
              )}
            </div>
          </div>

          {/* Difficult Assignments Logs */}
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">Difficult Assignments</h3>
              <p className="text-xs text-muted-text mb-6">Specific tests where students performed worst</p>
            </div>
            <div className="space-y-4 flex-1">
              {sortedCourses.length > 0 && sortedCourses[0]?.difficultAssignments?.length > 0 ? (
                sortedCourses[0].difficultAssignments.map((assign: any) => (
                  <div key={assign.assignmentId} className="p-3 bg-danger/5 border border-danger/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground truncate max-w-[150px]">{assign.title}</h4>
                      <p className="text-[9px] text-muted-text">{sortedCourses[0].courseName}</p>
                    </div>
                    <span className="text-xs font-bold text-danger shrink-0 bg-danger/10 px-2.5 py-0.5 rounded-full">
                      {assign.averagePercentage}% Avg
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-text py-10">
                  No challenging assignments flagged.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
