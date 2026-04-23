import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  level: string;
  academicYear: string;
  term: "Term 1" | "Term 2" | "Term 3";
  students: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    term: {
      type: String,
      required: [true, "Term is required"],
      enum: ["Term 1", "Term 2", "Term 3"],
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.index({ teacherId: 1, academicYear: 1, term: 1 });
CourseSchema.index({ teacherId: 1, level: 1 });
CourseSchema.index({ teacherId: 1, isActive: 1 });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
