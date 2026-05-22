import mongoose from 'mongoose';

export interface IAssignment {
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  type: 'assignment' | 'quiz';
  title: string;
  description?: string;
  assignmentDate: Date;
  dueDate?: Date;
  startTime?: Date;
  endTime?: Date;
  className: string;
  year: string;
  maxScore: number;
  weight: number;
  competencyFocus?: string[];
  isDeleted: boolean;
  deletedAt: Date | null;
}

const assignmentSchema = new mongoose.Schema<IAssignment>(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'quiz'],
      default: 'assignment',
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignmentDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    competencyFocus: [
      {
        type: String,
        trim: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

assignmentSchema.index({ teacher: 1, course: 1, type: 1, title: 1, assignmentDate: 1 }, { unique: true });
assignmentSchema.index({ teacher: 1, className: 1, year: 1, dueDate: 1 });

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
export default Assignment;
