import type { Response } from 'express';

export type ApiSuccessEnvelope<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
  },
) => {
  const payload: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(options?.message ? { message: options.message } : {}),
    ...(options?.meta ? { meta: options.meta } : {}),
  };

  return res.status(statusCode).json(payload);
};
