import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const parentSchema = z.object({
  name: z.string().min(1, "Parent name is required"),
  relationship: z.enum(["father", "mother", "guardian"]),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  isEmergencyContact: z.boolean().default(false),
});

export const guardianSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: addressSchema.optional(),
  isOrphan: z.boolean().default(false),
  guardianInfo: guardianSchema.optional(),
  parents: z.array(parentSchema).default([]),
  notes: z.string().optional(),
});

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().optional(),
  level: z.string().min(1, "Level is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  term: z.enum(["Term 1", "Term 2", "Term 3"]),
});

export const quizSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  type: z.enum(["CAT", "Exam", "Assignment", "Other"]),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  weight: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
});

export const markSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  quizId: z.string().min(1, "Quiz is required"),
  marksObtained: z.number().min(0, "Marks cannot be negative"),
  remarks: z.string().optional(),
});

export const bulkMarkSchema = z.object({
  quizId: z.string().min(1, "Quiz is required"),
  marks: z.array(
    z.object({
      studentId: z.string().min(1),
      marksObtained: z.number().min(0),
      remarks: z.string().optional(),
    })
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type MarkInput = z.infer<typeof markSchema>;
export type BulkMarkInput = z.infer<typeof bulkMarkSchema>;
