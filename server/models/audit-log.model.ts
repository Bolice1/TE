import mongoose from 'mongoose';

export interface IAuditLog {
  teacher?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ teacher: 1, action: 1, createdAt: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
