import mongoose from 'mongoose';

export interface ICoach {
  name: string;
  email: string;
  address: string;
  coachingName: string;
  phoneNumber?: string;
  password: string;
  isEmailVerified: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const coachSchema = new mongoose.Schema<ICoach>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    coachingName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
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

coachSchema.index({ email: 1, isDeleted: 1 });

const Coach = mongoose.model<ICoach>('Coach', coachSchema);
export default Coach;
