import type { NextFunction, Request, Response } from 'express';
import SignupToken from '../models/signup-token.model.js';

declare global {
  namespace Express {
    interface Request {
      signupEmail?: string;
      signupToken?: string;
    }
  }
}

export const validateSignupToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Signup verification token is required.',
      });
    }

    const token = authHeader.slice(7);

    const signupToken = await SignupToken.findOne({
      token,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!signupToken) {
      return res.status(401).json({
        message: 'Invalid or expired signup token. Please verify your email again.',
      });
    }

    req.signupEmail = signupToken.email;
    req.signupToken = token;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid signup token.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
