import { Router } from 'express';
import { getTeacherClasses, getTeacherYears } from '../controllers/teacher.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

// All teacher routes require authentication and teacher role
router.use(authenticate, requireTeacher);

// Get teacher's classes
router.get('/classes', getTeacherClasses);

// Get teacher's years
router.get('/years', getTeacherYears);

export default router;
