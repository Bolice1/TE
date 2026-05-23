import crypto from 'crypto';
import type { Request, Response } from 'express';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';
import { sendOtpEmail } from '../utils/otp.email.js';
import { getEmailTransportDebugInfo } from '../utils/email.js';
import { isNonEmptyString, isValidEmail, toTrimmedString } from '../middleware/validation.middleware.js';
import { deleteOtp, readOtp, storeOtp } from '../utils/otp.store.js';

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const requestSignupOtp = async (req: Request, res: Response) => {
  try {
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const existingTeacher = await Coach.findOne({ email, isDeleted: false });
    if (existingTeacher) {
      return res.status(409).json({ message: 'A teacher account already exists with that email.' });
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
        message: 'Unable to send verification code right now. Please try again later.',
      });
    }

    return res.status(200).json({
      message: 'OTP sent successfully.',
      email,
      expiresAt,
      storage: storeResult.backend,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate OTP.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyOtpCode = async (req: Request, res: Response) => {
  try {
    const email = toTrimmedString(req.body.email)?.toLowerCase();
    const otp = toTrimmedString(req.body.otp);

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const storedOtp = await readOtp({ email, purpose: 'teacher-signup' });
    if (!storedOtp) {
      return res.status(400).json({ message: 'No verification code found. Request a new OTP.' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    return res.status(200).json({
      message: 'OTP verified successfully.',
      verified: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to verify OTP.',
      error: error instanceof Error ? error.message : 'Unknown error',
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
