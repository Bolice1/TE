"use client";

import React from "react";
import { Recommendation, Student, Class, Course } from "@/types/analytics";
import { AlertTriangle, TrendingDown, AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";

/**
 * Intervention Recommendations Component
 * Displays students and classes needing intervention
 */
interface InterventionRecommendationsProps {
  recommendations?: Recommendation;
  onStudentSelect?: (studentId: string) => void;
}

export function InterventionRecommendations({
  recommendations,
  onStudentSelect,
}: InterventionRecommendationsProps) {
  if (
    !recommendations ||
    ((!recommendations.studentsNeedingIntervention ||
      recommendations.studentsNeedingIntervention.length === 0) &&
      (!recommendations.weakClasses || recommendations.weakClasses.length === 0) &&
      (!recommendations.difficultCourses || recommendations.difficultCourses.length === 0))
  ) {
    return (
      <div className="text-center py-12">
        <div className="text-success mb-3">✓</div>
        <p className="text-sm text-muted-text">
          No immediate interventions needed. Keep monitoring for changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Students Needing Intervention */}
      {recommendations.studentsNeedingIntervention &&
        recommendations.studentsNeedingIntervention.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-danger mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Students Needing Support
            </h4>
            <div className="space-y-2">
              {recommendations.studentsNeedingIntervention.slice(0, 5).map((student) => (
                <div
                  key={student.studentId}
                  className="p-3 bg-danger/5 border border-danger/10 rounded-lg flex items-center justify-between hover:bg-danger/10 transition-colors cursor-pointer group"
                  onClick={() => onStudentSelect?.(student.studentId)}
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-foreground truncate group-hover:text-danger">
                      {student.studentName}
                    </h5>
                    <p className="text-[10px] text-muted-text truncate">
                      {student.className} • {student.weaknesses?.slice(0, 2).join(", ") || "Multiple areas"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-bold text-danger block">
                      {student.averagePercentage}%
                    </span>
                    <span className="text-[8px] text-danger/70">Below Pass</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Weak Classes */}
      {recommendations.weakClasses && recommendations.weakClasses.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-warning mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Challenging Classes
          </h4>
          <div className="space-y-2">
            {recommendations.weakClasses.slice(0, 3).map((classItem) => (
              <div
                key={classItem.className}
                className="p-3 bg-warning/5 border border-warning/10 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-foreground">{classItem.className}</h5>
                  <p className="text-[10px] text-muted-text">
                    {classItem.studentCount} students • {classItem.passRate}% pass rate
                  </p>
                </div>
                <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded shrink-0">
                  {classItem.averagePercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficult Courses */}
      {recommendations.difficultCourses && recommendations.difficultCourses.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-amber-600 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Challenging Subjects
          </h4>
          <div className="space-y-2">
            {recommendations.difficultCourses.slice(0, 3).map((course) => (
              <div
                key={course.courseId}
                className="p-3 bg-amber-50 border border-amber-200/30 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-foreground">{course.courseName}</h5>
                  <p className="text-[10px] text-muted-text">
                    {course.studentCount} students • Difficulty: {course.difficultyIndex.toFixed(0)}%
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded shrink-0">
                  {course.averagePercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declining Performance */}
      {recommendations.decliningPerformance &&
        recommendations.decliningPerformance.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-warning mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              Performance Decline Watch
            </h4>
            <div className="space-y-2">
              {recommendations.decliningPerformance.slice(0, 3).map((student) => (
                <div
                  key={student.studentId}
                  className="p-3 bg-warning/5 border border-warning/10 rounded-lg flex items-center justify-between"
                >
                  <h5 className="text-xs font-bold text-foreground">{student.studentName}</h5>
                  <span className="text-xs font-bold text-warning flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {student.improvement.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

/**
 * Comparative Analytics Widget
 * Shows how students/classes are performing against each other
 */
interface ComparativeAnalyticsProps {
  topStudents?: Student[];
  bottomStudents?: Student[];
  onStudentSelect?: (studentId: string) => void;
}

export function ComparativeAnalytics({
  topStudents,
  bottomStudents,
  onStudentSelect,
}: ComparativeAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Performers */}
      {topStudents && topStudents.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-lg">
          <h4 className="text-xs font-bold text-success mb-3 uppercase tracking-wider">Excellence</h4>
          <div className="space-y-2">
            {topStudents.slice(0, 3).map((student, idx) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-success/5 p-2 rounded transition-colors"
                onClick={() => onStudentSelect?.(student.studentId)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-foreground truncate">{student.studentName}</p>
                    <p className="text-[9px] text-muted-text">{student.className}</p>
                  </div>
                </div>
                <span className="font-bold text-success shrink-0">{student.averagePercentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Performers */}
      {bottomStudents && bottomStudents.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-danger/5 to-danger/10 border border-danger/20 rounded-lg">
          <h4 className="text-xs font-bold text-danger mb-3 uppercase tracking-wider">Support Needed</h4>
          <div className="space-y-2">
            {bottomStudents.slice(0, 3).map((student, idx) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between text-xs cursor-pointer hover:bg-danger/5 p-2 rounded transition-colors"
                onClick={() => onStudentSelect?.(student.studentId)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-danger/20 text-danger flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-foreground truncate">{student.studentName}</p>
                    <p className="text-[9px] text-muted-text">{student.className}</p>
                  </div>
                </div>
                <span className="font-bold text-danger shrink-0">{student.averagePercentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Performance Summary Card
 * Quick visual of class/course performance
 */
interface PerformanceSummaryProps {
  label: string;
  percentage: number;
  passRate?: number;
  studentCount?: number;
  onClick?: () => void;
}

export function PerformanceSummary({
  label,
  percentage,
  passRate,
  studentCount,
  onClick,
}: PerformanceSummaryProps) {
  const getColor = (perc: number) => {
    if (perc >= 80) return "text-success bg-success/10 border-success/20";
    if (perc >= 60) return "text-primary bg-primary/10 border-primary/20";
    if (perc >= 50) return "text-warning bg-warning/10 border-warning/20";
    return "text-danger bg-danger/10 border-danger/20";
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${getColor(percentage)}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xs font-bold truncate">{label}</h5>
          {studentCount && (
            <p className="text-[9px] opacity-70">{studentCount} students</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{percentage.toFixed(1)}%</p>
          {passRate !== undefined && (
            <p className="text-[9px] opacity-70">{passRate.toFixed(0)}% pass</p>
          )}
        </div>
      </div>
    </div>
  );
}
