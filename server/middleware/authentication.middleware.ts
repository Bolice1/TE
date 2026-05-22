import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';

type AuthTokenPayload = {
  userId: string;
  role: 'teacher';
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, envConfiguration.jwtToken) as AuthTokenPayload;
    const teacher = await Coach.findOne({
      _id: payload.userId,
      isDeleted: false,
    }).select('-password');

    if (!teacher) {
      return res.status(401).json({ message: 'Teacher account not found.' });
    }

    req.user = {
      id: teacher.id,
      email: teacher.email,
      role: 'teacher',
      name: teacher.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
