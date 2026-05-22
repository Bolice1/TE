import type { Request, Response } from 'express';
import Marks from '../models/marks.model.js';
import Reports from '../models/reports.model.js';
import Student from '../models/student.model.js';
import { ensureObjectId, toTrimmedString } from '../middleware/validation.middleware.js';

const getGrade = (average: number): string => {
  if (average >= 85) return 'A';
  if (average >= 70) return 'B';
  if (average >= 55) return 'C';
  if (average >= 40) return 'D';
  return 'F';
};

const buildReportHtml = (params: {
  studentName: string;
  studentCode: string;
  className: string;
  year: string;
  term: string;
  schoolName: string;
  marks: Array<{ courseName: string; assignmentTitle: string; score: number; maxScore: number; comment?: string }>;
  totalScore: number;
  average: number;
  grade: string;
}) => {
  const rows = params.marks
    .map(
      (item) => `
        <tr>
          <td>${item.courseName}</td>
          <td>${item.assignmentTitle}</td>
          <td>${item.score}</td>
          <td>${item.maxScore}</td>
          <td>${item.comment ?? '-'}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${params.studentName} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
          h1, h2 { margin-bottom: 8px; }
          .meta { margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          th { background: #f3f4f6; }
          .summary { margin-top: 24px; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>${params.schoolName}</h1>
        <h2>Student Report Card</h2>
        <div class="meta">
          <p><strong>Student:</strong> ${params.studentName}</p>
          <p><strong>Student Code:</strong> ${params.studentCode}</p>
          <p><strong>Class:</strong> ${params.className}</p>
          <p><strong>Academic Year:</strong> ${params.year}</p>
          <p><strong>Term:</strong> ${params.term}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Assignment</th>
              <th>Score</th>
              <th>Max Score</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <p><strong>Total Score:</strong> ${params.totalScore}</p>
          <p><strong>Average:</strong> ${params.average.toFixed(2)}</p>
          <p><strong>Grade:</strong> ${params.grade}</p>
        </div>
      </body>
    </html>
  `;
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const teacherName = req.user?.name;
    if (!teacherId || !teacherName) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const studentId = ensureObjectId(req.params.studentId);
    const term = toTrimmedString(req.query.term);
    const year = toTrimmedString(req.query.year);

    if (!studentId || !term || !year) {
      return res.status(400).json({
        message: 'Student id, term, and year are required.',
      });
    }

    const [student, marks] = await Promise.all([
      Student.findOne({ _id: studentId, isDeleted: false }),
      Marks.find({
        student: studentId,
        teacher: teacherId,
        term,
        year,
        isDeleted: false,
      })
        .populate('course', 'name')
        .populate('assignment', 'title maxScore'),
    ]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    if (!marks.length) {
      return res.status(404).json({ message: 'No marks found for this student, term, and year.' });
    }

    const totalScore = marks.reduce((sum, mark) => sum + mark.score, 0);
    const average = totalScore / marks.length;
    const grade = getGrade(average);

    const formattedMarks = marks.map((mark) => ({
      courseName: (mark.course as unknown as { name: string }).name,
      assignmentTitle: (mark.assignment as unknown as { title: string }).title,
      score: mark.score,
      maxScore: (mark.assignment as unknown as { maxScore: number }).maxScore,
      ...(mark.comment ? { comment: mark.comment } : {}),
    }));

    const html = buildReportHtml({
      studentName: student.name,
      studentCode: student.studentCode,
      className: student.className,
      year,
      term,
      schoolName: teacherName,
      marks: formattedMarks,
      totalScore,
      average,
      grade,
    });

    const report = await Reports.findOneAndUpdate(
      { student: studentId, teacher: teacherId, year, term },
      {
        $set: {
          average,
          totalScore,
          grade,
          html,
          student: studentId,
          teacher: teacherId,
          year,
          term,
          isDeleted: false,
          deletedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.status(200).json({
      message: 'Report generated successfully.',
      report,
      summary: {
        totalScore,
        average,
        grade,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate student report.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const printReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const studentId = ensureObjectId(req.params.studentId);
    const term = toTrimmedString(req.query.term);
    const year = toTrimmedString(req.query.year);

    if (!studentId || !term || !year) {
      return res.status(400).json({
        message: 'Student id, term, and year are required.',
      });
    }

    const report = await Reports.findOne({
      student: studentId,
      teacher: teacherId,
      term,
      year,
      isDeleted: false,
    });

    if (!report) {
      return res.status(404).json({
        message: 'Report not found. Generate the report first.',
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(report.html);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to print report.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
