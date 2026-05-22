import type { Request, Response } from 'express';
import Assignment from '../models/assignment.model.js';
import Course from '../models/course.model.js';
import { ensureNumber, ensureObjectId, toTrimmedString } from '../middleware/validation.middleware.js';

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const courseId = ensureObjectId(req.body.courseId);
    const title = toTrimmedString(req.body.title);
    const description = toTrimmedString(req.body.description) ?? undefined;
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const maxScore = ensureNumber(req.body.maxScore);
    const assignmentDate = req.body.assignmentDate ? new Date(req.body.assignmentDate) : new Date();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;

    if (!courseId || !title || !className || !year || maxScore === null) {
      return res.status(400).json({
        message: 'Course, title, class, year, and max score are required.',
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      teacher: teacherId,
      isDeleted: false,
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found for this teacher.' });
    }

    const assignmentPayload: Record<string, unknown> = {
      course: courseId,
      teacher: teacherId,
      title,
      assignmentDate,
      className,
      year,
      maxScore,
    };

    if (description) assignmentPayload.description = description;
    if (dueDate) assignmentPayload.dueDate = dueDate;

    const assignment = await Assignment.create(assignmentPayload);

    return res.status(201).json({
      message: 'Assignment created successfully.',
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create assignment.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const name = toTrimmedString(req.body.name);
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const outcome = toTrimmedString(req.body.outcome);
    const numberOfPeriodsInAWeek = ensureNumber(req.body.numberOfPeriodsInAWeek);

    if (!name || !className || !year || !outcome || numberOfPeriodsInAWeek === null) {
      return res.status(400).json({
        message: 'Name, class, year, periods per week, and outcome are required.',
      });
    }

    const course = await Course.create({
      name,
      teacher: teacherId,
      className,
      year,
      outcome,
      numberOfPeriodsInAWeek,
    });

    return res.status(201).json({
      message: 'Course created successfully.',
      course,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create course.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listAssignments = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const assignments = await Assignment.find({
      teacher: teacherId,
      isDeleted: false,
    })
      .populate('course', 'name className year')
      .sort({ createdAt: -1 });

    const courses = await Course.find({
      teacher: teacherId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      assignments,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch assignments.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
