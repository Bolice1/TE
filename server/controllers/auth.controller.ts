import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';
import { consumeValidOtp } from './otp.controller.js';
import { toTrimmedString } from '../middleware/validation.middleware.js';

const buildToken = (userId: string) => {
  const expiresIn = envConfiguration.tokenExpiresIn as NonNullable<jwt.SignOptions['expiresIn']>;

  return jwt.sign({ userId, role: 'teacher' }, envConfiguration.jwtToken, {
    expiresIn,
  });
};

export const registerCoach = async (req: Request, res: Response) => {
  try {
    const name = toTrimmedString(req.body.name);
    const email = toTrimmedString(req.body.email)?.toLowerCase();
    const coachingName = toTrimmedString(req.body.coachingName);
    const address = toTrimmedString(req.body.address);
    const password = toTrimmedString(req.body.password);
    const otp = toTrimmedString(req.body.otp);

    if (!name || !email || !coachingName || !address || !password || !otp) {
      return res.status(400).json({
        message: 'Name, email, school name, address, password, and OTP are required.',
      });
    }

    const existingUser = await Coach.findOne({ email, isDeleted: false });
    if (existingUser) {
      return res.status(409).json({ message: 'Teacher already exists.' });
    }

    const verifiedOtp = await consumeValidOtp(email, otp);
    if (!verifiedOtp) {
      return res.status(400).json({ message: 'OTP is invalid or expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCoach = await Coach.create({
      email,
      name,
      address,
      coachingName,
      password: hashedPassword,
      isEmailVerified: true,
    });

    const token = buildToken(newCoach.id);

    return res.status(201).json({
      message: 'Teacher account created successfully.',
      token,
      teacher: {
        id: newCoach.id,
        email: newCoach.email,
        name: newCoach.name,
        coachingName: newCoach.coachingName,
        address: newCoach.address,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create teacher account.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const password = toTrimmedString(req.body.password);
    const email = toTrimmedString(req.body.email)?.toLowerCase();

    if (!password || !email) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const teacher = await Coach.findOne({ email, isDeleted: false });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = buildToken(teacher.id);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        coachingName: teacher.coachingName,
        address: teacher.address,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const teacher = await Coach.findById(teacherId).select('-password');

    if (!teacher || teacher.isDeleted) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    return res.status(200).json({ teacher });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch teacher profile.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const updates: Record<string, string> = {};
    const name = toTrimmedString(req.body.name);
    const coachingName = toTrimmedString(req.body.coachingName);
    const address = toTrimmedString(req.body.address);

    if (name) updates.name = name;
    if (coachingName) updates.coachingName = coachingName;
    if (address) updates.address = address;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    const updatedProfile = await Coach.findOneAndUpdate(
      { _id: teacherId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      teacher: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update teacher profile.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
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
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    return res.status(200).json({
      message: 'Teacher account deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete teacher account.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
