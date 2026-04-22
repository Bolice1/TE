import { NextRequest,NextResponse } from "next/server";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5758";  

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    try {
        const response = await fetch(`${backendUrl}/api/reports/reports/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication headers if needed
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.msg || "Failed to fetch report" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json({ error: "Server error while fetching report" }, { status: 500 });
    }
}