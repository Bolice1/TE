import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coach from '../models/coach.model.js';
import TeacherSession from '../models/session.model.js';
import envConfiguration from '../config/env.js';
import { consumeValidOtp } from './otp.controller.js';
import {
  hasMinimumPasswordLength,
  isValidEmail,
  toTrimmedString,
} from '../middleware/validation.middleware.js';
import { buildTeacherCachePrefix, deleteCachedByPrefix } from '../utils/cache.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createTeacherSession, revokeTeacherSession } from '../utils/session.js';
import { sendTeacherWelcomeEmail } from '../utils/welcome.email.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const registerCoach = async (req: Request, res: Response) => {
  try {
    const name = toTrimmedString(req.body.name);
    const email = toTrimmedString(req.body.email)?.toLowerCase();
    const coachingName = toTrimmedString(req.body.coachingName);
    const address = toTrimmedString(req.body.address);
    const phoneNumber = toTrimmedString(req.body.phoneNumber) ?? undefined;
    const password = toTrimmedString(req.body.password);
    const otp = toTrimmedString(req.body.otp);

    if (!name || !email || !coachingName || !address || !password || !otp) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_EMAIL });
    }

    if (!hasMinimumPasswordLength(password)) {
      return res.status(400).json({
        message: USER_MESSAGES.AUTH.PASSWORD_TOO_SHORT,
      });
    }

    const existingUser = await Coach.findOne({ email, isDeleted: false });
    if (existingUser) {
      return res.status(409).json({ message: USER_MESSAGES.AUTH.TEACHER_ALREADY_EXISTS });
    }

    const verifiedOtp = await consumeValidOtp(email, otp);
    if (!verifiedOtp) {
      return res.status(400).json({ message: USER_MESSAGES.AUTH.OTP_INVALID });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCoach = await Coach.create({
      email,
      name,
      address,
      coachingName,
      ...(phoneNumber ? { phoneNumber } : {}),
      password: hashedPassword,
      isEmailVerified: true,
    });

    const session = await createTeacherSession(req, newCoach.id);
    const welcomeEmail = await sendTeacherWelcomeEmail({
      email: newCoach.email,
      teacherName: newCoach.name,
      coachingName: newCoach.coachingName,
    }).catch((error: unknown) => {
      console.error('Failed to send welcome email:', error);
      return { delivered: false };
    });

    await writeAuditLog({
      req,
      teacherId: newCoach.id,
      action: 'teacher_signup',
      entityType: 'teacher',
      entityId: newCoach.id,
      status: 'success',
    }).catch(() => undefined);

    return res.status(201).json({
      message: 'Your account has been created successfully.',
      token: session.token,
      auth: {
        type: 'Bearer',
        expiresIn: envConfiguration.tokenExpiresIn,
        sessionId: session.sessionId,
      },
      emailDelivery: {
        welcomeDelivered: welcomeEmail.delivered,
      },
      teacher: {
        id: newCoach.id,
        email: newCoach.email,
        name: newCoach.name,
        coachingName: newCoach.coachingName,
        address: newCoach.address,
        ...(newCoach.phoneNumber ? { phoneNumber: newCoach.phoneNumber } : {}),
        isEmailVerified: newCoach.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    await writeAuditLog({
      req,
      action: 'teacher_signup',
      entityType: 'teacher',
      status: 'failure',
      metadata: { email: req.body.email },
    }).catch(() => undefined);
    return res.status(500).json({
      message: USER_MESSAGES.AUTH.SIGNUP_FAILED,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const password = toTrimmedString(req.body.password);
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!password || !email) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_EMAIL });
    }

    const teacher = await Coach.findOne({ email, isDeleted: false });
    if (!teacher) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.INVALID_CREDENTIALS });
    }

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.INVALID_CREDENTIALS });
    }

    const session = await createTeacherSession(req, teacher.id);
    await writeAuditLog({
      req,
      teacherId: teacher.id,
      action: 'teacher_login',
      entityType: 'teacher',
      entityId: teacher.id,
      status: 'success',
    }).catch(() => undefined);

    return res.status(200).json({
      message: 'You have been logged in successfully.',
      token: session.token,
      auth: {
        type: 'Bearer',
        expiresIn: envConfiguration.tokenExpiresIn,
        sessionId: session.sessionId,
      },
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        coachingName: teacher.coachingName,
        address: teacher.address,
        ...(teacher.phoneNumber ? { phoneNumber: teacher.phoneNumber } : {}),
        isEmailVerified: teacher.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    await writeAuditLog({
      req,
      action: 'teacher_login',
      entityType: 'teacher',
      status: 'failure',
      metadata: { email: req.body.email },
    }).catch(() => undefined);
    return res.status(500).json({
      message: USER_MESSAGES.AUTH.LOGIN_FAILED,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const teacher = await Coach.findById(teacherId).select('-password');

    if (!teacher || teacher.isDeleted) {
      return res.status(404).json({ message: USER_MESSAGES.AUTH.ACCOUNT_NOT_FOUND });
    }

    return res.status(200).json({
      teacher,
      auth: {
        type: 'Bearer',
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
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
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    const updatedProfile = await Coach.findOneAndUpdate(
      { _id: teacherId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedProfile) {
      return res.status(404).json({ message: USER_MESSAGES.AUTH.ACCOUNT_NOT_FOUND });
    }

    return res.status(200).json({
      message: 'Your profile has been updated successfully.',
      teacher: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.user?.sessionId;
    const teacherId = req.user?.id;
    if (!sessionId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    await revokeTeacherSession(sessionId);
    await writeAuditLog({
      req,
      ...(teacherId ? { teacherId } : {}),
      action: 'teacher_logout',
      entityType: 'session',
      entityId: sessionId,
      status: 'success',
    }).catch(() => undefined);

    return res.status(200).json({
      message: 'You have been logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const deletedTeacher = await Coach.findOneAndUpdate(
      { _id: teacherId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!deletedTeacher) {
      return res.status(404).json({ message: USER_MESSAGES.AUTH.ACCOUNT_NOT_FOUND });
    }

    await TeacherSession.updateMany(
      { teacher: teacherId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    await deleteCachedByPrefix(buildTeacherCachePrefix(teacherId, ''));
    await writeAuditLog({
      req,
      teacherId,
      action: 'teacher_delete_profile',
      entityType: 'teacher',
      entityId: teacherId,
      status: 'success',
    }).catch(() => undefined);

    return res.status(200).json({
      message: 'Your account has been deleted successfully.',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};
