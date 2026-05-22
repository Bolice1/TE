import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coach from '../models/coach.model.js';
import TeacherSession from '../models/session.model.js';
import envConfiguration from '../config/env.js';

type AuthTokenPayload = {
  userId: string;
  role: 'teacher';
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
    const [teacher, session] = await Promise.all([
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

    if (!teacher || !session) {
      return res.status(401).json({ message: 'Teacher account not found.' });
    }

    req.user = {
      id: teacher.id,
      email: teacher.email,
      role: 'teacher',
      name: teacher.name,
      coachingName: teacher.coachingName,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
