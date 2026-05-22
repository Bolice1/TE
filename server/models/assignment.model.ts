import mongoose from 'mongoose';

export interface IAssignment {
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignmentDate: Date;
  dueDate?: Date;
  className: string;
  year: string;
  maxScore: number;
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

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
export default Assignment;
