import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js';
import reportRoutes from './routes/reportRoutes.js';
import studentRoutes from './routes/authRoutes.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDb();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;