import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import dbConnect from "@/lib/db/connect";
import { ReportCard, ActivityLog } from "@/lib/db/models";
import { deleteFromCloudinary } from "@/lib/utils/cloudinary";

// GET single report card
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const query: Record<string, unknown> = { _id: id };
    if (session.user.role === "teacher") {
      query.teacher = session.user.id;
    }

    const reportCard = await ReportCard.findOne(query)
      .populate("student", "firstName lastName studentId level")
      .populate("teacher", "firstName lastName email");

    if (!reportCard) {
      return NextResponse.json(
        { error: "Report card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(reportCard);
  } catch (error) {
    console.error("Error fetching report card:", error);
    return NextResponse.json(
      { error: "Failed to fetch report card" },
      { status: 500 }
    );
  }
}

// DELETE report card
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const query: Record<string, unknown> = { _id: id };
    if (session.user.role === "teacher") {
      query.teacher = session.user.id;
    }

    const reportCard = await ReportCard.findOne(query);

    if (!reportCard) {
      return NextResponse.json(
        { error: "Report card not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (reportCard.cloudinaryPublicId) {
      await deleteFromCloudinary(reportCard.cloudinaryPublicId);
    }

    await ReportCard.findByIdAndDelete(id);

    // Log activity
    await ActivityLog.create({
      user: session.user.id,
      userRole: session.user.role,
      action: "delete_report_card",
      details: `Deleted report card ${id}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ message: "Report card deleted successfully" });
  } catch (error) {
    console.error("Error deleting report card:", error);
    return NextResponse.json(
      { error: "Failed to delete report card" },
      { status: 500 }
    );
  }
}
