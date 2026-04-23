import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { Teacher, Student, Course, Quiz, Mark, ReportCard, ActivityLog } from "@/lib/db/models";
import { deleteFromCloudinary } from "@/lib/utils/cloudinary";

// GET single teacher with full details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const teacher = await Teacher.findById(id).select("-password");

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get detailed statistics
    const [students, courses, quizzes, reports, activities] = await Promise.all([
      Student.find({ teacher: id }).select("firstName lastName studentId level isActive"),
      Course.find({ teacher: id }).select("name code level academicYear term isActive"),
      Quiz.find({ teacher: id }).populate("course", "name code"),
      ReportCard.find({ teacher: id }).populate("student", "firstName lastName studentId"),
      ActivityLog.find({ user: id }).sort({ createdAt: -1 }).limit(20),
    ]);

    return NextResponse.json({
      teacher,
      students,
      courses,
      quizzes,
      reports,
      activities,
      stats: {
        students: students.length,
        courses: courses.length,
        quizzes: quizzes.length,
        reports: reports.length,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    );
  }
}

// PATCH - Update teacher status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true }
    ).select("-password");

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      userRole: "admin",
      action: body.isActive ? "activate_teacher" : "deactivate_teacher",
      details: `${body.isActive ? "Activated" : "Deactivated"} teacher: ${teacher.firstName} ${teacher.lastName}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE - Delete teacher and all their data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get all report cards to delete from Cloudinary
    const reportCards = await ReportCard.find({ teacher: id });
    
    // Delete PDFs from Cloudinary
    for (const report of reportCards) {
      if (report.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(report.cloudinaryPublicId);
        } catch (e) {
          console.error("Error deleting from Cloudinary:", e);
        }
      }
    }

    // Delete all related data in cascade
    await Promise.all([
      // Delete marks for all quizzes by this teacher
      Mark.deleteMany({ quiz: { $in: await Quiz.find({ teacher: id }).distinct("_id") } }),
      // Delete quizzes
      Quiz.deleteMany({ teacher: id }),
      // Delete courses
      Course.deleteMany({ teacher: id }),
      // Delete students
      Student.deleteMany({ teacher: id }),
      // Delete report cards
      ReportCard.deleteMany({ teacher: id }),
      // Delete activity logs
      ActivityLog.deleteMany({ user: id }),
      // Finally delete the teacher
      Teacher.findByIdAndDelete(id),
    ]);

    // Log the deletion
    await ActivityLog.create({
      user: session.user.id,
      userRole: "admin",
      action: "delete_teacher",
      details: `Deleted teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email}) and all associated data`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ message: "Teacher and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
