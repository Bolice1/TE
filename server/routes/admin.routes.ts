import { Router } from 'express';
import {
  createCoach,
  listCoaches,
  getCoachDetails,
  deactivateCoach,
  reactivateCoach,
  sendNotification,
  getDashboardStats,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

router.post('/coaches', authenticate, requireAdmin, createCoach);
router.get('/coaches', authenticate, requireAdmin, listCoaches);
router.get('/coaches/:id', authenticate, requireAdmin, getCoachDetails);
router.patch('/coaches/:id/deactivate', authenticate, requireAdmin, deactivateCoach);
router.patch('/coaches/:id/reactivate', authenticate, requireAdmin, reactivateCoach);

router.post('/notifications', authenticate, requireAdmin, sendNotification);
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

export default router;
