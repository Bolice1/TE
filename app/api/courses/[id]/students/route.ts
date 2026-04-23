import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Course, ActivityLog } from "@/lib/db/models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "studentIds must be an array" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    ).populate("students", "firstName lastName");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "ENROLL_STUDENTS",
      details: {
        courseId: course._id,
        courseName: course.name,
        studentCount: studentIds.length,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error enrolling students:", error);
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
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      { $pull: { students: studentId } },
      { new: true }
    ).populate("students", "firstName lastName");

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "REMOVE_STUDENT_FROM_COURSE",
      details: {
        courseId: course._id,
        courseName: course.name,
        studentId,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error removing student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
