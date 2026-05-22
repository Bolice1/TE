import mongoose from 'mongoose';

export interface ITeacherSession {
  teacher: mongoose.Types.ObjectId;
  tokenId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

const teacherSessionSchema = new mongoose.Schema<ITeacherSession>(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

teacherSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TeacherSession = mongoose.model<ITeacherSession>('TeacherSession', teacherSessionSchema);
export default TeacherSession;
