import { Router } from 'express';
import { listStudents, registerStudent } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

router.use(authenticate, requireTeacher);
router.post('/', registerStudent);
router.get('/', listStudents);

export default router;
