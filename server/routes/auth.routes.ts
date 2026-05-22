import { Router } from 'express';
import { deleteProfile, getProfile, login, logout, registerCoach, update } from '../controllers/auth.controller.js';
import { requestSignupOtp, verifyOtpCode } from '../controllers/otp.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';

const router = Router();

router.post('/otp/request', requestSignupOtp);
router.post('/otp/verify', verifyOtpCode);
router.post('/signup', registerCoach);
router.post('/login', login);
router.post('/logout', authenticate, requireTeacher, logout);
router.get('/me', authenticate, requireTeacher, getProfile);
router.patch('/me', authenticate, requireTeacher, update);
router.delete('/me', authenticate, requireTeacher, deleteProfile);

export default router;
