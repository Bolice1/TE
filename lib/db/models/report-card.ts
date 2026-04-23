import mongoose, { Schema, Document, Model } from "mongoose";

interface ICourseResult {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  averageMarks: number;
  grade: string;
  gradePoint: number;
}

export interface IReportCard extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYear: string;
  term: string;
  courses: ICourseResult[];
  overallAverage: number;
  overallGrade: string;
  rank?: number;
  totalStudents?: number;
  teacherRemarks?: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CourseResultSchema = new Schema<ICourseResult>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    averageMarks: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    gradePoint: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ReportCardSchema = new Schema<IReportCard>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher ID is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    term: {
      type: String,
      required: [true, "Term is required"],
      trim: true,
    },
    courses: [CourseResultSchema],
    overallAverage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
    },
    totalStudents: {
      type: Number,
    },
    teacherRemarks: {
      type: String,
      trim: true,
    },
    pdfUrl: {
      type: String,
    },
    pdfPublicId: {
      type: String,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ReportCardSchema.index(
  { teacherId: 1, studentId: 1, academicYear: 1, term: 1 },
  { unique: true }
);
ReportCardSchema.index({ studentId: 1, academicYear: 1 });

const ReportCard: Model<IReportCard> =
  mongoose.models.ReportCard ||
  mongoose.model<IReportCard>("ReportCard", ReportCardSchema);

export default ReportCard;
