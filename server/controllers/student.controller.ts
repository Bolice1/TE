import type { Request, Response } from 'express';
import Student from '../models/student.model.js';
import { toTrimmedString } from '../middleware/validation.middleware.js';

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const name = toTrimmedString(req.body.name);
    const studentCode = toTrimmedString(req.body.studentCode)?.toUpperCase();
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const parentName = toTrimmedString(req.body.parentName);
    const parentEmail = toTrimmedString(req.body.parentEmail)?.toLowerCase();
    const parentPhone = toTrimmedString(req.body.parentPhone);

    if (!name || !studentCode || !className || !year || !parentName) {
      return res.status(400).json({
        message: 'Name, student code, class, year, and parent name are required.',
      });
    }

    const existingStudent = await Student.findOne({ studentCode, isDeleted: false });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student code already exists.' });
    }

    const payload: Record<string, unknown> = {
      name,
      studentCode,
      className,
      year,
      parentName,
      registeredBy: teacherId,
    };

    if (parentEmail) payload.parentEmail = parentEmail;
    if (parentPhone) payload.parentPhone = parentPhone;

    const student = await Student.create(payload);

    return res.status(201).json({
      message: 'Student registered successfully.',
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to register student.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  try {
    const className = toTrimmedString(req.query.className);
    const year = toTrimmedString(req.query.year);
    const query: Record<string, unknown> = { isDeleted: false };

    if (className) query.className = className;
    if (year) query.year = year;

    const students = await Student.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ students });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch students.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
