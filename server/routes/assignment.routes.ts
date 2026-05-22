import { Router } from 'express';
import {
  createAssignment,
  createCourse,
  listAssignments,
  listCourses,
} from '../controllers/assignment.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

router.use(authenticate, requireTeacher);
router.post('/courses', createCourse);
router.get('/courses', listCourses);
router.post('/', createAssignment);
router.get('/', listAssignments);

export default router;
