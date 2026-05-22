import mongoose from 'mongoose';
import { fetchAnalyticsRows, type AnalyticsFilter } from '../repositories/analytics.repository.js';
import {
  buildGradeDistribution,
  computeGpaLikeScore,
  computePercentage,
  gradeFromPercentage,
  performanceBandFromPercentage,
  rankDeterministically,
} from '../utils/analytics.js';

type AnalyticsRow = {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentCode: string;
  parentName?: string;
  className: string;
  studentYear: string;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  courseCode?: string;
  courseOutcome: string;
  assignmentId: mongoose.Types.ObjectId;
  assignmentTitle: string;
  assignmentType: 'assignment' | 'quiz';
  assignmentDate: Date;
  assignmentDueDate?: Date;
  assignmentMaxScore: number;
  assignmentWeight: number;
  competencyFocus: string[];
  term: string;
  year: string;
  score: number;
  comment?: string;
  createdAt: Date;
};

const paginate = <T>(items: T[], page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return {
    total: items.length,
    page,
    limit,
    items: items.slice(offset, offset + limit),
  };
};

const aggregateStudents = (rows: AnalyticsRow[]) => {
  const byStudent = new Map<
    string,
    {
      studentId: string;
      studentName: string;
      studentCode: string;
      parentName?: string;
      className: string;
      year: string;
      totalScore: number;
      totalMaxScore: number;
      courses: Set<string>;
      percentages: number[];
      courseSummaries: Map<string, { courseName: string; score: number; maxScore: number }>;
      trendPoints: Array<{ label: string; percentage: number }>;
    }
  >();

  for (const row of rows) {
    const key = String(row.studentId);
    if (!byStudent.has(key)) {
      byStudent.set(key, {
        studentId: key,
        studentName: row.studentName,
        studentCode: row.studentCode,
        ...(row.parentName ? { parentName: row.parentName } : {}),
        className: row.className,
        year: row.studentYear,
        totalScore: 0,
        totalMaxScore: 0,
        courses: new Set(),
        percentages: [],
        courseSummaries: new Map(),
        trendPoints: [],
      });
    }

    const entry = byStudent.get(key)!;
    const weightedScore = row.score * row.assignmentWeight;
    const weightedMax = row.assignmentMaxScore * row.assignmentWeight;
    const percentage = computePercentage(row.score, row.assignmentMaxScore);

    entry.totalScore += weightedScore;
    entry.totalMaxScore += weightedMax;
    entry.percentages.push(percentage);
    entry.courses.add(String(row.courseId));
    entry.trendPoints.push({
      label: `${row.assignmentTitle} (${new Date(row.assignmentDate).toISOString().slice(0, 10)})`,
      percentage,
    });

    const courseKey = String(row.courseId);
    const existingCourse = entry.courseSummaries.get(courseKey) ?? {
      courseName: row.courseName,
      score: 0,
      maxScore: 0,
    };
    existingCourse.score += weightedScore;
    existingCourse.maxScore += weightedMax;
    entry.courseSummaries.set(courseKey, existingCourse);
  }

  return Array.from(byStudent.values()).map((entry) => {
    const averagePercentage =
      entry.totalMaxScore > 0 ? Number(((entry.totalScore / entry.totalMaxScore) * 100).toFixed(2)) : 0;
    const gpaLikeScore = computeGpaLikeScore(averagePercentage);
    const subjectResults = Array.from(entry.courseSummaries.values()).map((course) => ({
      courseName: course.courseName,
      averagePercentage: Number(computePercentage(course.score, course.maxScore).toFixed(2)),
    }));
    subjectResults.sort((a, b) => a.averagePercentage - b.averagePercentage);

    return {
      stableId: entry.studentId,
      label: entry.studentName,
      studentId: entry.studentId,
      studentName: entry.studentName,
      studentCode: entry.studentCode,
      parentName: entry.parentName,
      className: entry.className,
      year: entry.year,
      totalScore: Number(entry.totalScore.toFixed(2)),
      totalMaxScore: Number(entry.totalMaxScore.toFixed(2)),
      averagePercentage,
      grade: gradeFromPercentage(averagePercentage),
      performanceBand: performanceBandFromPercentage(averagePercentage),
      gpaLikeScore,
      courseCount: entry.courses.size,
      strengths: subjectResults.slice(-3).reverse().map((item) => item.courseName),
      weaknesses: subjectResults.slice(0, 3).map((item) => item.courseName),
      trends: entry.trendPoints,
      improvement: entry.trendPoints.length >= 2
        ? Number((entry.trendPoints.at(-1)!.percentage - entry.trendPoints[0]!.percentage).toFixed(2))
        : 0,
    };
  });
};

const aggregateCourses = (rows: AnalyticsRow[]) => {
  const byCourse = new Map<
    string,
    {
      courseId: string;
      courseName: string;
      courseCode?: string;
      outcome: string;
      totalScore: number;
      totalMaxScore: number;
      studentIds: Set<string>;
      assignmentPercentages: Array<{ assignmentId: string; title: string; percentage: number }>;
    }
  >();

  for (const row of rows) {
    const key = String(row.courseId);
    if (!byCourse.has(key)) {
      byCourse.set(key, {
        courseId: key,
        courseName: row.courseName,
        ...(row.courseCode ? { courseCode: row.courseCode } : {}),
        outcome: row.courseOutcome,
        totalScore: 0,
        totalMaxScore: 0,
        studentIds: new Set(),
        assignmentPercentages: [],
      });
    }

    const entry = byCourse.get(key)!;
    entry.totalScore += row.score * row.assignmentWeight;
    entry.totalMaxScore += row.assignmentMaxScore * row.assignmentWeight;
    entry.studentIds.add(String(row.studentId));
    entry.assignmentPercentages.push({
      assignmentId: String(row.assignmentId),
      title: row.assignmentTitle,
      percentage: computePercentage(row.score, row.assignmentMaxScore),
    });
  }

  return Array.from(byCourse.values()).map((entry) => {
    const averagePercentage =
      entry.totalMaxScore > 0 ? Number(((entry.totalScore / entry.totalMaxScore) * 100).toFixed(2)) : 0;
    const passRate =
      entry.assignmentPercentages.length > 0
        ? Number(
            (
              (entry.assignmentPercentages.filter((item) => item.percentage >= 50).length /
                entry.assignmentPercentages.length) *
              100
            ).toFixed(2),
          )
        : 0;

    const assignmentGroups = new Map<string, { title: string; percentages: number[] }>();
    for (const assignment of entry.assignmentPercentages) {
      const group = assignmentGroups.get(assignment.assignmentId) ?? {
        title: assignment.title,
        percentages: [],
      };
      group.percentages.push(assignment.percentage);
      assignmentGroups.set(assignment.assignmentId, group);
    }

    const difficultAssignments = Array.from(assignmentGroups.entries())
      .map(([assignmentId, group]) => ({
        assignmentId,
        title: group.title,
        averagePercentage: Number(
          (group.percentages.reduce((sum, value) => sum + value, 0) / group.percentages.length).toFixed(2),
        ),
      }))
      .sort((a, b) => a.averagePercentage - b.averagePercentage)
      .slice(0, 5);

    return {
      courseId: entry.courseId,
      courseName: entry.courseName,
      courseCode: entry.courseCode,
      outcome: entry.outcome,
      averagePercentage,
      passRate,
      studentCount: entry.studentIds.size,
      performanceBand: performanceBandFromPercentage(averagePercentage),
      difficultyIndex: Number((100 - averagePercentage).toFixed(2)),
      difficultAssignments,
    };
  });
};

const aggregateClasses = (students: ReturnType<typeof aggregateStudents>) => {
  const byClass = new Map<
    string,
    { className: string; totalScore: number; totalMaxScore: number; studentCount: number; averages: number[] }
  >();

  for (const student of students) {
    const key = student.className;
    if (!byClass.has(key)) {
      byClass.set(key, {
        className: key,
        totalScore: 0,
        totalMaxScore: 0,
        studentCount: 0,
        averages: [],
      });
    }

    const entry = byClass.get(key)!;
    entry.totalScore += student.totalScore;
    entry.totalMaxScore += student.totalMaxScore;
    entry.studentCount += 1;
    entry.averages.push(student.averagePercentage);
  }

  return Array.from(byClass.values()).map((entry) => {
    const averagePercentage =
      entry.totalMaxScore > 0 ? Number(((entry.totalScore / entry.totalMaxScore) * 100).toFixed(2)) : 0;

    return {
      className: entry.className,
      averagePercentage,
      studentCount: entry.studentCount,
      passRate: Number(((entry.averages.filter((value) => value >= 50).length / entry.averages.length) * 100).toFixed(2)),
      performanceBand: performanceBandFromPercentage(averagePercentage),
    };
  });
};

const aggregateTrends = (rows: AnalyticsRow[]) => {
  const grouped = new Map<string, { label: string; score: number; maxScore: number }>();

  for (const row of rows) {
    const date = new Date(row.assignmentDate).toISOString().slice(0, 10);
    const key = `${row.term}-${date}`;
    const entry = grouped.get(key) ?? {
      label: key,
      score: 0,
      maxScore: 0,
    };
    entry.score += row.score * row.assignmentWeight;
    entry.maxScore += row.assignmentMaxScore * row.assignmentWeight;
    grouped.set(key, entry);
  }

  return Array.from(grouped.values())
    .map((entry) => ({
      label: entry.label,
      averagePercentage: Number(computePercentage(entry.score, entry.maxScore).toFixed(2)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const buildAnalyticsDataset = async (filters: AnalyticsFilter) => {
  const rows = (await fetchAnalyticsRows(filters)) as AnalyticsRow[];
  const students = rankDeterministically(aggregateStudents(rows));
  const courses = aggregateCourses(rows);
  const classes = aggregateClasses(students);
  const trends = aggregateTrends(rows);
  const gradeDistribution = buildGradeDistribution(students.map((student) => student.averagePercentage));
  const upcomingAssignments = rows
    .filter((row) => row.assignmentDueDate && new Date(row.assignmentDueDate) >= new Date())
    .map((row) => ({
      assignmentId: String(row.assignmentId),
      title: row.assignmentTitle,
      courseName: row.courseName,
      className: row.className,
      dueDate: row.assignmentDueDate,
      type: row.assignmentType,
    }))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .filter((item, index, array) => index === array.findIndex((candidate) => candidate.assignmentId === item.assignmentId))
    .slice(0, 10);

  const recommendations = {
    studentsNeedingIntervention: students
      .filter((student) => student.averagePercentage < 50)
      .slice(0, 10)
      .map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        className: student.className,
        averagePercentage: student.averagePercentage,
        weaknesses: student.weaknesses,
      })),
    weakClasses: classes.filter((item) => item.averagePercentage < 55).slice(0, 5),
    difficultCourses: courses.filter((item) => item.averagePercentage < 55).slice(0, 5),
    decliningPerformance: students
      .filter((student) => student.improvement < -5)
      .slice(0, 10)
      .map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        improvement: student.improvement,
      })),
  };

  return {
    rows,
    students,
    courses,
    classes,
    trends,
    gradeDistribution,
    upcomingAssignments,
    recommendations,
  };
};

export const getDashboardAnalytics = async (
  filters: AnalyticsFilter,
  pagination: { page: number; limit: number },
) => {
  const dataset = await buildAnalyticsDataset(filters);
  const topStudents = dataset.students.slice(0, 5);
  const weakestStudents = [...dataset.students].reverse().slice(0, 5).reverse();
  const recentActivity = dataset.rows
    .slice(-10)
    .reverse()
    .map((row) => ({
      type: 'mark_recorded',
      title: `${row.studentName} - ${row.assignmentTitle}`,
      subtitle: `${row.courseName} (${row.term})`,
      score: row.score,
      maxScore: row.assignmentMaxScore,
      createdAt: row.createdAt,
    }));

  const summaryCards = [
    { key: 'students', label: 'Students', value: dataset.students.length },
    { key: 'courses', label: 'Courses', value: dataset.courses.length },
    { key: 'classes', label: 'Classes', value: dataset.classes.length },
    {
      key: 'average',
      label: 'Overall Average',
      value:
        dataset.students.length > 0
          ? Number(
              (
                dataset.students.reduce((sum, student) => sum + student.averagePercentage, 0) /
                dataset.students.length
              ).toFixed(2),
            )
          : 0,
    },
  ];

  return {
    summaryCards,
    chartDatasets: {
      gradeDistribution: dataset.gradeDistribution,
      trends: dataset.trends,
      classAverages: dataset.classes.map((item) => ({
        label: item.className,
        value: item.averagePercentage,
      })),
      coursePerformance: dataset.courses.map((item) => ({
        label: item.courseName,
        value: item.averagePercentage,
      })),
    },
    rankings: {
      topStudents,
      weakestStudents,
      classes: rankDeterministically(
        dataset.classes.map((item) => ({
          stableId: item.className,
          label: item.className,
          totalScore: item.studentCount,
          ...item,
        })),
      ),
    },
    recentActivity,
    upcomingAssignments: dataset.upcomingAssignments,
    recommendations: dataset.recommendations,
    pagination,
  };
};

export const getTopStudentsAnalytics = async (filters: AnalyticsFilter, page: number, limit: number) => {
  const dataset = await buildAnalyticsDataset(filters);
  return paginate(dataset.students, page, limit);
};

export const getWeakStudentsAnalytics = async (filters: AnalyticsFilter, page: number, limit: number) => {
  const dataset = await buildAnalyticsDataset(filters);
  return paginate([...dataset.students].reverse(), page, limit);
};

export const getClassAnalytics = async (filters: AnalyticsFilter) => {
  const dataset = await buildAnalyticsDataset(filters);
  return dataset.classes;
};

export const getCourseAnalytics = async (filters: AnalyticsFilter) => {
  const dataset = await buildAnalyticsDataset(filters);
  return dataset.courses;
};

export const getTrendAnalytics = async (filters: AnalyticsFilter) => {
  const dataset = await buildAnalyticsDataset(filters);
  return {
    trends: dataset.trends,
    recommendations: dataset.recommendations.decliningPerformance,
  };
};

export const getGradesAnalytics = async (filters: AnalyticsFilter) => {
  const dataset = await buildAnalyticsDataset(filters);
  return {
    distribution: dataset.gradeDistribution,
    performanceBands: dataset.students.reduce<Record<string, number>>((acc, student) => {
      acc[student.performanceBand] = (acc[student.performanceBand] ?? 0) + 1;
      return acc;
    }, {}),
    passFail: {
      pass: dataset.students.filter((student) => student.averagePercentage >= 50).length,
      fail: dataset.students.filter((student) => student.averagePercentage < 50).length,
    },
  };
};

export const getReportsSummaryAnalytics = async (filters: AnalyticsFilter) => {
  const dataset = await buildAnalyticsDataset(filters);
  return {
    totalStudents: dataset.students.length,
    totalCourses: dataset.courses.length,
    averageScore:
      dataset.students.length > 0
        ? Number(
            (
              dataset.students.reduce((sum, student) => sum + student.averagePercentage, 0) /
              dataset.students.length
            ).toFixed(2),
          )
        : 0,
    topPerformers: dataset.students.slice(0, 5),
    interventions: dataset.recommendations.studentsNeedingIntervention,
  };
};
