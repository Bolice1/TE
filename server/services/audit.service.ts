import type { Request } from 'express';
import AuditLog from '../models/audit-log.model.js';

export const writeAuditLog = async (params: {
  req?: Request;
  teacherId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}) => {
  const { req, teacherId, action, entityType, entityId, status, metadata } = params;

  await AuditLog.create({
    ...(teacherId ? { teacher: teacherId } : {}),
    action,
    entityType,
    ...(entityId ? { entityId } : {}),
    status,
    ...(metadata ? { metadata } : {}),
    ...(req?.ip ? { ipAddress: req.ip } : {}),
    ...(req?.get('user-agent') ? { userAgent: req.get('user-agent') as string } : {}),
  });
};
