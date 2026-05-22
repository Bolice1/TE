import { Router } from 'express';
import {
  downloadReport,
  generateReport,
  listReports,
  printReport,
  sendReportToParent,
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

router.use(authenticate, requireTeacher);
router.get('/', listReports);
router.post('/:studentId/generate', generateReport);
router.get('/:studentId/print', printReport);
router.get('/:studentId/download', downloadReport);
router.post('/:studentId/send', sendReportToParent);

export default router;
