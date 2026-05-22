import mongoose from 'mongoose';

export interface IOtp {
  email: string;
  otp: string;
  purpose: 'teacher-signup';
  expiresAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['teacher-signup'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOtp>('OTP', otpSchema);
export default OTP;
