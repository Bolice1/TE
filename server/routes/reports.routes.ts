import { Router } from 'express';
import { generateReport, printReport } from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

router.use(authenticate, requireTeacher);
router.post('/:studentId/generate', generateReport);
router.get('/:studentId/print', printReport);

export default router;
