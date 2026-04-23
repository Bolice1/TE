import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { Student, Course, Quiz, Mark, ReportCard, ActivityLog } from "@/lib/db/models";
import { calculateGrade, getGradeInfo } from "@/lib/utils/grading";
import { uploadPdfToCloudinary } from "@/lib/utils/cloudinary";

// GET all report cards for the teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const academicYear = searchParams.get("academicYear");
    const term = searchParams.get("term");

    const query: Record<string, unknown> = { teacher: session.user.id };
    if (studentId) query.student = studentId;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const reportCards = await ReportCard.find(query)
      .populate("student", "firstName lastName studentId level")
      .sort({ generatedAt: -1 });

    return NextResponse.json(reportCards);
  } catch (error) {
    console.error("Error fetching report cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch report cards" },
      { status: 500 }
    );
  }
}

// POST - Generate report card(s)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { studentIds, academicYear, term, generateAll } = body;

    if (!academicYear || !term) {
      return NextResponse.json(
        { error: "Academic year and term are required" },
        { status: 400 }
      );
    }

    let studentsToProcess: string[] = [];

    if (generateAll) {
      const students = await Student.find({ teacher: session.user.id, isActive: true });
      studentsToProcess = students.map((s) => s._id.toString());
    } else if (studentIds && studentIds.length > 0) {
      studentsToProcess = studentIds;
    } else {
      return NextResponse.json(
        { error: "No students specified" },
        { status: 400 }
      );
    }

    const generatedReports: unknown[] = [];

    for (const studentId of studentsToProcess) {
      const student = await Student.findOne({
        _id: studentId,
        teacher: session.user.id,
      });

      if (!student) continue;

      // Get all courses for this student's level
      const courses = await Course.find({
        teacher: session.user.id,
        level: student.level,
        academicYear,
        term,
        isActive: true,
      });

      // Get all marks for this student across all quizzes in these courses
      const courseIds = courses.map((c) => c._id);
      const quizzes = await Quiz.find({
        course: { $in: courseIds },
        isActive: true,
      });

      const quizIds = quizzes.map((q) => q._id);
      const marks = await Mark.find({
        student: studentId,
        quiz: { $in: quizIds },
      }).populate({
        path: "quiz",
        populate: { path: "course", select: "name code" },
      });

      // Calculate course results
      const courseResults: {
        courseName: string;
        courseCode: string;
        totalMarks: number;
        obtainedMarks: number;
        percentage: number;
        grade: string;
        gradePoint: number;
        remark: string;
      }[] = [];

      for (const course of courses) {
        const courseQuizzes = quizzes.filter(
          (q) => q.course.toString() === course._id.toString()
        );
        const courseMarks = marks.filter(
          (m) => m.quiz?.course?._id?.toString() === course._id.toString()
        );

        let totalMarks = 0;
        let obtainedMarks = 0;

        for (const quiz of courseQuizzes) {
          totalMarks += quiz.totalMarks;
          const mark = courseMarks.find(
            (m) => m.quiz._id.toString() === quiz._id.toString()
          );
          if (mark) {
            obtainedMarks += mark.marksObtained;
          }
        }

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        const gradeInfo = getGradeInfo(percentage);

        courseResults.push({
          courseName: course.name,
          courseCode: course.code,
          totalMarks,
          obtainedMarks,
          percentage: Math.round(percentage * 100) / 100,
          grade: gradeInfo.grade,
          gradePoint: gradeInfo.gradePoint,
          remark: gradeInfo.remark,
        });
      }

      // Calculate overall results
      const totalMarksAll = courseResults.reduce((sum, c) => sum + c.totalMarks, 0);
      const obtainedMarksAll = courseResults.reduce((sum, c) => sum + c.obtainedMarks, 0);
      const overallPercentage = totalMarksAll > 0 ? (obtainedMarksAll / totalMarksAll) * 100 : 0;
      const overallGradeInfo = getGradeInfo(overallPercentage);
      const totalGradePoints = courseResults.reduce((sum, c) => sum + c.gradePoint, 0);
      const gpa = courseResults.length > 0 ? totalGradePoints / courseResults.length : 0;

      // Generate PDF content as base64
      const pdfContent = await generateReportCardPDF({
        student,
        courses: courseResults,
        academicYear,
        term,
        overallPercentage,
        overallGrade: overallGradeInfo.grade,
        gpa,
        teacherName: session.user.name || "Teacher",
      });

      // Upload to Cloudinary
      const cloudinaryResult = await uploadPdfToCloudinary(
        pdfContent,
        `report_${student.studentId}_${academicYear}_${term}`
      );

      // Save report card metadata
      const reportCard = new ReportCard({
        student: studentId,
        teacher: session.user.id,
        academicYear,
        term,
        courses: courseResults,
        totalMarks: totalMarksAll,
        obtainedMarks: obtainedMarksAll,
        percentage: Math.round(overallPercentage * 100) / 100,
        grade: overallGradeInfo.grade,
        gradePoint: overallGradeInfo.gradePoint,
        gpa: Math.round(gpa * 100) / 100,
        pdfUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        generatedAt: new Date(),
      });

      await reportCard.save();
      generatedReports.push(reportCard);
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      userRole: "teacher",
      action: "generate_report_cards",
      details: `Generated ${generatedReports.length} report card(s) for ${academicYear} ${term}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      message: `Successfully generated ${generatedReports.length} report card(s)`,
      reportCards: generatedReports,
    });
  } catch (error) {
    console.error("Error generating report cards:", error);
    return NextResponse.json(
      { error: "Failed to generate report cards" },
      { status: 500 }
    );
  }
}

// Helper function to generate PDF content
async function generateReportCardPDF(data: {
  student: {
    firstName: string;
    lastName: string;
    studentId: string;
    level: string;
    dateOfBirth?: Date;
  };
  courses: {
    courseName: string;
    courseCode: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    gradePoint: number;
    remark: string;
  }[];
  academicYear: string;
  term: string;
  overallPercentage: number;
  overallGrade: string;
  gpa: number;
  teacherName: string;
}): Promise<string> {
  // Generate HTML for PDF
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #13293d; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #006494; padding-bottom: 20px; }
    .header h1 { color: #006494; font-size: 28px; margin-bottom: 5px; }
    .header h2 { color: #247ba0; font-size: 18px; font-weight: normal; }
    .student-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #e8f1f2; padding: 15px; border-radius: 8px; }
    .info-group { }
    .info-group label { font-size: 12px; color: #666; display: block; }
    .info-group span { font-size: 14px; font-weight: bold; }
    .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .grades-table th { background: #006494; color: white; padding: 12px; text-align: left; font-size: 12px; }
    .grades-table td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 12px; }
    .grades-table tr:nth-child(even) { background: #f9f9f9; }
    .summary { background: #13293d; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .summary-grid { display: flex; justify-content: space-around; text-align: center; }
    .summary-item label { font-size: 12px; opacity: 0.8; display: block; }
    .summary-item span { font-size: 24px; font-weight: bold; color: #1b98e0; }
    .grading-scale { margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .grading-scale h3 { font-size: 14px; margin-bottom: 10px; color: #006494; }
    .grading-scale table { width: 100%; font-size: 10px; }
    .grading-scale td { padding: 5px; border: 1px solid #ddd; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
    .signature { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-line { width: 200px; border-top: 1px solid #333; padding-top: 5px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>TE - Teaching & Evaluation</h1>
    <h2>Student Report Card</h2>
  </div>
  
  <div class="student-info">
    <div class="info-group">
      <label>Student Name</label>
      <span>${data.student.firstName} ${data.student.lastName}</span>
    </div>
    <div class="info-group">
      <label>Student ID</label>
      <span>${data.student.studentId}</span>
    </div>
    <div class="info-group">
      <label>Level/Class</label>
      <span>${data.student.level}</span>
    </div>
    <div class="info-group">
      <label>Academic Year</label>
      <span>${data.academicYear}</span>
    </div>
    <div class="info-group">
      <label>Term</label>
      <span>${data.term}</span>
    </div>
  </div>
  
  <table class="grades-table">
    <thead>
      <tr>
        <th>Course</th>
        <th>Code</th>
        <th>Total Marks</th>
        <th>Obtained</th>
        <th>Percentage</th>
        <th>Grade</th>
        <th>Points</th>
        <th>Remark</th>
      </tr>
    </thead>
    <tbody>
      ${data.courses
        .map(
          (c) => `
        <tr>
          <td>${c.courseName}</td>
          <td>${c.courseCode}</td>
          <td>${c.totalMarks}</td>
          <td>${c.obtainedMarks}</td>
          <td>${c.percentage.toFixed(1)}%</td>
          <td><strong>${c.grade}</strong></td>
          <td>${c.gradePoint}</td>
          <td>${c.remark}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  
  <div class="summary">
    <div class="summary-grid">
      <div class="summary-item">
        <label>Overall Percentage</label>
        <span>${data.overallPercentage.toFixed(1)}%</span>
      </div>
      <div class="summary-item">
        <label>Overall Grade</label>
        <span>${data.overallGrade}</span>
      </div>
      <div class="summary-item">
        <label>GPA</label>
        <span>${data.gpa.toFixed(2)}</span>
      </div>
    </div>
  </div>
  
  <div class="grading-scale">
    <h3>Grading Scale</h3>
    <table>
      <tr>
        <td><strong>A (6)</strong>: 70-100% Excellent</td>
        <td><strong>B (5)</strong>: 65-69% Very Good</td>
        <td><strong>C (4)</strong>: 60-64% Good</td>
        <td><strong>D (3)</strong>: 50-59% Satisfactory</td>
      </tr>
      <tr>
        <td><strong>E (2)</strong>: 40-49% Adequate</td>
        <td><strong>S (1)</strong>: 20-39% Fair</td>
        <td><strong>F (0)</strong>: 0-19% Fail</td>
        <td></td>
      </tr>
    </table>
  </div>
  
  <div class="signature">
    <div class="signature-line">Teacher: ${data.teacherName}</div>
    <div class="signature-line">Date: ${new Date().toLocaleDateString()}</div>
  </div>
  
  <div class="footer">
    <p>This report card was generated by TE - Teaching & Evaluation System</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;

  // Convert HTML to base64 for upload
  return Buffer.from(html).toString("base64");
}
