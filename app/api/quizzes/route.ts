import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Quiz, Course, ActivityLog } from "@/lib/db/models";
import { quizSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/utils/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const courseId = searchParams.get("courseId") || "";
    const type = searchParams.get("type") || "";
    const academicYear = searchParams.get("academicYear") || "";
    const term = searchParams.get("term") || "";

    await connectToDatabase();

    const query: Record<string, unknown> = {
      teacherId: session.user.id,
    };

    if (courseId) query.courseId = courseId;
    if (type) query.type = type;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("courseId", "name level")
        .lean(),
      Quiz.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
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
    const validationResult = quizSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify course belongs to teacher
    const course = await Course.findOne({
      _id: validationResult.data.courseId,
      teacherId: session.user.id,
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      );
    }

    const quiz = await Quiz.create({
      ...validationResult.data,
      teacherId: session.user.id,
      academicYear: course.academicYear,
      term: course.term,
      dueDate: validationResult.data.dueDate
        ? new Date(validationResult.data.dueDate)
        : undefined,
    });

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "CREATE_QUIZ",
      details: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        courseId: course._id,
        courseName: course.name,
      },
    });

    return NextResponse.json(
      { success: true, data: quiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
