import crypto from 'crypto';
import type { Request, Response } from 'express';
import OTP from '../models/otp.model.schema.js';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';
import { sendOtpEmail } from '../utils/otp.email.js';
import { isNonEmptyString, toTrimmedString } from '../middleware/validation.middleware.js';

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const requestSignupOtp = async (req: Request, res: Response) => {
  try {
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const existingTeacher = await Coach.findOne({ email, isDeleted: false });
    if (existingTeacher) {
      return res.status(409).json({ message: 'A teacher account already exists with that email.' });
    }

    await OTP.deleteMany({ email, purpose: 'teacher-signup' });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + envConfiguration.otpExpiresAtMs);

    await OTP.create({
      email,
      otp,
      purpose: 'teacher-signup',
      expiresAt,
    });

    const mailResult = await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: 'OTP sent successfully.',
      email,
      expiresAt,
      ...(mailResult.delivered ? {} : { otpPreview: otp }),
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

    const record = await OTP.findOne({
      email,
      otp,
      purpose: 'teacher-signup',
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
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

  const record = await OTP.findOne({
    email: email.toLowerCase(),
    otp,
    purpose: 'teacher-signup',
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return null;
  }

  await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'teacher-signup' });
  return record;
};
