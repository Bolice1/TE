import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Course, ActivityLog } from "@/lib/db/models";
import { courseSchema } from "@/lib/validations";

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

    const course = await Course.findOne({
      _id: id,
      teacherId: session.user.id,
    })
      .populate("students", "firstName lastName gender isOrphan")
      .lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
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
    const validationResult = courseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      validationResult.data,
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "UPDATE_COURSE",
      details: {
        courseId: course._id,
        courseName: course.name,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error updating course:", error);
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

    const course = await Course.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "DELETE_COURSE",
      details: {
        courseId: course._id,
        courseName: course.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course archived successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
