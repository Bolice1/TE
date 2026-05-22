import Reports from '../models/reports.model.js';
import Student from '../models/student.model.js';
import { buildAnalyticsDataset } from './analytics.service.js';
import {
  buildGradeDistribution,
  gradeFromPercentage,
  performanceBandFromPercentage,
} from '../utils/analytics.js';
import { renderPdfBuffer } from '../utils/pdf.js';

type ReportType = 'term' | 'annual';

const buildSubjectAnalytics = (
  rows: Array<{
    courseName: string;
    score: number;
    assignmentMaxScore: number;
    competencyFocus: string[];
    term: string;
  }>,
) => {
  const byCourse = new Map<
    string,
    {
      score: number;
      maxScore: number;
      competencies: Set<string>;
      terms: Map<string, { score: number; maxScore: number }>;
    }
  >();

  for (const row of rows) {
    const entry = byCourse.get(row.courseName) ?? {
      score: 0,
      maxScore: 0,
      competencies: new Set<string>(),
      terms: new Map<string, { score: number; maxScore: number }>(),
    };
    entry.score += row.score;
    entry.maxScore += row.assignmentMaxScore;
    row.competencyFocus.forEach((item) => entry.competencies.add(item));
    const termEntry = entry.terms.get(row.term) ?? { score: 0, maxScore: 0 };
    termEntry.score += row.score;
    termEntry.maxScore += row.assignmentMaxScore;
    entry.terms.set(row.term, termEntry);
    byCourse.set(row.courseName, entry);
  }

  return Array.from(byCourse.entries()).map(([courseName, entry]) => {
    const averagePercentage = entry.maxScore > 0 ? (entry.score / entry.maxScore) * 100 : 0;
    return {
      courseName,
      score: Number(entry.score.toFixed(2)),
      maxScore: Number(entry.maxScore.toFixed(2)),
      averagePercentage: Number(averagePercentage.toFixed(2)),
      grade: gradeFromPercentage(averagePercentage),
      performanceBand: performanceBandFromPercentage(averagePercentage),
      competencies: Array.from(entry.competencies),
      termBreakdown: Array.from(entry.terms.entries()).map(([term, value]) => ({
        term,
        averagePercentage: Number(((value.score / value.maxScore) * 100).toFixed(2)),
      })),
    };
  });
};

const buildReportHtml = (params: {
  reportTitle: string;
  schoolName: string;
  teacherName: string;
  studentName: string;
  studentCode: string;
  parentName: string;
  className: string;
  year: string;
  termLabel: string;
  average: number;
  totalScore: number;
  totalMaxScore: number;
  grade: string;
  performanceBand: string;
  rank?: number;
  percentile?: number;
  teacherComment?: string;
  headTeacherComment?: string;
  strengths: string[];
  weaknesses: string[];
  subjectAnalytics: Array<{
    courseName: string;
    averagePercentage: number;
    grade: string;
    performanceBand: string;
  }>;
}) => {
  const subjectRows = params.subjectAnalytics
    .map(
      (item) => `
      <tr>
        <td>${item.courseName}</td>
        <td>${item.averagePercentage.toFixed(2)}%</td>
        <td>${item.grade}</td>
        <td>${item.performanceBand}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${params.reportTitle}</title>
      <style>
        :root {
          --primary: #2563EB;
          --background: #F8FAFC;
          --surface: #FFFFFF;
          --text: #0F172A;
          --muted: #64748B;
          --success: #16A34A;
          --warning: #F59E0B;
          --danger: #DC2626;
          --border: #E2E8F0;
        }
        body { font-family: Arial, sans-serif; background: var(--background); color: var(--text); margin: 0; padding: 24px; }
        .sheet { max-width: 1100px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
        .hero { background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; padding: 24px; }
        .content { padding: 24px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
        .card { border: 1px solid var(--border); border-radius: 16px; padding: 12px; }
        .label { font-size: 12px; color: var(--muted); text-transform: uppercase; }
        .value { font-size: 17px; font-weight: bold; margin-top: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border-top: 1px solid var(--border); padding: 12px; text-align: left; }
        th { background: #EFF6FF; }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="hero">
          <h1>${params.schoolName}</h1>
          <p>${params.reportTitle}</p>
        </div>
        <div class="content">
          <div class="grid">
            <div class="card"><div class="label">Student</div><div class="value">${params.studentName}</div></div>
            <div class="card"><div class="label">Student Code</div><div class="value">${params.studentCode}</div></div>
            <div class="card"><div class="label">Parent/Guardian</div><div class="value">${params.parentName}</div></div>
            <div class="card"><div class="label">Class</div><div class="value">${params.className}</div></div>
            <div class="card"><div class="label">Academic Scope</div><div class="value">${params.termLabel}</div></div>
            <div class="card"><div class="label">Average</div><div class="value">${params.average.toFixed(2)}%</div></div>
            <div class="card"><div class="label">Grade</div><div class="value">${params.grade}</div></div>
            <div class="card"><div class="label">Performance Band</div><div class="value">${params.performanceBand}</div></div>
            <div class="card"><div class="label">Rank</div><div class="value">${params.rank ?? '-'}</div></div>
            <div class="card"><div class="label">Percentile</div><div class="value">${params.percentile ?? '-'}${typeof params.percentile === 'number' ? '%' : ''}</div></div>
            <div class="card"><div class="label">Teacher</div><div class="value">${params.teacherName}</div></div>
            <div class="card"><div class="label">Year</div><div class="value">${params.year}</div></div>
          </div>
          <p><strong>Total Score:</strong> ${params.totalScore.toFixed(2)} / ${params.totalMaxScore.toFixed(2)}</p>
          <p><strong>Strengths:</strong> ${params.strengths.join(', ') || '-'}</p>
          <p><strong>Weaknesses:</strong> ${params.weaknesses.join(', ') || '-'}</p>
          <p><strong>Teacher Comment:</strong> ${params.teacherComment ?? '-'}</p>
          <p><strong>Head Teacher Comment:</strong> ${params.headTeacherComment ?? '-'}</p>
          <table>
            <thead>
              <tr><th>Subject</th><th>Average</th><th>Grade</th><th>Band</th></tr>
            </thead>
            <tbody>${subjectRows}</tbody>
          </table>
        </div>
      </div>
    </body>
  </html>`;
};

const buildReportPdf = async (params: Parameters<typeof buildReportHtml>[0]) =>
  renderPdfBuffer((doc) => {
    doc.fontSize(18).text(params.schoolName);
    doc.moveDown(0.5);
    doc.fontSize(14).text(params.reportTitle);
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Student: ${params.studentName}`);
    doc.text(`Student Code: ${params.studentCode}`);
    doc.text(`Parent/Guardian: ${params.parentName}`);
    doc.text(`Class: ${params.className}`);
    doc.text(`Scope: ${params.termLabel}`);
    doc.text(`Average: ${params.average.toFixed(2)}%`);
    doc.text(`Grade: ${params.grade}`);
    doc.text(`Performance Band: ${params.performanceBand}`);
    doc.text(`Rank: ${params.rank ?? '-'}`);
    doc.text(`Percentile: ${typeof params.percentile === 'number' ? `${params.percentile}%` : '-'}`);
    doc.text(`Teacher: ${params.teacherName}`);
    doc.moveDown();
    doc.text(`Strengths: ${params.strengths.join(', ') || '-'}`);
    doc.text(`Weaknesses: ${params.weaknesses.join(', ') || '-'}`);
    doc.text(`Teacher Comment: ${params.teacherComment ?? '-'}`);
    doc.text(`Head Teacher Comment: ${params.headTeacherComment ?? '-'}`);
    doc.moveDown();
    doc.fontSize(12).text('Subject Analytics');
    doc.moveDown(0.5);
    params.subjectAnalytics.forEach((subject) => {
      doc.fontSize(10).text(
        `${subject.courseName}: ${subject.averagePercentage.toFixed(2)}% | ${subject.grade} | ${subject.performanceBand}`,
      );
    });
  });

export const generateStudentReport = async (params: {
  teacherId: string;
  teacherName: string;
  schoolName: string;
  studentId: string;
  year: string;
  term?: string;
  reportType: ReportType;
  teacherComment?: string;
  headTeacherComment?: string;
  strengths?: string[];
  weaknesses?: string[];
}) => {
  const student = await Student.findOne({
    _id: params.studentId,
    registeredBy: params.teacherId,
    isDeleted: false,
  });

  if (!student) {
    throw new Error('Student not found.');
  }

  const dataset = await buildAnalyticsDataset({
    teacherId: params.teacherId,
    year: params.year,
    ...(params.reportType === 'term' && params.term ? { term: params.term } : {}),
    className: student.className,
  });

  const studentRanking = dataset.students.find((item) => item.studentId === params.studentId);
  if (!studentRanking) {
    throw new Error('No marks found for the requested report scope.');
  }

  const studentRows = dataset.rows.filter((row) => String(row.studentId) === params.studentId);
  const subjectAnalytics = buildSubjectAnalytics(studentRows);
  const trend = studentRanking.trends.map((item) => ({ label: item.label, value: item.percentage }));
  const gradeDistribution = buildGradeDistribution(subjectAnalytics.map((item) => item.averagePercentage)).map((item) => ({
    label: item.grade,
    value: item.count,
  }));

  const reportPayload = {
    reportTitle:
      params.reportType === 'annual'
        ? `Annual Academic Report Card - ${params.year}`
        : `Term Report Card - ${params.term} ${params.year}`,
    schoolName: params.schoolName,
    teacherName: params.teacherName,
    studentName: student.name,
    studentCode: student.studentCode,
    parentName: student.parentName,
    className: student.className,
    year: params.year,
    termLabel: params.reportType === 'annual' ? `Annual Summary ${params.year}` : `${params.term} ${params.year}`,
    average: studentRanking.averagePercentage,
    totalScore: studentRanking.totalScore,
    totalMaxScore: studentRanking.totalMaxScore,
    grade: studentRanking.grade,
    performanceBand: studentRanking.performanceBand,
    rank: studentRanking.rank,
    percentile: studentRanking.percentile,
    ...(params.teacherComment ? { teacherComment: params.teacherComment } : {}),
    ...(params.headTeacherComment ? { headTeacherComment: params.headTeacherComment } : {}),
    strengths: params.strengths?.length ? params.strengths : studentRanking.strengths,
    weaknesses: params.weaknesses?.length ? params.weaknesses : studentRanking.weaknesses,
    subjectAnalytics: subjectAnalytics.map((item) => ({
      courseName: item.courseName,
      averagePercentage: item.averagePercentage,
      grade: item.grade,
      performanceBand: item.performanceBand,
    })),
  };

  const html = buildReportHtml(reportPayload);
  const pdfBuffer = await buildReportPdf(reportPayload);
  const competencySummary = subjectAnalytics.map((item) => ({
    courseName: item.courseName,
    averagePercentage: item.averagePercentage,
    performanceBand: item.performanceBand,
  }));

  const report = await Reports.findOneAndUpdate(
    {
      student: params.studentId,
      teacher: params.teacherId,
      year: params.year,
      reportType: params.reportType,
      ...(params.reportType === 'term' ? { term: params.term } : {}),
    },
    {
      $set: {
        student: params.studentId,
        teacher: params.teacherId,
        year: params.year,
        ...(params.reportType === 'term' && params.term ? { term: params.term } : {}),
        reportType: params.reportType,
        average: studentRanking.averagePercentage,
        totalScore: studentRanking.totalScore,
        totalMaxScore: studentRanking.totalMaxScore,
        grade: studentRanking.grade,
        html,
        ...(params.teacherComment ? { teacherComment: params.teacherComment } : {}),
        ...(params.headTeacherComment ? { headTeacherComment: params.headTeacherComment } : {}),
        rank: studentRanking.rank,
        percentile: studentRanking.percentile,
        performanceBand: studentRanking.performanceBand,
        strengths: reportPayload.strengths,
        weaknesses: reportPayload.weaknesses,
        competencySummary,
        subjectAnalytics: subjectAnalytics.map((item) => ({
          courseName: item.courseName,
          score: item.score,
          maxScore: item.maxScore,
          averagePercentage: item.averagePercentage,
          grade: item.grade,
        })),
        chartMetadata: {
          trend,
          gradeDistribution,
        },
        isDeleted: false,
        deletedAt: null,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  return {
    report,
    pdfBuffer,
    reportPayload,
  };
};
