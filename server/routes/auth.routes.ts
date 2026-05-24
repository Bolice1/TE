import { Router } from 'express';
import { deleteProfile, getProfile, login, logout, update, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authentication.middleware.js';
import { requireAnyAuth } from '../middleware/authorization.middleware.js';

const router = Router();

// Authentication
router.post('/login', login);
router.post('/logout', authenticate, requireAnyAuth, logout);
router.get('/me', authenticate, requireAnyAuth, getProfile);
router.patch('/me', authenticate, requireAnyAuth, update);
router.delete('/me', authenticate, requireAnyAuth, deleteProfile);

// Password management
router.post('/change-password', authenticate, requireAnyAuth, changePassword);
// TODO: add forgot-password and reset-password controllers

export default router;
