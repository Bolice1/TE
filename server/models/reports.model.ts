import mongoose from 'mongoose';

export interface IReport {
  student: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  year: string;
  term?: string;
  reportType: 'term' | 'annual';
  average: number;
  totalScore: number;
  totalMaxScore: number;
  grade: string;
  html: string;
  teacherComment?: string;
  headTeacherComment?: string;
  rank?: number;
  percentile?: number;
  performanceBand?: string;
  strengths?: string[];
  weaknesses?: string[];
  competencySummary?: Array<{
    courseName: string;
    averagePercentage: number;
    performanceBand: string;
  }>;
  subjectAnalytics?: Array<{
    courseName: string;
    score: number;
    maxScore: number;
    averagePercentage: number;
    grade: string;
  }>;
  chartMetadata?: {
    trend: Array<{ label: string; value: number }>;
    gradeDistribution: Array<{ label: string; value: number }>;
  };
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
      trim: true,
    },
    reportType: {
      type: String,
      enum: ['term', 'annual'],
      required: true,
      default: 'term',
    },
    average: {
      type: Number,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    totalMaxScore: {
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
    teacherComment: {
      type: String,
      trim: true,
    },
    headTeacherComment: {
      type: String,
      trim: true,
    },
    rank: {
      type: Number,
    },
    percentile: {
      type: Number,
    },
    performanceBand: {
      type: String,
      trim: true,
    },
    strengths: [
      {
        type: String,
        trim: true,
      },
    ],
    weaknesses: [
      {
        type: String,
        trim: true,
      },
    ],
    competencySummary: {
      type: [
        new mongoose.Schema(
          {
            courseName: { type: String, required: true, trim: true },
            averagePercentage: { type: Number, required: true },
            performanceBand: { type: String, required: true, trim: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    subjectAnalytics: {
      type: [
        new mongoose.Schema(
          {
            courseName: { type: String, required: true, trim: true },
            score: { type: Number, required: true },
            maxScore: { type: Number, required: true },
            averagePercentage: { type: Number, required: true },
            grade: { type: String, required: true, trim: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    chartMetadata: {
      type: new mongoose.Schema(
        {
          trend: {
            type: [
              new mongoose.Schema(
                {
                  label: { type: String, required: true, trim: true },
                  value: { type: Number, required: true },
                },
                { _id: false },
              ),
            ],
            default: [],
          },
          gradeDistribution: {
            type: [
              new mongoose.Schema(
                {
                  label: { type: String, required: true, trim: true },
                  value: { type: Number, required: true },
                },
                { _id: false },
              ),
            ],
            default: [],
          },
        },
        { _id: false },
      ),
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

reportsModel.index(
  { student: 1, teacher: 1, year: 1, term: 1, reportType: 1 },
  { unique: true },
);
reportsModel.index({ teacher: 1, year: 1, reportType: 1 });

const Reports = mongoose.model<IReport>('Report', reportsModel);
export default Reports;
