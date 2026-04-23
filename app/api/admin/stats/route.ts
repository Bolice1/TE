import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { Teacher, Student, Course, Quiz, Mark, ReportCard, ActivityLog } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get overall statistics
    const [
      totalTeachers,
      activeTeachers,
      totalStudents,
      totalCourses,
      totalQuizzes,
      totalReports,
      recentLogins,
      recentActivities,
    ] = await Promise.all([
      Teacher.countDocuments(),
      Teacher.countDocuments({ isActive: true }),
      Student.countDocuments(),
      Course.countDocuments(),
      Quiz.countDocuments(),
      ReportCard.countDocuments(),
      ActivityLog.countDocuments({
        action: "login",
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Get teacher registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const teachersByMonth = await Teacher.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get student distribution by level
    const studentsByLevel = await Student.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Get top teachers by student count
    const topTeachers = await Student.aggregate([
      { $group: { _id: "$teacher", studentCount: { $sum: 1 } } },
      { $sort: { studentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "teachers",
          localField: "_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          _id: 1,
          studentCount: 1,
          teacherName: {
            $concat: ["$teacher.firstName", " ", "$teacher.lastName"],
          },
          email: "$teacher.email",
        },
      },
    ]);

    // Get activity breakdown
    const activityBreakdown = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      overview: {
        totalTeachers,
        activeTeachers,
        inactiveTeachers: totalTeachers - activeTeachers,
        totalStudents,
        totalCourses,
        totalQuizzes,
        totalReports,
        recentLogins,
      },
      teachersByMonth,
      studentsByLevel,
      topTeachers,
      activityBreakdown,
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
