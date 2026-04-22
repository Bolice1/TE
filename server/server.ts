import express from 'express';
import cors from 'cors';
import reportRoutes from './routes/reportRoutes.js';
import studentRoutes from './routes/authRoutes.js';
import limiter from './middlewares/rateLimitor.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter); // Apply rate limiting to all routes


// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);

export default app;