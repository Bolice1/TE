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
type ApiSuccessEnvelope<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const buildQueryString = (
  params: Record<string, string | number | undefined | null>
) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

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

  const json = await response.json();

  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    (json as { success?: unknown }).success === true &&
    "data" in json
  ) {
    return (json as ApiSuccessEnvelope<T>).data;
  }

  return json as T;
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
    logout: () =>
      request<{ message: string }>("/auth/logout", {
        method: "POST",
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
    list: (filters: { className?: string; year?: string; studentCode?: string }) =>
      request<StudentListResponse>(`/students${buildQueryString(filters)}`),
    register: (data: any) =>
      request<Student>("/students", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  courses: {
    list: (filters: { className?: string; year?: string }) =>
      request<{ courses: Course[] }>(`/assignments/courses${buildQueryString(filters)}`),
    create: (data: any) =>
      request<Course>("/assignments/courses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  assignments: {
    list: (filters: { className?: string; year?: string; courseId?: string; type?: string }) =>
      request<AssignmentsListResponse>(`/assignments${buildQueryString(filters)}`),
    create: (data: any) =>
      request<Assignment>("/assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  marks: {
    list: (filters: { term?: string; year?: string; className?: string; studentId?: string; courseId?: string }) =>
      request<MarksListResponse>(`/marks${buildQueryString(filters)}`),
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
    list: (filters: { year?: string; term?: string; studentId?: string; reportType?: string }) =>
      request<ReportListResponse>(`/reports${buildQueryString(filters)}`),
    generate: (studentId: string, queryParams: { year: string; term?: string; reportType: string }, body: any) => {
      return request<Report>(`/reports/${studentId}/generate${buildQueryString(queryParams)}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    printUrl: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) => {
      return `${API_URL}/reports/${studentId}/print${buildQueryString(queryParams)}`;
    },
    downloadBlob: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) => {
      return request<Blob>(`/reports/${studentId}/download${buildQueryString(queryParams)}`);
    },
    sendEmail: (studentId: string, queryParams: { year: string; term?: string; reportType: string }, body: any) => {
      return request<{ message: string }>(`/reports/${studentId}/send${buildQueryString(queryParams)}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },
  analytics: {
    getDashboard: (filters: Partial<GlobalFilters>) =>
      request<DashboardAnalytics>(
        `/analytics/dashboard${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
    getTopStudents: (filters: Partial<GlobalFilters>, page = 1, limit = 10) => {
      return request<TopStudentsResponse>(
        `/analytics/students/top${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
          page,
          limit,
        })}`
      );
    },
    getWeakStudents: (filters: Partial<GlobalFilters>, page = 1, limit = 10) => {
      return request<TopStudentsResponse>(
        `/analytics/students/weak${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
          page,
          limit,
        })}`
      );
    },
    getClasses: (filters: Partial<GlobalFilters>) =>
      request<Class[]>(
        `/analytics/classes${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
    getCourses: (filters: Partial<GlobalFilters>) =>
      request<any[]>(
        `/analytics/courses${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
    getTrends: (filters: Partial<GlobalFilters>) =>
      request<Trend>(
        `/analytics/trends${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
    getGrades: (filters: Partial<GlobalFilters>) =>
      request<GradesAnalytics>(
        `/analytics/grades${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
    getReportsSummary: (filters: Partial<GlobalFilters>) =>
      request<ReportsSummary>(
        `/analytics/reports/summary${buildQueryString({
          year: filters.academicYear,
          term: filters.term,
          className: filters.className,
          courseId: filters.courseId,
        })}`
      ),
  },
};
