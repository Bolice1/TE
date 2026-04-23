import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Student, ActivityLog } from "@/lib/db/models";
import { studentSchema } from "@/lib/validations";
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
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive") !== "false";

    await connectToDatabase();

    const query: Record<string, unknown> = {
      teacherId: session.user.id,
      isActive,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
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
    const validationResult = studentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.create({
      ...validationResult.data,
      teacherId: session.user.id,
      dateOfBirth: validationResult.data.dateOfBirth
        ? new Date(validationResult.data.dateOfBirth)
        : undefined,
    });

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "CREATE_STUDENT",
      details: {
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
      },
    });

    return NextResponse.json(
      { success: true, data: student },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
