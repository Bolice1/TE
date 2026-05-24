import { Router } from 'express';
import { deleteProfile, getProfile, login, logout, registerCoach, update } from '../controllers/auth.controller.js';
import { requestSignupOtp, verifyOtpCode } from '../controllers/otp.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireTeacher } from '../middleware/authorization.middleware.js';
import { validateSignupToken } from '../middleware/signup-token.middleware.js';

const router = Router();

router.post('/signup/initiate', requestSignupOtp);
router.post('/signup/verify', verifyOtpCode);
router.post('/signup/complete', validateSignupToken, registerCoach);
router.post('/login', login);
router.post('/logout', authenticate, requireTeacher, logout);
router.get('/me', authenticate, requireTeacher, getProfile);
router.patch('/me', authenticate, requireTeacher, update);
router.delete('/me', authenticate, requireTeacher, deleteProfile);

export default router;
