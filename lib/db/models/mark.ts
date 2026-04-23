import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMark extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  marksObtained: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
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
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required"],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
    },
    gradePoint: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

MarkSchema.index({ teacherId: 1, studentId: 1, quizId: 1 }, { unique: true });
MarkSchema.index({ studentId: 1, courseId: 1 });
MarkSchema.index({ quizId: 1 });

const Mark: Model<IMark> =
  mongoose.models.Mark || mongoose.model<IMark>("Mark", MarkSchema);

export default Mark;
