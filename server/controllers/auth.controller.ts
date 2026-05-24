import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import Coach from '../models/coach.model.js';
import TeacherSession from '../models/session.model.js';
import envConfiguration from '../config/env.js';
import {
  hasMinimumPasswordLength,
  isValidEmail,
  toTrimmedString,
} from '../middleware/validation.middleware.js';
import { buildTeacherCachePrefix, deleteCachedByPrefix } from '../utils/cache.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createTeacherSession, revokeTeacherSession } from '../utils/session.js';

const SALT_ROUNDS = 10;

const sanitizeCoachForResponse = (coach: any) => ({
  id: coach.id,
  email: coach.email,
  name: coach.name,
  coachingName: coach.coachingName,
  address: coach.address,
  ...(coach.phoneNumber ? { phoneNumber: coach.phoneNumber } : {}),
  role: coach.role,
  isActive: coach.isActive,
  mustChangePassword: coach.mustChangePassword,
  isEmailVerified: coach.isEmailVerified,
});

export const login = async (req: Request, res: Response) => {
  try {
    const password = toTrimmedString(req.body.password);
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!password || !email) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const coach = await Coach.findOne({ email, isDeleted: false });
    if (!coach) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (coach.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const validPassword = await bcrypt.compare(password, coach.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const session = await createTeacherSession(req, coach.id);
    await writeAuditLog({
      req,
      teacherId: coach.id,
      action: 'login',
      entityType: 'coach',
      entityId: coach.id,
      status: 'success',
    }).catch(() => undefined);

    return res.status(200).json({
      message: 'Login successful.',
      token: session.token,
      auth: {
        type: 'Bearer',
        expiresIn: envConfiguration.tokenExpiresIn,
        sessionId: session.sessionId,
      },
      user: sanitizeCoachForResponse(coach),
    });
  } catch (error) {
    await writeAuditLog({
      req,
      action: 'login',
      entityType: 'coach',
      status: 'failure',
      metadata: { email: req.body.email },
    }).catch(() => undefined);
    return res.status(500).json({
      message: 'Login failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const coach = await Coach.findById(coachId).select('-password');

    if (!coach || coach.isDeleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      user: sanitizeCoachForResponse(coach),
      auth: { type: 'Bearer' },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch profile.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const updates: Record<string, string> = {};
    const name = toTrimmedString(req.body.name);
    const coachingName = toTrimmedString(req.body.coachingName);
    const address = toTrimmedString(req.body.address);
    const phoneNumber = toTrimmedString(req.body.phoneNumber);

    if (name) updates.name = name;
    if (coachingName) updates.coachingName = coachingName;
    if (address) updates.address = address;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    const updated = await Coach.findOneAndUpdate(
      { _id: coachId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found.' });

    return res.status(200).json({ message: 'Profile updated successfully.', user: sanitizeCoachForResponse(updated) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.user?.sessionId;
    const coachId = req.user?.id;
    if (!sessionId) return res.status(401).json({ message: 'Authentication is required.' });

    await revokeTeacherSession(sessionId);
    await writeAuditLog({ req, ...(coachId ? { teacherId: coachId } : {}), action: 'logout', entityType: 'session', entityId: sessionId, status: 'success' }).catch(() => undefined);

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log out.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) return res.status(401).json({ message: 'Authentication is required.' });

    const deleted = await Coach.findOneAndUpdate(
      { _id: coachId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!deleted) return res.status(404).json({ message: 'User not found.' });

    await TeacherSession.updateMany({ teacher: coachId, revokedAt: null }, { $set: { revokedAt: new Date() } });
    await deleteCachedByPrefix(buildTeacherCachePrefix(coachId, '')).catch(() => undefined);
    await writeAuditLog({ req, teacherId: coachId, action: 'delete_profile', entityType: 'coach', entityId: coachId, status: 'success' }).catch(() => undefined);

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete account.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const coachId = req.user?.id;
    if (!coachId) return res.status(401).json({ message: 'Authentication is required.' });

    const currentPassword = toTrimmedString(req.body.currentPassword);
    const newPassword = toTrimmedString(req.body.newPassword);

    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new passwords are required.' });
    if (!hasMinimumPasswordLength(newPassword)) return res.status(400).json({ message: 'New password is too short.' });

    const coach = await Coach.findById(coachId);
    if (!coach || coach.isDeleted) return res.status(404).json({ message: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, coach.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    coach.password = hashed;
    coach.mustChangePassword = false;
    await coach.save();

    await writeAuditLog({ req, teacherId: coachId, action: 'change_password', entityType: 'coach', entityId: coachId, status: 'success' }).catch(() => undefined);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to change password.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
