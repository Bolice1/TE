import { buildApiUrl } from "@/lib/api-base";
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

const getAuthHeaders = (extra?: HeadersInit): Headers => {
  const headers = new Headers(extra);
  const token = typeof window !== "undefined" ? localStorage.getItem("te_token") : null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

const getSignupTokenHeaders = (signupToken: string, extra?: HeadersInit): Headers => {
  const headers = new Headers(extra);
  headers.set("Authorization", `Bearer ${signupToken}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};
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
  const headers = getAuthHeaders(options.headers);
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the backend. `, 0,
    );
  }

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errBody = await response.json();
      const hint = typeof errBody.hint === "string" ? errBody.hint : "";
      errorMsg =
        (typeof errBody.message === "string" && errBody.message) ||
        (typeof errBody.msg === "string" && errBody.msg) ||
        errorMsg;
      if (hint) {
        errorMsg = `${errorMsg} ${hint}`.trim();
      }
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

async function requestWithSignupToken<T>(
  endpoint: string,
  signupToken: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = getSignupTokenHeaders(signupToken, options.headers);
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the backend. `, 0,
    );
  }

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errBody = await response.json();
      const hint = typeof errBody.hint === "string" ? errBody.hint : "";
      errorMsg =
        (typeof errBody.message === "string" && errBody.message) ||
        (typeof errBody.msg === "string" && errBody.msg) ||
        errorMsg;
      if (hint) {
        errorMsg = `${errorMsg} ${hint}`.trim();
      }
    } catch {
      // Ignore body parsing failure
    }
    throw new ApiError(errorMsg, response.status);
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

export async function fetchAuthenticated(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = getAuthHeaders(options.headers);
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  return fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });
}

export async function fetchAuthenticatedHtml(endpoint: string): Promise<string> {
  const response = await fetchAuthenticated(endpoint);
  if (!response.ok) {
    let message = "Failed to load resource.";
    try {
      const body = await response.json();
      message =
        (typeof body.message === "string" && body.message) ||
        (typeof body.msg === "string" && body.msg) ||
        message;
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status);
  }
  return response.text();
}

export async function fetchAuthenticatedBlob(endpoint: string): Promise<Blob> {
  const response = await fetchAuthenticated(endpoint);
  if (!response.ok) {
    throw new ApiError("Failed to download file.", response.status);
  }
  return response.blob();
}

export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
      request<OtpRequestResponse>("/auth/signup/initiate", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email: string, otp: string) =>
      request<OtpVerifyResponse>("/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
    signup: (signupToken: string, data: Omit<any, "signupToken">) =>
      requestWithSignupToken<AuthResponse>("/auth/signup/complete", signupToken, {
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
    printPath: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) =>
      `/reports/${studentId}/print${buildQueryString(queryParams)}`,
    downloadPath: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) =>
      `/reports/${studentId}/download${buildQueryString(queryParams)}`,
    fetchPrintHtml: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) =>
      fetchAuthenticatedHtml(
        `/reports/${studentId}/print${buildQueryString(queryParams)}`
      ),
    downloadBlob: (studentId: string, queryParams: { year: string; term?: string; reportType: string }) =>
      fetchAuthenticatedBlob(
        `/reports/${studentId}/download${buildQueryString(queryParams)}`
      ),
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
