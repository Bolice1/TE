import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { ReportCard } from "@/lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const term = searchParams.get("term");
    const academicYear = searchParams.get("academicYear");

    const query: Record<string, unknown> = {};
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportCard.find(query)
        .populate("student", "firstName lastName level")
        .populate("teacher", "firstName lastName")
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReportCard.countDocuments(query),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin reports fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
