import mongoose from 'mongoose';

export interface IReport {
  student: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  year: string;
  term: string;
  average: number;
  totalScore: number;
  grade: string;
  html: string;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const reportsModel = new mongoose.Schema<IReport>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
    },
    average: {
      type: Number,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    html: {
      type: String,
      required: true,
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

reportsModel.index({ student: 1, year: 1, term: 1 }, { unique: true });

const Reports = mongoose.model<IReport>('Report', reportsModel);
export default Reports;
