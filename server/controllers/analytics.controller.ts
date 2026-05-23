import type { Request, Response } from 'express';
import {
  getClassAnalytics,
  getCourseAnalytics,
  getDashboardAnalytics,
  getGradesAnalytics,
  getReportsSummaryAnalytics,
  getTopStudentsAnalytics,
  getTrendAnalytics,
  getWeakStudentsAnalytics,
} from '../services/analytics.service.js';
import { ensureObjectId, ensurePositiveInteger, toTrimmedString } from '../middleware/validation.middleware.js';
import { sendSuccess } from '../utils/api.js';
import envConfiguration from '../config/env.js';
import { buildTeacherCachePrefix, readListCache, writeListCache } from '../utils/cache.js';

const getFilters = (req: Request) => {
  const term = toTrimmedString(req.query.term)?.toUpperCase();
  const year = toTrimmedString(req.query.year);
  const className = toTrimmedString(req.query.className);
  const courseId = ensureObjectId(req.query.courseId);

  return {
    teacherId: req.user!.id,
    ...(term ? { term } : {}),
    ...(year ? { year } : {}),
    ...(className ? { className } : {}),
    ...(courseId ? { courseId } : {}),
  };
};

export const getAnalyticsDashboard = async (req: Request, res: Response) => {
  const page = ensurePositiveInteger(req.query.page, 1);
  const limit = ensurePositiveInteger(req.query.limit, 10);
  const filters = getFilters(req);
  const cacheKey = `${buildTeacherCachePrefix(req.user!.id, 'analytics-dashboard')}:${JSON.stringify({
    ...filters,
    page,
    limit,
  })}`;
  const cached = await readListCache<unknown>(cacheKey);
  if (cached) {
    return sendSuccess(res, 200, cached);
  }

  const data = await getDashboardAnalytics(filters, { page, limit });
  await writeListCache(cacheKey, data, envConfiguration.cacheTtlMs);
  return sendSuccess(res, 200, data);
};

export const getTopStudents = async (req: Request, res: Response) => {
  const page = ensurePositiveInteger(req.query.page, 1);
  const limit = ensurePositiveInteger(req.query.limit, 10);
  const data = await getTopStudentsAnalytics(getFilters(req), page, limit);
  return sendSuccess(res, 200, data);
};

export const getWeakStudents = async (req: Request, res: Response) => {
  const page = ensurePositiveInteger(req.query.page, 1);
  const limit = ensurePositiveInteger(req.query.limit, 10);
  const data = await getWeakStudentsAnalytics(getFilters(req), page, limit);
  return sendSuccess(res, 200, data);
};

export const getClassesAnalytics = async (req: Request, res: Response) =>
  sendSuccess(res, 200, await getClassAnalytics(getFilters(req)));

export const getCoursesAnalytics = async (req: Request, res: Response) =>
  sendSuccess(res, 200, await getCourseAnalytics(getFilters(req)));

export const getTrendInsights = async (req: Request, res: Response) =>
  sendSuccess(res, 200, await getTrendAnalytics(getFilters(req)));

export const getGradesInsights = async (req: Request, res: Response) =>
  sendSuccess(res, 200, await getGradesAnalytics(getFilters(req)));

export const getReportsSummary = async (req: Request, res: Response) =>
  sendSuccess(res, 200, await getReportsSummaryAnalytics(getFilters(req)));
