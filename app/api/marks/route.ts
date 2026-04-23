import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Mark, Quiz, ActivityLog } from "@/lib/db/models";
import { bulkMarkSchema } from "@/lib/validations";
import { calculateGrade } from "@/lib/utils/grading";
import { rateLimit } from "@/lib/utils/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const quizId = searchParams.get("quizId") || "";
    const studentId = searchParams.get("studentId") || "";
    const courseId = searchParams.get("courseId") || "";

    await connectToDatabase();

    const query: Record<string, unknown> = {
      teacherId: session.user.id,
    };

    if (quizId) query.quizId = quizId;
    if (studentId) query.studentId = studentId;
    if (courseId) query.courseId = courseId;

    const [marks, total] = await Promise.all([
      Mark.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("studentId", "firstName lastName")
        .populate("quizId", "title type totalMarks")
        .populate("courseId", "name level")
        .lean(),
      Mark.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: marks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = bulkMarkSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { quizId, marks } = validationResult.data;

    await connectToDatabase();

    // Get quiz details
    const quiz = await Quiz.findOne({
      _id: quizId,
      teacherId: session.user.id,
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found or unauthorized" },
        { status: 404 }
      );
    }

    // Process marks
    const marksToInsert = marks.map((mark) => {
      const gradeInfo = calculateGrade(mark.marksObtained, quiz.totalMarks);
      return {
        teacherId: session.user.id,
        studentId: mark.studentId,
        quizId: quiz._id,
        courseId: quiz.courseId,
        marksObtained: mark.marksObtained,
        percentage: gradeInfo.percentage,
        grade: gradeInfo.grade,
        gradePoint: gradeInfo.gradePoint,
        remarks: mark.remarks || "",
      };
    });

    // Use bulkWrite to upsert marks
    const operations = marksToInsert.map((mark) => ({
      updateOne: {
        filter: {
          teacherId: mark.teacherId,
          studentId: mark.studentId,
          quizId: mark.quizId,
        },
        update: { $set: mark },
        upsert: true,
      },
    }));

    await Mark.bulkWrite(operations);

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "RECORD_MARKS",
      details: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        marksCount: marks.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${marks.length} marks recorded successfully`,
    });
  } catch (error) {
    console.error("Error recording marks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
