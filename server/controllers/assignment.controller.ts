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
import { buildTeacherCachePrefix, invalidateTeacherDomains, readListCache, writeListCache } from '../utils/cache.js';
import { getCurrentAcademicYear, isHistoricalAcademicYear } from '../utils/academic-year.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
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
        message: USER_MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    if (type !== 'assignment' && type !== 'quiz') {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_REQUEST });
    }

    if (!assignmentDate) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_DATE });
    }

    if (req.body.dueDate && !dueDate) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_DATE });
    }

    if (req.body.startTime && !startTime) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_DATE });
    }

    if (req.body.endTime && !endTime) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_DATE });
    }

    if (maxScore <= 0) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_SCORE });
    }

    if (weight <= 0) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_REQUEST });
    }

    const course = await Course.findOne({
      _id: courseId,
      teacher: teacherId,
      isDeleted: false,
    });

    if (!course) {
      return res.status(404).json({ message: USER_MESSAGES.GENERAL.NOT_FOUND });
    }

    if (isHistoricalAcademicYear(course.year) || isHistoricalAcademicYear(year)) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
      });
    }

    if (course.className !== className || course.year !== year) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
      });
    }

    if (dueDate && dueDate < assignmentDate) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
      });
    }

    if (startTime && endTime && endTime <= startTime) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
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
      message: 'Assessment has been created successfully.',
      assignment,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: USER_MESSAGES.GENERAL.RESOURCE_CONFLICT,
      });
    }

    console.error('Assignment creation error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.ASSIGNMENT.CREATE_FAILED,
    });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
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
        message: USER_MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    if (numberOfPeriodsInAWeek <= 0) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_REQUEST });
    }

    if (isHistoricalAcademicYear(year)) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
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
      message: 'Course has been created successfully.',
      course,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: USER_MESSAGES.GENERAL.RESOURCE_CONFLICT,
      });
    }

    console.error('Course creation error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};

export const listAssignments = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
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
    const cachedAssignments = await readListCache<{ assignments: unknown[]; courses: unknown[] }>(cacheKey);

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
    await writeListCache(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    console.error('List assignments error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.ASSIGNMENT.FETCH_FAILED,
    });
  }
};

export const listCourses = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const className = toTrimmedString(req.query.className);
    const year = toTrimmedString(req.query.year);
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'courses')}:${JSON.stringify({
      className,
      year,
    })}`;
    const cachedCourses = await readListCache<{ courses: unknown[] }>(cacheKey);

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
    await writeListCache(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    console.error('List courses error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.GENERAL.SERVER_ERROR,
    });
  }
};
