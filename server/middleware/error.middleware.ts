import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  console.error('Unhandled error:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
    ...(error instanceof Error ? { error: error.message } : {}),
  });
};
