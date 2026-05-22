import type { GlobalFilters } from "@/services/api";

type YearClassFilters = {
  className?: string;
  year?: string;
};

type AnalyticsFilters = Partial<GlobalFilters>;

type ReportFilters = {
  year?: string;
  term?: string;
  studentId?: string;
  reportType?: string;
};

type MarksFilters = {
  term?: string;
  year?: string;
  className?: string;
  studentId?: string;
  courseId?: string;
};

type AssignmentFilters = {
  className?: string;
  year?: string;
  courseId?: string;
  type?: string;
};

const allValue = "all";

const normalizeValue = (value?: string | null) => value ?? allValue;

const normalizeAnalyticsFilters = (filters: AnalyticsFilters = {}) => ({
  academicYear: normalizeValue(filters.academicYear),
  term: normalizeValue(filters.term),
  className: normalizeValue(filters.className),
  courseId: normalizeValue(filters.courseId),
});

const normalizeYearClassFilters = (filters: YearClassFilters = {}) => ({
  year: normalizeValue(filters.year),
  className: normalizeValue(filters.className),
});

const normalizeAssignmentFilters = (filters: AssignmentFilters = {}) => ({
  ...normalizeYearClassFilters(filters),
  courseId: normalizeValue(filters.courseId),
  type: normalizeValue(filters.type),
});

const normalizeMarksFilters = (filters: MarksFilters = {}) => ({
  year: normalizeValue(filters.year),
  term: normalizeValue(filters.term),
  className: normalizeValue(filters.className),
  courseId: normalizeValue(filters.courseId),
  studentId: normalizeValue(filters.studentId),
});

const normalizeReportFilters = (filters: ReportFilters = {}) => ({
  year: normalizeValue(filters.year),
  term: normalizeValue(filters.term),
  studentId: normalizeValue(filters.studentId),
  reportType: normalizeValue(filters.reportType),
});

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => ["auth", "profile"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    dashboard: (filters: AnalyticsFilters = {}) =>
      ["analytics", "dashboard", normalizeAnalyticsFilters(filters)] as const,
    topStudents: (filters: AnalyticsFilters = {}, page = 1, limit = 10) =>
      ["analytics", "students", "top", normalizeAnalyticsFilters(filters), { page, limit }] as const,
    weakStudents: (filters: AnalyticsFilters = {}, page = 1, limit = 10) =>
      ["analytics", "students", "weak", normalizeAnalyticsFilters(filters), { page, limit }] as const,
    classes: (filters: AnalyticsFilters = {}) =>
      ["analytics", "classes", normalizeAnalyticsFilters(filters)] as const,
    courses: (filters: AnalyticsFilters = {}) =>
      ["analytics", "courses", normalizeAnalyticsFilters(filters)] as const,
    trends: (filters: AnalyticsFilters = {}) =>
      ["analytics", "trends", normalizeAnalyticsFilters(filters)] as const,
    grades: (filters: AnalyticsFilters = {}) =>
      ["analytics", "grades", normalizeAnalyticsFilters(filters)] as const,
    reportsSummary: (filters: AnalyticsFilters = {}) =>
      ["analytics", "reports", "summary", normalizeAnalyticsFilters(filters)] as const,
  },
  students: {
    all: ["students"] as const,
    list: (filters: YearClassFilters & { studentCode?: string } = {}) =>
      [
        "students",
        "list",
        {
          ...normalizeYearClassFilters(filters),
          studentCode: normalizeValue(filters.studentCode),
        },
      ] as const,
    detail: (studentId?: string | null) => ["students", "detail", normalizeValue(studentId)] as const,
  },
  marks: {
    all: ["marks"] as const,
    list: (filters: MarksFilters = {}) => ["marks", "list", normalizeMarksFilters(filters)] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    list: (filters: AssignmentFilters = {}) =>
      ["assignments", "list", normalizeAssignmentFilters(filters)] as const,
  },
  courses: {
    all: ["courses"] as const,
    list: (filters: YearClassFilters = {}) =>
      ["courses", "list", normalizeYearClassFilters(filters)] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (filters: ReportFilters = {}) =>
      ["reports", "list", normalizeReportFilters(filters)] as const,
    studentCard: (
      studentId?: string | null,
      filters: Omit<ReportFilters, "studentId"> = {},
    ) => [
      "reports",
      "student-card",
      normalizeValue(studentId),
      normalizeReportFilters({ ...filters, studentId: studentId ?? undefined }),
    ] as const,
  },
} as const;
