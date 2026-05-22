import type { Request, Response } from 'express';
import Assignment from '../models/assignment.model.js';
import Course from '../models/course.model.js';
import Marks from '../models/marks.model.js';
import Student from '../models/student.model.js';
import envConfiguration from '../config/env.js';
import { ensureNumber, ensureObjectId, toTrimmedString } from '../middleware/validation.middleware.js';
import { appCache, buildTeacherCachePrefix } from '../utils/cache.js';

export const register = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
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
        message: 'Student, course, assignment, score, term, and year are required.',
      });
    }

    if (score < 0) {
      return res.status(400).json({ message: 'Score cannot be negative.' });
    }

    const [student, course, assignment] = await Promise.all([
      Student.findOne({ _id: studentId, registeredBy: teacherId, isDeleted: false }),
      Course.findOne({ _id: courseId, teacher: teacherId, isDeleted: false }),
      Assignment.findOne({ _id: assignmentId, teacher: teacherId, isDeleted: false }),
    ]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (String(assignment.course) !== courseId) {
      return res.status(400).json({ message: 'Assignment does not belong to the selected course.' });
    }

    if (student.className !== course.className || student.year !== course.year) {
      return res.status(400).json({
        message: 'Student class and year must match the selected course.',
      });
    }

    if (assignment.className !== course.className || assignment.year !== course.year) {
      return res.status(400).json({
        message: 'Assignment class and year must match the selected course.',
      });
    }

    if (score > assignment.maxScore) {
      return res.status(400).json({
        message: `Score cannot exceed the assignment max score of ${assignment.maxScore}.`,
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

    appCache.deleteByPrefix(buildTeacherCachePrefix(teacherId, 'marks'));
    appCache.deleteByPrefix(buildTeacherCachePrefix(teacherId, 'reports'));

    return res.status(201).json({
      message: 'Student mark saved successfully.',
      mark: registered,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: 'A mark for this student and assignment already exists.',
      });
    }

    return res.status(500).json({
      message: 'Failed to save student mark.',
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

    const marksId = ensureObjectId(req.params.id);
    const score = ensureNumber(req.body.score);
    const comment = toTrimmedString(req.body.comment);

    if (!marksId) {
      return res.status(400).json({ message: 'Valid mark id is required.' });
    }

    if (score === null && comment === null) {
      return res.status(400).json({ message: 'Provide a score or comment to update.' });
    }

    if (score !== null && score < 0) {
      return res.status(400).json({ message: 'Score cannot be negative.' });
    }

    const mark = await Marks.findOne({
      _id: marksId,
      teacher: teacherId,
      isDeleted: false,
    }).populate('assignment', 'maxScore');

    if (!mark) {
      return res.status(404).json({ message: 'Mark not found.' });
    }

    const assignment = mark.assignment as unknown as { maxScore: number };

    if (score !== null && score > assignment.maxScore) {
      return res.status(400).json({
        message: `Score cannot exceed the assignment max score of ${assignment.maxScore}.`,
      });
    }

    if (score !== null) {
      mark.score = score;
    }

    if (comment !== null) {
      mark.comment = comment;
    }

    await mark.save();

    appCache.deleteByPrefix(buildTeacherCachePrefix(teacherId, 'marks'));
    appCache.deleteByPrefix(buildTeacherCachePrefix(teacherId, 'reports'));

    return res.status(200).json({
      message: 'Marks updated successfully.',
      mark,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update mark.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listMarks = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
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
    const cachedMarks = appCache.get<{ marks: unknown[] }>(cacheKey);

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
    appCache.set(cacheKey, payload, envConfiguration.cacheTtlMs);

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch marks.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
