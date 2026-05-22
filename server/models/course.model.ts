import mongoose from 'mongoose';

export interface ICourse {
  name: string;
  teacher: mongoose.Types.ObjectId;
  className: string;
  year: string;
  numberOfPeriodsInAWeek: number;
  outcome: string;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
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
    numberOfPeriodsInAWeek: {
      type: Number,
      required: true,
      min: 1,
    },
    outcome: {
      type: String,
      required: true,
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

courseSchema.index({ teacher: 1, name: 1, className: 1, year: 1 }, { unique: true });

const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;
