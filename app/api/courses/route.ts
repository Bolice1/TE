import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Course, ActivityLog } from "@/lib/db/models";
import { courseSchema } from "@/lib/validations";
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
    const academicYear = searchParams.get("academicYear") || "";
    const term = searchParams.get("term") || "";
    const level = searchParams.get("level") || "";
    const isActive = searchParams.get("isActive") !== "false";

    await connectToDatabase();

    const query: Record<string, unknown> = {
      teacherId: session.user.id,
      isActive,
    };

    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (level) query.level = level;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("students", "firstName lastName")
        .lean(),
      Course.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
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
    const validationResult = courseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.create({
      ...validationResult.data,
      teacherId: session.user.id,
    });

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "CREATE_COURSE",
      details: {
        courseId: course._id,
        courseName: course.name,
      },
    });

    return NextResponse.json(
      { success: true, data: course },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
