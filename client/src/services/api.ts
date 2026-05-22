import { env } from "@/config/env";
import type {
  Student,
  StudentListResponse,
  Mark,
  MarksListResponse,
  Assignment,
  Course,
  AssignmentsListResponse,
  Report,
  ReportListResponse,
  Teacher,
  AuthResponse,
  OtpRequestResponse,
  OtpVerifyResponse,
} from "@/types/entities";
import type {
  DashboardAnalytics,
  GradesAnalytics,
  Trend,
  TopStudentsResponse,
  ReportsSummary,
  Class,
} from "@/types/analytics";

const API_URL = env.apiBaseUrl;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("te_token") : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? `Unable to reach the backend. ${error.message}`
        : "Unable to reach the backend.",
      0
    );
  }

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errBody = await response.json();
      errorMsg = errBody.message || errorMsg;
    } catch {
      // Ignore body parsing failure
    }
    throw new ApiError(errorMsg, response.status);
  }

  // Handle HTML response for print endpoint
  if (response.headers.get("Content-Type")?.includes("text/html")) {
    return (await response.text()) as unknown as T;
  }

  // Handle PDF blob response for download endpoint
  if (response.headers.get("Content-Type")?.includes("application/pdf")) {
    return (await response.blob()) as unknown as T;
  }

  return response.json() as Promise<T>;
}

// Global Filter Interface
export interface GlobalFilters {
  academicYear: string;
  term: string;
  className: string;
  courseId: string;
}

export const api = {
  auth: {
    requestOtp: (email: string) =>
      request<OtpRequestResponse>("/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email: string, otp: string) =>
      request<OtpVerifyResponse>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
    signup: (data: any) =>
      request<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (credentials: any) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    getProfile: () => request<{ teacher: Teacher }>("/auth/me"),
    updateProfile: (data: any) =>
      request<{ teacher: Teacher }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteProfile: () =>
      request<{ message: string }>("/auth/me", {
        method: "DELETE",
      }),
  },
  students: {
    list: (filters: { className?: string; year?: string; studentCode?: string }) => {
      const query = new URLSearchParams();
      if (filters.className) query.append("className", filters.className);
      if (filters.year) query.append("year", filters.year);
      if (filters.studentCode) query.append("studentCode", filters.studentCode);
      return request<StudentListResponse>(`/students?${query.toString()}`);
    },
    register: (data: any) =>
      request<Student>("/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  courses: {
    list: (filters: { className?: string; year?: string }) => {
      const query = new URLSearchParams();
      if (filters.className) query.append("className", filters.className);
      if (filters.year) query.append("year", filters.year);
      return request<{ courses: Course[] }>(`/assignments/courses?${query.toString()}`);
    },
    create: (data: any) =>
      request<Course>("/assignments/courses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  assignments: {
    list: (filters: { className?: string; year?: string; courseId?: string; type?: string }) => {
      const query = new URLSearchParams();
      if (filters.className) query.append("className", filters.className);
      if (filters.year) query.append("year", filters.year);
      if (filters.courseId) query.append("courseId", filters.courseId);
      if (filters.type) query.append("type", filters.type);
      return request<AssignmentsListResponse>(`/assignments?${query.toString()}`);
    },
    create: (data: any) =>
      request<Assignment>("/assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  marks: {
    list: (filters: { term?: string; year?: string; className?: string; studentId?: string; courseId?: string }) => {
      const query = new URLSearchParams();
      if (filters.term) query.append("term", filters.term);
      if (filters.year) query.append("year", filters.year);
      if (filters.className) query.append("className", filters.className);
      if (filters.studentId) query.append("studentId", filters.studentId);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<MarksListResponse>(`/marks?${query.toString()}`);
    },
    save: (data: any) =>
      request<Mark>("/marks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { score?: number; comment?: string }) =>
      request<Mark>(`/marks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },
  reports: {
    list: (filters: { year?: string; term?: string; studentId?: string; reportType?: string }) => {
      const query = new URLSearchParams();
      if (filters.year) query.append("year", filters.year);
      if (filters.term) query.append("term", filters.term);
      if (filters.studentId) query.append("studentId", filters.studentId);
      if (filters.reportType) query.append("reportType", filters.reportType);
      return request<ReportListResponse>(`/reports?${query.toString()}`);
    },
    generate: (studentId: string, queryParams: { year: string; term?: string; reportType: string }, body: any) => {
      const query = new URLSearchParams();
      query.append("year", queryParams.year);
      if (queryParams.term) query.append("term", queryParams.term);
      query.append("reportType", queryParams.reportType);
      return request<Report>(`/reports/${studentId}/generate?${query.toString()}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    printUrl: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) => {
      const query = new URLSearchParams();
      query.append("year", queryParams.year);
      if (queryParams.term) query.append("term", queryParams.term);
      query.append("reportType", queryParams.reportType);
      return `${API_URL}/reports/${studentId}/print?${query.toString()}`;
    },
    downloadBlob: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) => {
      const query = new URLSearchParams();
      query.append("year", queryParams.year);
      if (queryParams.term) query.append("term", queryParams.term);
      query.append("reportType", queryParams.reportType);
      return request<Blob>(`/reports/${studentId}/download?${query.toString()}`);
    },
    sendEmail: (studentId: string, queryParams: { year: string; term?: string; reportType: string }, body: any) => {
      const query = new URLSearchParams();
      query.append("year", queryParams.year);
      if (queryParams.term) query.append("term", queryParams.term);
      query.append("reportType", queryParams.reportType);
      return request<{ message: string }>(`/reports/${studentId}/send?${query.toString()}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  analytics: {
    getDashboard: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<DashboardAnalytics>(`/analytics/dashboard?${query.toString()}`);
    },
    getTopStudents: (filters: Partial<GlobalFilters>, page = 1, limit = 10) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      return request<TopStudentsResponse>(`/analytics/students/top?${query.toString()}`);
    },
    getWeakStudents: (filters: Partial<GlobalFilters>, page = 1, limit = 10) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      return request<TopStudentsResponse>(`/analytics/students/weak?${query.toString()}`);
    },
    getClasses: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<Class[]>(`/analytics/classes?${query.toString()}`);
    },
    getCourses: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<any[]>(`/analytics/courses?${query.toString()}`);
    },
    getTrends: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<Trend>(`/analytics/trends?${query.toString()}`);
    },
    getGrades: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<GradesAnalytics>(`/analytics/grades?${query.toString()}`);
    },
    getReportsSummary: (filters: Partial<GlobalFilters>) => {
      const query = new URLSearchParams();
      if (filters.academicYear) query.append("year", filters.academicYear);
      if (filters.term) query.append("term", filters.term);
      if (filters.className) query.append("className", filters.className);
      if (filters.courseId) query.append("courseId", filters.courseId);
      return request<ReportsSummary>(`/analytics/reports/summary?${query.toString()}`);
    },
  },
};
