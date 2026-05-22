/**
 * Student Types
 */

export interface Student {
  _id: string;
  studentCode: string;
  studentName: string;
  className: string;
  year: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  gender?: 'M' | 'F' | 'Other';
  enrollmentDate?: Date;
  status?: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentListResponse {
  students: Student[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface StudentCreateRequest {
  studentCode: string;
  studentName: string;
  className: string;
  year: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  gender?: 'M' | 'F' | 'Other';
}

/**
 * Mark Types
 */

export interface Mark {
  _id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  courseId: string;
  score: number;
  maxScore: number;
  percentage: number;
  term: string;
  year: string;
  comment?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarksListResponse {
  marks: Mark[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface MarkCreateRequest {
  studentId: string;
  assignmentId: string;
  score: number;
  comment?: string;
}

export interface MarkUpdateRequest {
  score?: number;
  comment?: string;
}

/**
 * Assignment Types
 */

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  courseName: string;
  courseId: string;
  courseOutcome?: string;
  className: string;
  type: 'assignment' | 'quiz';
  maxScore: number;
  weight: number;
  competencyFocus?: string[];
  dueDate?: Date;
  createdDate: Date;
  term: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  _id: string;
  name: string;
  code?: string;
  outcome?: string;
  className: string;
  year: string;
  term?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentsListResponse {
  assignments: Assignment[];
  courses?: Course[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AssignmentCreateRequest {
  title: string;
  description?: string;
  courseName: string;
  courseId: string;
  className: string;
  type: 'assignment' | 'quiz';
  maxScore: number;
  weight: number;
  competencyFocus?: string[];
  dueDate?: Date;
  term: string;
  year: string;
}

/**
 * Report Types
 */

export interface Report {
  _id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  year: string;
  term?: string;
  reportType: 'term' | 'annual';
  averagePercentage?: number;
  grade?: string;
  performanceBand?: string;
  teacherComment?: string;
  headTeacherComment?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  sendToParent?: boolean;
  sentAt?: Date;
  competencySummary?: Record<string, { score: number; maxScore: number }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportListResponse {
  reports: Report[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ReportGenerateRequest {
  teacherComment?: string;
  headTeacherComment?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

export interface ReportSendRequest {
  parentEmail?: string;
  includeCompetencies?: boolean;
}

/**
 * Auth Types
 */

export interface Teacher {
  _id?: string;
  email: string;
  name?: string;
  schoolCode?: string;
  schoolName?: string;
  department?: string;
  employeeId?: string;
  qualifications?: string[];
  yearsOfExperience?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  teacher: Teacher;
  expiresIn?: number;
}

export interface OtpRequestResponse {
  message: string;
  otpPreview?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  message?: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password?: string;
  schoolCode?: string;
  schoolName?: string;
  department?: string;
  employeeId?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  otp?: string;
}
