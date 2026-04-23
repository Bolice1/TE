import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "teacher";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "teacher";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: "admin" | "teacher";
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type QuizType = "CAT" | "Exam" | "Assignment" | "Other";
export type Term = "Term 1" | "Term 2" | "Term 3";
export type Gender = "male" | "female" | "other";
export type ParentRelationship = "father" | "mother" | "guardian";

export interface StudentFormData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  isOrphan: boolean;
  guardianInfo?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  parents: {
    name: string;
    relationship: ParentRelationship;
    phone: string;
    email?: string;
    isEmergencyContact: boolean;
  }[];
  notes?: string;
}

export interface CourseFormData {
  name: string;
  description?: string;
  level: string;
  academicYear: string;
  term: Term;
}

export interface QuizFormData {
  courseId: string;
  title: string;
  description?: string;
  type: QuizType;
  totalMarks: number;
  weight?: number;
  dueDate?: string;
}

export interface MarkFormData {
  studentId: string;
  quizId: string;
  marksObtained: number;
  remarks?: string;
}
