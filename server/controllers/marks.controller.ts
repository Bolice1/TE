import type { Request, Response } from 'express';
import Assignment from '../models/assignment.model.js';
import Course from '../models/course.model.js';
import Marks from '../models/marks.model.js';
import Student from '../models/student.model.js';
import envConfiguration from '../config/env.js';
import { ensureNumber, ensureObjectId, toTrimmedString } from '../middleware/validation.middleware.js';
import { buildTeacherCachePrefix, invalidateTeacherDomains, readListCache, writeListCache } from '../utils/cache.js';
import { USER_MESSAGES } from '../utils/user-messages.js';

export const register = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const studentId = ensureObjectId(req.body.studentId);
    const courseId = ensureObjectId(req.body.courseId);
    const assignmentId = ensureObjectId(req.body.assignmentId);
    const score = ensureNumber(req.body.score);
    const term = toTrimmedString(req.body.term)?.toUpperCase();
    const year = toTrimmedString(req.body.year);
    const comment = toTrimmedString(req.body.comment);

    if (!studentId || !courseId || !assignmentId || score === null || !term || !year) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.MISSING_FIELDS,
      });
    }

    if (score < 0) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_SCORE });
    }

    const [student, course, assignment] = await Promise.all([
      Student.findOne({ _id: studentId, registeredBy: teacherId, isDeleted: false }),
      Course.findOne({ _id: courseId, teacher: teacherId, isDeleted: false }),
      Assignment.findOne({ _id: assignmentId, teacher: teacherId, isDeleted: false }),
    ]);

    if (!student) {
      return res.status(404).json({ message: USER_MESSAGES.STUDENT.NOT_FOUND });
    }

    if (!course) {
      return res.status(404).json({ message: USER_MESSAGES.GENERAL.NOT_FOUND });
    }

    if (!assignment) {
      return res.status(404).json({ message: USER_MESSAGES.GENERAL.NOT_FOUND });
    }

    if (String(assignment.course) !== courseId) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_REQUEST });
    }

    if (student.className !== course.className || student.year !== course.year) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
      });
    }

    if (assignment.className !== course.className || assignment.year !== course.year) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_REQUEST,
      });
    }

    if (score > assignment.maxScore) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_SCORE,
      });
    }

    const markPayload: Record<string, unknown> = {
      student: studentId,
      course: courseId,
      teacher: teacherId,
      assignment: assignmentId,
      score,
      term,
      year,
    };

    if (comment) markPayload.comment = comment;

    const registered = await Marks.create(markPayload);

    await invalidateTeacherDomains(teacherId, ['marks', 'reports', 'analytics-dashboard', 'analytics-dataset']);

    return res.status(201).json({
      message: 'Marks have been saved successfully.',
      mark: registered,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: USER_MESSAGES.GENERAL.RESOURCE_CONFLICT,
      });
    }

    console.error('Mark registration error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.MARKS.SAVE_FAILED,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const marksId = ensureObjectId(req.params.id);
    const score = ensureNumber(req.body.score);
    const comment = toTrimmedString(req.body.comment);

    if (!marksId) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    if (score === null && comment === null) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.MISSING_FIELDS });
    }

    if (score !== null && score < 0) {
      return res.status(400).json({ message: USER_MESSAGES.VALIDATION.INVALID_SCORE });
    }

    const mark = await Marks.findOne({
      _id: marksId,
      teacher: teacherId,
      isDeleted: false,
    }).populate('assignment', 'maxScore');

    if (!mark) {
      return res.status(404).json({ message: USER_MESSAGES.MARKS.NOT_FOUND });
    }

    const assignment = mark.assignment as unknown as { maxScore: number };

    if (score !== null && score > assignment.maxScore) {
      return res.status(400).json({
        message: USER_MESSAGES.VALIDATION.INVALID_SCORE,
      });
    }

    if (score !== null) {
      mark.score = score;
    }

    if (comment !== null) {
      mark.comment = comment;
    }

    await mark.save();

    await invalidateTeacherDomains(teacherId, ['marks', 'reports', 'analytics-dashboard', 'analytics-dataset']);

    return res.status(200).json({
      message: 'Marks have been updated successfully.',
      mark,
    });
  } catch (error) {
    console.error('Mark update error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.MARKS.UPDATE_FAILED,
    });
  }
};

export const listMarks = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: USER_MESSAGES.AUTH.TOKEN_REQUIRED });
    }

    const term = toTrimmedString(req.query.term)?.toUpperCase();
    const year = toTrimmedString(req.query.year);
    const className = toTrimmedString(req.query.className);
    const studentId = ensureObjectId(req.query.studentId);
    const courseId = ensureObjectId(req.query.courseId);
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'marks')}:${JSON.stringify({
      term,
      year,
      className,
      studentId,
      courseId,
    })}`;
    const cachedMarks = await readListCache<{ marks: unknown[] }>(cacheKey);

    if (cachedMarks) {
      return res.status(200).json(cachedMarks);
    }

    const query: Record<string, unknown> = {
      teacher: teacherId,
      isDeleted: false,
    };

    if (term) query.term = term;
    if (year) query.year = year;
    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;

    const marks = await Marks.find(query)
      .populate('student', 'name studentCode className year')
      .populate('course', 'name className year')
      .populate('assignment', 'title maxScore')
      .sort({ createdAt: -1 });

    const filteredMarks = className
      ? marks.filter((mark) => {
          const student = mark.student as { className?: string };
          return student.className === className;
        })
      : marks;

    const payload = {
      marks: filteredMarks,
    };
    await writeListCache(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    console.error('List marks error:', error);
    return res.status(500).json({
      message: USER_MESSAGES.MARKS.FETCH_FAILED,
    });
  }
};
