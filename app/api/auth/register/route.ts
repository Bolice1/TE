import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { Teacher, ActivityLog } from "@/lib/db/models";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/utils/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = rateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, phone } = validationResult.data;

    await connectToDatabase();

    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create teacher
    const teacher = await Teacher.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });

    // Log registration
    await ActivityLog.create({
      userId: teacher._id,
      userType: "teacher",
      action: "REGISTER",
      details: { email: teacher.email },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: teacher._id,
          email: teacher.email,
          name: `${teacher.firstName} ${teacher.lastName}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
