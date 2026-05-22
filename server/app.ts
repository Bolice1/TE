import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import marksRoutes from './routes/marks.routes.js';
import reportRoutes from './routes/reports.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'school-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use(errorHandler);
