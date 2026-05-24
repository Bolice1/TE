import crypto from 'crypto';
import type { Request, Response } from 'express';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';
import { sendOtpEmail } from '../utils/otp.email.js';
import { getEmailTransportDebugInfo, isEmailTransportConfigured } from '../utils/email.js';
import { isNonEmptyString, isValidEmail, toTrimmedString } from '../middleware/validation.middleware.js';
import { deleteOtp, readOtp, storeOtp } from '../utils/otp.store.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const requestSignupOtp = async (req: Request, res: Response) => {
  try {
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_EMAIL });
    }

    const existingTeacher = await Coach.findOne({ email, isDeleted: false });
    if (existingTeacher) {
      return res.status(409).json({ message: USER_MESSAGES.AUTH.TEACHER_ALREADY_EXISTS });
    }

    if (!isEmailTransportConfigured()) {
      console.error('OTP email unavailable.', getEmailTransportDebugInfo());
      return res.status(503).json({
        message: 'We\'re having trouble sending verification codes. Please try again later.',
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + envConfiguration.otpExpiresAtMs);

    const storeResult = await storeOtp({
      email,
      otp,
      purpose: 'teacher-signup',
      ttlMs: envConfiguration.otpExpiresAtMs,
      expiresAt,
    });

    const mailResult = await sendOtpEmail(email, otp);

    if (!mailResult.delivered) {
      await deleteOtp({ email, purpose: 'teacher-signup' });
      console.error('OTP email delivery failed.', getEmailTransportDebugInfo());
      return res.status(503).json({
        message: 'We\'re having trouble sending your verification code. Please try again later.',
      });
    }

    return res.status(200).json({
      message: 'A verification code has been sent to your email.',
      email,
      expiresAt,
      storage: storeResult.backend,
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const verifyOtpCode = async (req: Request, res: Response) => {
  try {
    const email = toTrimmedString(req.body.email)?.toLowerCase();
    const otp = toTrimmedString(req.body.otp);

    if (!email || !otp) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_EMAIL });
    }

    const storedOtp = await readOtp({ email, purpose: 'teacher-signup' });
    if (!storedOtp) {
      return res.status(400).json({ message: USER_MESSAGES.AUTH.OTP_EXPIRED });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: USER_MESSAGES.AUTH.OTP_INVALID });
    }

    return res.status(200).json({
      message: 'Your verification code has been verified successfully.',
      verified: true,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const consumeValidOtp = async (email: string, otp: string) => {
  if (!isNonEmptyString(email) || !isNonEmptyString(otp)) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  const storedOtp = await readOtp({ email: normalizedEmail, purpose: 'teacher-signup' });

  if (!storedOtp || storedOtp !== otp) {
    return null;
  }

  await deleteOtp({ email: normalizedEmail, purpose: 'teacher-signup' });
  return {
    email: normalizedEmail,
    otp,
    purpose: 'teacher-signup' as const,
  };
};
