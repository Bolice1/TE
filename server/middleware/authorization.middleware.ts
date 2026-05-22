import type { NextFunction, Request, Response } from 'express';

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access is required.' });
  }

  next();
};
