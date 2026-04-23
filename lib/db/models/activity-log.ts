import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userType: "admin" | "teacher";
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
    },
    userType: {
      type: String,
      required: [true, "User type is required"],
      enum: ["admin", "teacher"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userType: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
