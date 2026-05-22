/**
 * Analytics Types
 * Based on backend analytics service responses
 */

export interface Student {
  stableId: string;
  label: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  parentName?: string;
  className: string;
  year: string;
  totalScore: number;
  totalMaxScore: number;
  averagePercentage: number;
  grade: string;
  performanceBand: string;
  gpaLikeScore: number;
  courseCount: number;
  strengths: string[];
  weaknesses: string[];
  trends: Array<{ label: string; percentage: number }>;
  improvement: number;
  rank?: number;
}

export interface Course {
  courseId: string;
  courseName: string;
  courseCode?: string;
  outcome: string;
  averagePercentage: number;
  passRate: number;
  studentCount: number;
  performanceBand: string;
  difficultyIndex: number;
  difficultAssignments: Array<{
    assignmentId: string;
    title: string;
    averagePercentage: number;
  }>;
}

export interface Class {
  className: string;
  averagePercentage: number;
  studentCount: number;
  passRate: number;
  performanceBand: string;
  stableId?: string;
  label?: string;
  totalScore?: number;
  rank?: number;
}

export interface TrendPoint {
  label: string;
  averagePercentage: number;
}

export interface Trend {
  trends: TrendPoint[];
  recommendations: Array<{
    studentId: string;
    studentName: string;
    improvement: number;
  }>;
}

export interface GradeDistributionEntry {
  grade: string;
  count: number;
  percentage: number;
}

export interface GradesAnalytics {
  distribution: GradeDistributionEntry[];
  performanceBands: Record<string, number>;
  passFail: {
    pass: number;
    fail: number;
  };
}

export interface UpcomingAssignment {
  assignmentId: string;
  title: string;
  courseName: string;
  className: string;
  dueDate: Date;
  type: 'assignment' | 'quiz';
}

export interface Recommendation {
  studentsNeedingIntervention: Array<{
    studentId: string;
    studentName: string;
    className: string;
    averagePercentage: number;
    weaknesses: string[];
  }>;
  weakClasses: Class[];
  difficultCourses: Course[];
  decliningPerformance: Array<{
    studentId: string;
    studentName: string;
    improvement: number;
  }>;
}

export interface SummaryCard {
  key: string;
  label: string;
  value: number | string;
}

export interface RecentActivityItem {
  type: string;
  title: string;
  subtitle: string;
  score: number;
  maxScore: number;
  createdAt: Date;
}

export interface DashboardAnalytics {
  summaryCards: SummaryCard[];
  chartDatasets: {
    gradeDistribution: GradeDistributionEntry[];
    trends: TrendPoint[];
    classAverages: Array<{ label: string; value: number }>;
    coursePerformance: Array<{ label: string; value: number }>;
  };
  rankings: {
    topStudents: Student[];
    weakestStudents: Student[];
    classes: Class[];
  };
  recentActivity: RecentActivityItem[];
  upcomingAssignments: UpcomingAssignment[];
  recommendations: Recommendation;
  pagination: {
    page: number;
    limit: number;
    total?: number;
  };
}

export interface TopStudentsResponse {
  total: number;
  page: number;
  limit: number;
  items: Student[];
}

export interface ReportsSummary {
  totalStudents: number;
  totalCourses: number;
  averageScore: number;
  topPerformers: Student[];
  interventions: Recommendation['studentsNeedingIntervention'];
}
