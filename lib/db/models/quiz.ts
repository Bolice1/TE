import mongoose, { Schema, Document, Model } from "mongoose";

export type QuizType = "CAT" | "Exam" | "Assignment" | "Other";

export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: QuizType;
  totalMarks: number;
  weight: number;
  dueDate?: Date;
  academicYear: string;
  term: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher ID is required"],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Quiz type is required"],
      enum: ["CAT", "Exam", "Assignment", "Other"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dueDate: {
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ teacherId: 1, courseId: 1 });
QuizSchema.index({ courseId: 1, type: 1 });
QuizSchema.index({ teacherId: 1, academicYear: 1, term: 1 });

const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
