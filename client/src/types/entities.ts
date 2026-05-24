/**
 * Student Types
 */

export interface Student {
  _id: string;
  studentCode: string;
  name: string;
  className: string;
  year: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
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
  name: string;
  studentCode: string;
  className: string;
  year: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
}

/**
 * Mark Types
 */

export interface Mark {
  _id: string;
  score: number;
  term: string;
  year: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  student?: Pick<Student, "_id" | "name" | "studentCode" | "className" | "year">;
  course?: Pick<Course, "_id" | "name" | "className" | "year">;
  assignment?: Pick<Assignment, "_id" | "title" | "maxScore" | "weight" | "type">;
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
  description?: string;
  numberOfPeriodsInAWeek?: number;
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
  student: string;
  year: string;
  term?: string;
  reportType: 'term' | 'annual';
  average?: number;
  totalScore?: number;
  totalMaxScore?: number;
  grade?: string;
  performanceBand?: string;
  teacherComment?: string;
  headTeacherComment?: string;
  strengths?: string[];
  weaknesses?: string[];
  rank?: number;
  percentile?: number;
  competencySummary?: Array<{
    courseName: string;
    averagePercentage: number;
    performanceBand: string;
  }>;
  subjectAnalytics?: Array<{
    courseName: string;
    score: number;
    maxScore: number;
    averagePercentage: number;
    grade: string;
  }>;
  chartMetadata?: {
    trend: Array<{ label: string; value: number }>;
    gradeDistribution: Array<{ label: string; value: number }>;
  };
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
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  coachingName?: string;
  address?: string;
  phoneNumber?: string;
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
}

export interface OtpVerifyResponse {
  verified: boolean;
  message?: string;
  signupToken?: string;
}

export interface SignupTokenResponse {
  verified: true;
  signupToken: string;
  message?: string;
}

export interface SignupRequest {
  name: string;
  coachingName: string;
  address: string;
  phoneNumber?: string;
  password: string;
  signupToken: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  otp?: string;
}
