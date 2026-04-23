import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Quiz, Course, Mark, ActivityLog } from "@/lib/db/models";
import { quizSchema } from "@/lib/validations";

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

    const quiz = await Quiz.findOne({
      _id: id,
      teacherId: session.user.id,
    })
      .populate("courseId", "name level students")
      .lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get marks for this quiz
    const marks = await Mark.find({ quizId: id })
      .populate("studentId", "firstName lastName")
      .lean();

    return NextResponse.json({
      success: true,
      data: { ...quiz, marks },
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
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

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, teacherId: session.user.id },
      {
        ...validationResult.data,
        academicYear: course.academicYear,
        term: course.term,
        dueDate: validationResult.data.dueDate
          ? new Date(validationResult.data.dueDate)
          : undefined,
      },
      { new: true }
    );

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "UPDATE_QUIZ",
      details: {
        quizId: quiz._id,
        quizTitle: quiz.title,
      },
    });

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
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

    const quiz = await Quiz.findOneAndDelete({
      _id: id,
      teacherId: session.user.id,
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Delete associated marks
    await Mark.deleteMany({ quizId: id });

    await ActivityLog.create({
      userId: session.user.id,
      userType: "teacher",
      action: "DELETE_QUIZ",
      details: {
        quizId: quiz._id,
        quizTitle: quiz.title,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
