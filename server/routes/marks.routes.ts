import { Router } from 'express';
import { listMarks, register, update } from '../controllers/marks.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireCoach } from '../middleware/authorization.middleware.js';

const router = Router();

router.use(authenticate, requireCoach);
router.post('/', register);
router.get('/', listMarks);
router.patch('/:id', update);

export default router;
