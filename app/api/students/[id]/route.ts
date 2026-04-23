import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Student, ActivityLog } from "@/lib/db/models";
import { studentSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findOne({
      _id: id,
      teacherId: session.user.id,
    }).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = studentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      {
        ...validationResult.data,
        dateOfBirth: validationResult.data.dateOfBirth
          ? new Date(validationResult.data.dateOfBirth)
          : undefined,
      },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "UPDATE_STUDENT",
      details: {
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
      },
    });

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "DELETE_STUDENT",
      details: {
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
