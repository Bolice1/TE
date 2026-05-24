import type { NextFunction, Request, Response } from 'express';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: USER_MESSAGES.AUTH.UNAUTHORIZED });
  }

  next();
};
