import type { NextFunction, Request, Response } from 'express';
import envConfiguration from '../config/env.js';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestOrigin = req.headers.origin;
  const configuredOrigin = envConfiguration.corsOrigin;
  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigins = configuredOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!requestOrigin) {
    res.header('Access-Control-Allow-Origin', configuredOrigin === '*' ? '*' : configuredOrigin);
  } else if (configuredOrigin === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  } else if (isDev) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
