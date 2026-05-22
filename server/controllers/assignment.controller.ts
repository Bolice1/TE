import type { Request, Response } from 'express';
import Assignment from '../models/assignment.model.js';
import Course from '../models/course.model.js';
import envConfiguration from '../config/env.js';
import {
  ensureDate,
  ensureNumber,
  ensureObjectId,
  ensureStringArray,
  toTrimmedString,
} from '../middleware/validation.middleware.js';
import { appCache, buildTeacherCachePrefix, invalidateTeacherDomains } from '../utils/cache.js';
import { getCurrentAcademicYear, isHistoricalAcademicYear } from '../utils/academic-year.js';

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const courseId = ensureObjectId(req.body.courseId);
    const type = toTrimmedString(req.body.type)?.toLowerCase() ?? 'assignment';
    const title = toTrimmedString(req.body.title);
    const description = toTrimmedString(req.body.description) ?? undefined;
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const maxScore = ensureNumber(req.body.maxScore);
    const assignmentDate = req.body.assignmentDate ? ensureDate(req.body.assignmentDate) : new Date();
    const dueDate = req.body.dueDate ? ensureDate(req.body.dueDate) : undefined;
    const startTime = req.body.startTime ? ensureDate(req.body.startTime) : undefined;
    const endTime = req.body.endTime ? ensureDate(req.body.endTime) : undefined;
    const weight = ensureNumber(req.body.weight) ?? 1;
    const competencyFocus = ensureStringArray(req.body.competencyFocus);

    if (!courseId || !title || !className || !year || maxScore === null) {
      return res.status(400).json({
        message: 'Course, title, class, year, and max score are required.',
      });
    }

    if (type !== 'assignment' && type !== 'quiz') {
      return res.status(400).json({ message: 'Type must be either assignment or quiz.' });
    }

    if (!assignmentDate) {
      return res.status(400).json({ message: 'Assignment date must be a valid date.' });
    }

    if (req.body.dueDate && !dueDate) {
      return res.status(400).json({ message: 'Due date must be a valid date.' });
    }

    if (req.body.startTime && !startTime) {
      return res.status(400).json({ message: 'Start time must be a valid date.' });
    }

    if (req.body.endTime && !endTime) {
      return res.status(400).json({ message: 'End time must be a valid date.' });
    }

    if (maxScore <= 0) {
      return res.status(400).json({ message: 'Max score must be greater than zero.' });
    }

    if (weight <= 0) {
      return res.status(400).json({ message: 'Weight must be greater than zero.' });
    }

    const course = await Course.findOne({
      _id: courseId,
      teacher: teacherId,
      isDeleted: false,
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found for this teacher.' });
    }

    if (isHistoricalAcademicYear(course.year) || isHistoricalAcademicYear(year)) {
      return res.status(400).json({
        message: 'Historical academic years are read-only. Create assessments in the current academic year.',
      });
    }

    if (course.className !== className || course.year !== year) {
      return res.status(400).json({
        message: 'Assignment class and year must match the selected course.',
      });
    }

    if (dueDate && dueDate < assignmentDate) {
      return res.status(400).json({
        message: 'Due date cannot be earlier than the assignment date.',
      });
    }

    if (startTime && endTime && endTime <= startTime) {
      return res.status(400).json({
        message: 'End time must be later than start time.',
      });
    }

    const assignmentPayload: Record<string, unknown> = {
      course: courseId,
      teacher: teacherId,
      type,
      title,
      assignmentDate,
      className,
      year,
      maxScore,
      weight,
    };

    if (description) assignmentPayload.description = description;
    if (dueDate) assignmentPayload.dueDate = dueDate;
    if (startTime) assignmentPayload.startTime = startTime;
    if (endTime) assignmentPayload.endTime = endTime;
    if (competencyFocus.length) assignmentPayload.competencyFocus = competencyFocus;

    const assignment = await Assignment.create(assignmentPayload);

    await invalidateTeacherDomains(teacherId, [
      'assignments',
      'courses',
      'marks',
      'reports',
      'analytics-dashboard',
      'analytics-dataset',
    ]);

    return res.status(201).json({
      message: 'Assignment created successfully.',
      assignment,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: 'An assessment with the same details already exists for this course.',
      });
    }

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
    const code = toTrimmedString(req.body.code)?.toUpperCase();
    const className = toTrimmedString(req.body.className);
    const year = toTrimmedString(req.body.year);
    const outcome = toTrimmedString(req.body.outcome);
    const description = toTrimmedString(req.body.description);
    const numberOfPeriodsInAWeek = ensureNumber(req.body.numberOfPeriodsInAWeek);

    if (!name || !className || !year || !outcome || numberOfPeriodsInAWeek === null) {
      return res.status(400).json({
        message: 'Name, class, year, periods per week, and outcome are required.',
      });
    }

    if (numberOfPeriodsInAWeek <= 0) {
      return res.status(400).json({ message: 'Periods per week must be greater than zero.' });
    }

    if (isHistoricalAcademicYear(year)) {
      return res.status(400).json({
        message: `Courses cannot be created for past academic years. Create the course in ${getCurrentAcademicYear()} or later.`,
      });
    }

    const course = await Course.create({
      name,
      ...(code ? { code } : {}),
      teacher: teacherId,
      className,
      year,
      outcome,
      ...(description ? { description } : {}),
      numberOfPeriodsInAWeek,
    });

    await invalidateTeacherDomains(teacherId, [
      'courses',
      'assignments',
      'marks',
      'reports',
      'analytics-dashboard',
      'analytics-dataset',
    ]);

    return res.status(201).json({
      message: 'Course created successfully.',
      course,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: 'A course with the same name or code already exists for this class and year.',
      });
    }

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

    const className = toTrimmedString(req.query.className);
    const year = toTrimmedString(req.query.year);
    const courseId = ensureObjectId(req.query.courseId);
    const type = toTrimmedString(req.query.type)?.toLowerCase();
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'assignments')}:${JSON.stringify({
      className,
      year,
      courseId,
      type,
    })}`;
    const cachedAssignments = appCache.get<{ assignments: unknown[]; courses: unknown[] }>(cacheKey);

    if (cachedAssignments) {
      return res.status(200).json(cachedAssignments);
    }

    const assignmentQuery: Record<string, unknown> = {
      teacher: teacherId,
      isDeleted: false,
    };

    const courseQuery: Record<string, unknown> = {
      teacher: teacherId,
      isDeleted: false,
    };

    if (className) {
      assignmentQuery.className = className;
      courseQuery.className = className;
    }

    if (year) {
      assignmentQuery.year = year;
      courseQuery.year = year;
    }

    if (courseId) {
      assignmentQuery.course = courseId;
    }

    if (type && (type === 'assignment' || type === 'quiz')) {
      assignmentQuery.type = type;
    }

    const assignments = await Assignment.find(assignmentQuery)
      .populate('course', 'name className year')
      .sort({ createdAt: -1 });

    const courses = await Course.find(courseQuery).sort({ createdAt: -1 });

    const payload = {
      assignments,
      courses,
    };
    appCache.set(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch assignments.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listCourses = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const className = toTrimmedString(req.query.className);
    const year = toTrimmedString(req.query.year);
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'courses')}:${JSON.stringify({
      className,
      year,
    })}`;
    const cachedCourses = appCache.get<{ courses: unknown[] }>(cacheKey);

    if (cachedCourses) {
      return res.status(200).json(cachedCourses);
    }

    const query: Record<string, unknown> = {
      teacher: teacherId,
      isDeleted: false,
    };

    if (className) query.className = className;
    if (year) query.year = year;

    const courses = await Course.find(query).sort({ createdAt: -1 });

    const payload = { courses };
    appCache.set(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch courses.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
