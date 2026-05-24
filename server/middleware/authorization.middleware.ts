import type { NextFunction, Request, Response } from 'express';

type AllowedRole = 'SUPER_ADMIN' | 'COACH';

export const requireRole = (...roles: AllowedRole[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!roles.includes(req.user.role as AllowedRole)) {
    return res.status(403).json({ message: 'Insufficient permissions.' });
  }

  next();
};

export const requireAdmin = requireRole('SUPER_ADMIN');
export const requireCoach = requireRole('COACH');

export const requireAnyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  next();
};
