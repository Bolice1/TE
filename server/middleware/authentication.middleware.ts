import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coach from '../models/coach.model.js';
import TeacherSession from '../models/session.model.js';
import envConfiguration from '../config/env.js';

type AuthTokenPayload = {
  userId: string;
  role: 'SUPER_ADMIN' | 'COACH';
  sessionId: string;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, envConfiguration.jwtToken) as AuthTokenPayload;
    const [coach, session] = await Promise.all([
      Coach.findOne({
        _id: payload.userId,
        isDeleted: false,
      }).select('-password'),
      TeacherSession.findOne({
        tokenId: payload.sessionId,
        teacher: payload.userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }),
    ]);

    if (!coach || !session) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (typeof coach.isActive !== 'undefined' && coach.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact an administrator.' });
    }

    req.user = {
      id: coach.id,
      email: coach.email,
      role: payload.role,
      name: coach.name,
      coachingName: coach.coachingName,
      sessionId: payload.sessionId,
      isActive: coach.isActive,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
