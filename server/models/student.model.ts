import mongoose from 'mongoose';

export interface IStudent {
  name: string;
  studentCode: string;
  className: string;
  year: string;
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  registeredBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    studentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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
    parentName: {
      type: String,
      required: true,
      trim: true,
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
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

const Student = mongoose.model<IStudent>('Student', studentSchema);
export default Student;
