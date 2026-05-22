import type { Request, Response } from 'express';
import Reports from '../models/reports.model.js';
import envConfiguration from '../config/env.js';
import { ensureObjectId, ensureStringArray, toTrimmedString } from '../middleware/validation.middleware.js';
import { generateStudentReport } from '../services/report.service.js';
import { appCache, buildTeacherCachePrefix, invalidateTeacherDomains } from '../utils/cache.js';
import { sendParentReportEmail } from '../utils/report.email.js';
import { writeAuditLog } from '../services/audit.service.js';

const invalidateReportCache = (teacherId: string) => {
  appCache.deleteByPrefix(buildTeacherCachePrefix(teacherId, 'reports'));
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const teacherName = req.user?.name;
    const schoolName = req.user?.coachingName;

    if (!teacherId || !teacherName || !schoolName) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const studentId = ensureObjectId(req.params.studentId);
    const year = toTrimmedString(req.query.year);
    const reportType = toTrimmedString(req.query.reportType)?.toLowerCase() === 'annual' ? 'annual' : 'term';
    const term = reportType === 'term' ? toTrimmedString(req.query.term)?.toUpperCase() : undefined;

    if (!studentId || !year || (reportType === 'term' && !term)) {
      return res.status(400).json({
        message: 'Student id, year, and term are required for term report generation.',
      });
    }

    const teacherComment = toTrimmedString(req.body.teacherComment) ?? undefined;
    const headTeacherComment = toTrimmedString(req.body.headTeacherComment) ?? undefined;
    const strengths = ensureStringArray(req.body.strengths);
    const weaknesses = ensureStringArray(req.body.weaknesses);
    const sendToParent = req.body.sendToParent === true;

    const { report, pdfBuffer, reportPayload } = await generateStudentReport({
      teacherId,
      teacherName,
      schoolName,
      studentId,
      year,
      reportType,
      ...(term ? { term } : {}),
      ...(teacherComment ? { teacherComment } : {}),
      ...(headTeacherComment ? { headTeacherComment } : {}),
      ...(strengths.length ? { strengths } : {}),
      ...(weaknesses.length ? { weaknesses } : {}),
    });

    invalidateReportCache(teacherId);
    await invalidateTeacherDomains(teacherId, ['analytics-dashboard', 'analytics-dataset']);
    await writeAuditLog({
      req,
      teacherId,
      action: 'report_generate',
      entityType: 'report',
      entityId: report.id,
      status: 'success',
      metadata: {
        reportType,
        year,
        term,
      },
    }).catch(() => undefined);

    let emailDelivery: { delivered: boolean } | undefined;
    if (sendToParent) {
      const parentEmail = (await Reports.populate(report, { path: 'student', select: 'parentEmail parentName name' })) as unknown as {
        student: { parentEmail?: string; parentName: string; name: string };
      };
      if (parentEmail.student.parentEmail) {
        emailDelivery = await sendParentReportEmail({
          parentEmail: parentEmail.student.parentEmail,
          parentName: parentEmail.student.parentName,
          studentName: parentEmail.student.name,
          reportTitle: reportPayload.reportTitle,
          pdfBuffer,
        }).catch(() => ({ delivered: false }));
      }
    }

    return res.status(200).json({
      message: 'Report generated successfully.',
      report,
      summary: {
        totalScore: report.totalScore,
        totalMaxScore: report.totalMaxScore,
        average: report.average,
        grade: report.grade,
        rank: report.rank,
        percentile: report.percentile,
      },
      download: {
        url: `/api/reports/${studentId}/download?year=${encodeURIComponent(year)}${
          term ? `&term=${encodeURIComponent(term)}` : ''
        }&reportType=${reportType}`,
      },
      ...(emailDelivery ? { emailDelivery } : {}),
    });
  } catch (error) {
    const year = toTrimmedString(req.query.year);
    const term = toTrimmedString(req.query.term);
    const entityId = typeof req.params.studentId === 'string' ? req.params.studentId : undefined;
    await writeAuditLog({
      req,
      ...(req.user?.id ? { teacherId: req.user.id } : {}),
      action: 'report_generate',
      entityType: 'report',
      ...(entityId ? { entityId } : {}),
      status: 'failure',
      metadata: { year, term },
    }).catch(() => undefined);
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
    const term = toTrimmedString(req.query.term)?.toUpperCase();
    const year = toTrimmedString(req.query.year);
    const reportType = toTrimmedString(req.query.reportType)?.toLowerCase() === 'annual' ? 'annual' : 'term';

    if (!studentId || !year || (reportType === 'term' && !term)) {
      return res.status(400).json({
        message: 'Student id, year, and term are required.',
      });
    }

    const reportQuery: Record<string, unknown> = {
      student: studentId,
      teacher: teacherId,
      year,
      reportType,
      isDeleted: false,
    };
    if (reportType === 'term' && term) {
      reportQuery.term = term;
    }

    const report = await Reports.findOne(reportQuery);

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

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const teacherName = req.user?.name;
    const schoolName = req.user?.coachingName;
    if (!teacherId || !teacherName || !schoolName) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const studentId = ensureObjectId(req.params.studentId);
    const year = toTrimmedString(req.query.year);
    const reportType = toTrimmedString(req.query.reportType)?.toLowerCase() === 'annual' ? 'annual' : 'term';
    const term = reportType === 'term' ? toTrimmedString(req.query.term)?.toUpperCase() : undefined;

    if (!studentId || !year || (reportType === 'term' && !term)) {
      return res.status(400).json({ message: 'Student id, year, and term are required.' });
    }

    const { pdfBuffer } = await generateStudentReport({
      teacherId,
      teacherName,
      schoolName,
      studentId,
      year,
      reportType,
      ...(term ? { term } : {}),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${studentId}-${year}-${reportType}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to download report.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendReportToParent = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const teacherName = req.user?.name;
    const schoolName = req.user?.coachingName;
    if (!teacherId || !teacherName || !schoolName) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const studentId = ensureObjectId(req.params.studentId);
    const year = toTrimmedString(req.query.year);
    const reportType = toTrimmedString(req.query.reportType)?.toLowerCase() === 'annual' ? 'annual' : 'term';
    const term = reportType === 'term' ? toTrimmedString(req.query.term)?.toUpperCase() : undefined;

    if (!studentId || !year || (reportType === 'term' && !term)) {
      return res.status(400).json({ message: 'Student id, year, and term are required.' });
    }

    const teacherComment = toTrimmedString(req.body.teacherComment);
    const headTeacherComment = toTrimmedString(req.body.headTeacherComment);
    const strengths = ensureStringArray(req.body.strengths);
    const weaknesses = ensureStringArray(req.body.weaknesses);

    const { pdfBuffer, reportPayload } = await generateStudentReport({
      teacherId,
      teacherName,
      schoolName,
      studentId,
      year,
      reportType,
      ...(term ? { term } : {}),
      ...(teacherComment ? { teacherComment } : {}),
      ...(headTeacherComment ? { headTeacherComment } : {}),
      ...(strengths.length ? { strengths } : {}),
      ...(weaknesses.length ? { weaknesses } : {}),
    });

    const reportQuery: Record<string, unknown> = {
      student: studentId,
      teacher: teacherId,
      year,
      reportType,
      isDeleted: false,
    };
    if (reportType === 'term' && term) {
      reportQuery.term = term;
    }

    const report = await Reports.findOne(reportQuery).populate('student', 'parentEmail parentName name');

    const student = report?.student as unknown as { parentEmail?: string; parentName: string; name: string } | undefined;
    if (!student?.parentEmail) {
      return res.status(400).json({ message: 'Parent email is not available for this student.' });
    }

    const emailDelivery = await sendParentReportEmail({
      parentEmail: student.parentEmail,
      parentName: student.parentName,
      studentName: student.name,
      reportTitle: reportPayload.reportTitle,
      pdfBuffer,
    });

    return res.status(200).json({
      message: 'Report sent to parent successfully.',
      emailDelivery,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send report to parent.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listReports = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const year = toTrimmedString(req.query.year);
    const term = toTrimmedString(req.query.term)?.toUpperCase();
    const studentId = ensureObjectId(req.query.studentId);
    const reportType = toTrimmedString(req.query.reportType)?.toLowerCase();
    const cacheKey = `${buildTeacherCachePrefix(teacherId, 'reports')}:${JSON.stringify({
      year,
      term,
      studentId,
      reportType,
    })}`;
    const cached = appCache.get<{ reports: unknown[] }>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const query: Record<string, unknown> = {
      teacher: teacherId,
      isDeleted: false,
    };

    if (year) query.year = year;
    if (term) query.term = term;
    if (studentId) query.student = studentId;
    if (reportType === 'annual' || reportType === 'term') query.reportType = reportType;

    const reports = await Reports.find(query)
      .populate('student', 'name studentCode className year parentName')
      .sort({ updatedAt: -1 });

    const payload = { reports };
    appCache.set(cacheKey, payload, envConfiguration.cacheTtlMs);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch reports.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
