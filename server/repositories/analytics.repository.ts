import Marks from '../models/marks.model.js';
import type { PipelineStage } from 'mongoose';

export type AnalyticsFilter = {
  teacherId: string;
  term?: string;
  year?: string;
  className?: string;
  courseId?: string;
};

export const buildAnalyticsMatch = (filters: AnalyticsFilter) => {
  const match: Record<string, unknown> = {
    teacher: filters.teacherId,
    isDeleted: false,
  };

  if (filters.term) match.term = filters.term;
  if (filters.year) match.year = filters.year;
  if (filters.courseId) match.course = filters.courseId;

  return match;
};

export const fetchAnalyticsRows = async (filters: AnalyticsFilter) => {
  const pipeline: PipelineStage[] = [
    {
      $match: buildAnalyticsMatch(filters),
    },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $match: {
        'student.isDeleted': false,
        ...(filters.className ? { 'student.className': filters.className } : {}),
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $match: {
        'course.isDeleted': false,
      },
    },
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignment',
        foreignField: '_id',
        as: 'assignment',
      },
    },
    { $unwind: '$assignment' },
    {
      $match: {
        'assignment.isDeleted': false,
      },
    },
    {
      $project: {
        studentId: '$student._id',
        studentName: '$student.name',
        studentCode: '$student.studentCode',
        parentName: '$student.parentName',
        className: '$student.className',
        studentYear: '$student.year',
        courseId: '$course._id',
        courseName: '$course.name',
        courseCode: '$course.code',
        courseOutcome: '$course.outcome',
        assignmentId: '$assignment._id',
        assignmentTitle: '$assignment.title',
        assignmentType: '$assignment.type',
        assignmentDate: '$assignment.assignmentDate',
        assignmentDueDate: '$assignment.dueDate',
        assignmentMaxScore: '$assignment.maxScore',
        assignmentWeight: { $ifNull: ['$assignment.weight', 1] },
        competencyFocus: { $ifNull: ['$assignment.competencyFocus', []] },
        term: '$term',
        year: '$year',
        score: '$score',
        comment: '$comment',
        createdAt: '$createdAt',
      },
    },
    { $sort: { assignmentDate: 1, createdAt: 1 } },
  ];

  return Marks.aggregate(pipeline);
};
