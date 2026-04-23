import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { ActivityLog, Teacher, Admin } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || "";
    const userRole = searchParams.get("userRole") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const query: Record<string, unknown> = {};

    if (action) {
      query.action = action;
    }

    if (userRole) {
      query.userRole = userRole;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ]);

    // Populate user names
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        let userName = "Unknown";
        
        if (log.userRole === "teacher") {
          const teacher = await Teacher.findById(log.user).select("firstName lastName");
          if (teacher) {
            userName = `${teacher.firstName} ${teacher.lastName}`;
          }
        } else if (log.userRole === "admin") {
          const admin = await Admin.findById(log.user).select("firstName lastName");
          if (admin) {
            userName = `${admin.firstName} ${admin.lastName}`;
          }
        }

        return {
          ...log.toObject(),
          userName,
        };
      })
    );

    return NextResponse.json({
      logs: logsWithUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
