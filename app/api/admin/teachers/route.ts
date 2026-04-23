import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { Teacher, Student, Course, Quiz, Mark, ReportCard, ActivityLog } from "@/lib/db/models";

// GET all teachers with their statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const teachers = await Teacher.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Get statistics for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        const [studentCount, courseCount, quizCount, reportCount] = await Promise.all([
          Student.countDocuments({ teacher: teacher._id }),
          Course.countDocuments({ teacher: teacher._id }),
          Quiz.countDocuments({ teacher: teacher._id }),
          ReportCard.countDocuments({ teacher: teacher._id }),
        ]);

        return {
          ...teacher.toObject(),
          stats: {
            students: studentCount,
            courses: courseCount,
            quizzes: quizCount,
            reports: reportCount,
          },
        };
      })
    );

    return NextResponse.json(teachersWithStats);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
