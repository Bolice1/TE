import mongoose from 'mongoose';

export interface IMark {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  assignment: mongoose.Types.ObjectId;
  score: number;
  term: string;
  year: string;
  comment?: string;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const markSchema = new mongoose.Schema<IMark>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
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
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
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

markSchema.index({ assignment: 1, student: 1 }, { unique: true });
markSchema.index({ teacher: 1, year: 1, term: 1, student: 1 });
markSchema.index({ teacher: 1, course: 1, year: 1, term: 1 });

const Marks = mongoose.model<IMark>('Marks', markSchema);
export default Marks;
