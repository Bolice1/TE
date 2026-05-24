import type { Request, Response } from 'express';
import Student from '../models/student.model.js';
import {
  ensureDate,
  isValidEmail,
  toTrimmedString,
} from '../middleware/validation.middleware.js';
import envConfiguration from '../config/env.js';
import { buildTeacherCachePrefix, invalidateTeacherDomains, readListCache, writeListCache } from '../utils/cache.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const name = toTrimmedString(req.body.name);
    const studentCode = toTrimmedString(req.body.studentCode)?.toUpperCase();
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const dateOfBirth = req.body.dateOfBirth ? ensureDate(req.body.dateOfBirth) : undefined;
    const parentName = toTrimmedString(req.body.parentName);
    const parentEmail = toTrimmedString(req.body.parentEmail)?.toLowerCase();
    const parentPhone = toTrimmedString(req.body.parentPhone);

    if (!name || !studentCode || !className || !year || !parentName) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    if (req.body.dateOfBirth && !dateOfBirth) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_DATE });
    }

    if (parentEmail && !isValidEmail(parentEmail)) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_PARENT_EMAIL });
    }

    const existingStudent = await Student.findOne({ studentCode, isDeleted: false });
    if (existingStudent) {
      return res.status(409).json({ message: USER_MESSAGES.VALIDATION.DUPLICATE_STUDENT_CODE });
    }

    const payload: Record<string, unknown> = {
      name,
      studentCode,
      className,
      year,
      ...(dateOfBirth ? { dateOfBirth } : {}),
      parentName,
      registeredBy: teacherId,
    };

    if (parentEmail) payload.parentEmail = parentEmail;
    if (parentPhone) payload.parentPhone = parentPhone;

    const student = await Student.create(payload);

    await invalidateTeacherDomains(teacherId, ['students', 'reports', 'marks', 'analytics-dashboard', 'analytics-dataset']);

    return res.status(201).json({
      message: 'Student has been registered successfully.',
      student,
    });
  } catch (error) {
    console.error('Student registration error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.STUDENT.REGISTER_FAILED,
    });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const className = toTrimmedString(req.query.className);
    const year = toTrimmedString(req.query.year);
    const studentCode = toTrimmedString(req.query.studentCode)?.toUpperCase();
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'students')}:${JSON.stringify({
      className,
      year,
      studentCode,
    })}`;
    const cachedStudents = await readListCache<{ students: unknown[] }>(cacheKey);

    if (cachedStudents) {
      return res.status(200).json(cachedStudents);
    }

    const query: Record<string, unknown> = {
      isDeleted: false,
      registeredBy: teacherId,
    };

    if (className) query.className = className;
    if (year) query.year = year;
    if (studentCode) query.studentCode = studentCode;

    const students = await Student.find(query).sort({ createdAt: -1 });

    const payload = { students };
    await writeListCache(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    console.error('List students error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.STUDENT.FETCH_FAILED,
    });
  }
};
