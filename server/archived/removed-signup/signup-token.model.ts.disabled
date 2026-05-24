import mongoose from 'mongoose';
import crypto from 'crypto';

export interface ISignupToken {
  email: string;
  token: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const signupTokenSchema = new mongoose.Schema<ISignupToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: true,
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

signupTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
signupTokenSchema.index({ email: 1, expiresAt: 1 });
signupTokenSchema.index({ token: 1, expiresAt: 1 });

const SignupToken = mongoose.model<ISignupToken>('SignupToken', signupTokenSchema);
export default SignupToken;
