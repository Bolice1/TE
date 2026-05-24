import crypto from 'crypto';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import TeacherSession from '../models/session.model.js';
import envConfiguration from '../config/env.js';

export const buildToken = (userId: string, sessionId: string, role: 'SUPER_ADMIN' | 'COACH' = 'COACH') => {
  const expiresIn = envConfiguration.tokenExpiresIn as NonNullable<jwt.SignOptions['expiresIn']>;

  const token = jwt.sign({ userId, role, sessionId }, envConfiguration.jwtToken, {
    expiresIn,
  });

  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  const exp = decoded?.exp;

  if (!exp) {
    throw new Error('Unable to determine token expiration.');
  }

  return {
    token,
    expiresAt: new Date(exp * 1000),
  };
};

export const createTeacherSession = async (req: Request, teacherId: string, role: 'SUPER_ADMIN' | 'COACH' = 'COACH') => {
  const sessionId = crypto.randomUUID();
  const { token, expiresAt } = buildToken(teacherId, sessionId, role);

  await TeacherSession.create({
    teacher: teacherId,
    tokenId: sessionId,
    ...(req.get('user-agent') ? { userAgent: req.get('user-agent') as string } : {}),
    ...(req.ip ? { ipAddress: req.ip } : {}),
    expiresAt,
  });

  return {
    token,
    sessionId,
    expiresAt,
  };
};

export const revokeTeacherSession = async (sessionId: string) => {
  await TeacherSession.findOneAndUpdate(
    { tokenId: sessionId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};
