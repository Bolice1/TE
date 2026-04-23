import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Mark, Quiz, ActivityLog } from "@/lib/db/models";
import { calculateGrade } from "@/lib/utils/grading";

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
    const { marksObtained, remarks } = await request.json();

    if (typeof marksObtained !== "number" || marksObtained < 0) {
      return NextResponse.json(
        { error: "Invalid marks value" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingMark = await Mark.findOne({
      _id: id,
      teacherId: session.user.id,
    }).populate("quizId");

    if (!existingMark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 });
    }

    const quiz = existingMark.quizId as unknown as { totalMarks: number };
    const gradeInfo = calculateGrade(marksObtained, quiz.totalMarks);

    const mark = await Mark.findByIdAndUpdate(
      id,
      {
        marksObtained,
        percentage: gradeInfo.percentage,
        grade: gradeInfo.grade,
        gradePoint: gradeInfo.gradePoint,
        remarks: remarks || "",
      },
      { new: true }
    )
      .populate("studentId", "firstName lastName")
      .populate("quizId", "title type totalMarks");

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "UPDATE_MARK",
      details: {
        markId: mark?._id,
        studentId: existingMark.studentId,
      },
    });

    return NextResponse.json({ success: true, data: mark });
  } catch (error) {
    console.error("Error updating mark:", error);
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

    const mark = await Mark.findOneAndDelete({
      _id: id,
      teacherId: session.user.id,
    });

    if (!mark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "DELETE_MARK",
      details: {
        markId: mark._id,
        studentId: mark.studentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mark deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
