import { Router } from 'express';
import {
  getAnalyticsDashboard,
  getClassesAnalytics,
  getCoursesAnalytics,
  getGradesInsights,
  getReportsSummary,
  getTopStudents,
  getTrendInsights,
  getWeakStudents,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireCoach } from '../middleware/authorization.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(authenticate, requireCoach);

router.get('/dashboard', asyncHandler(getAnalyticsDashboard));
router.get('/students/top', asyncHandler(getTopStudents));
router.get('/students/weak', asyncHandler(getWeakStudents));
router.get('/classes', asyncHandler(getClassesAnalytics));
router.get('/courses', asyncHandler(getCoursesAnalytics));
router.get('/trends', asyncHandler(getTrendInsights));
router.get('/grades', asyncHandler(getGradesInsights));
router.get('/reports/summary', asyncHandler(getReportsSummary));

export default router;
