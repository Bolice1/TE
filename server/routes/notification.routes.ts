import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireAnyAuth } from '../middleware/authorization.middleware.js';

const router = Router();

router.get('/', authenticate, requireAnyAuth, listNotifications);
router.patch('/:id/read', authenticate, requireAnyAuth, markRead);
router.patch('/read-all', authenticate, requireAnyAuth, markAllRead);

export default router;
