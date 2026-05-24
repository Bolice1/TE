import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendTargetUrl,
  getBackendApiUrl,
  PROXY_FETCH_TIMEOUT_MS,
} from "@/lib/backend-config";

const proxyRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const backendApiUrl = getBackendApiUrl();

  if (!backendApiUrl) {
    return NextResponse.json(
      {
        message: "Backend API URL is not configured.",
        hint: "Set BACKEND_API_URL on the Next.js service (e.g. https://your-api.onrender.com or http://127.0.0.1:4000).",
      },
      { status: 500 }
    );
  }

  const search = request.nextUrl.search;
  const targetUrl = buildBackendTargetUrl(path, search);

  if (!targetUrl) {
    return NextResponse.json({ message: "Invalid proxy target." }, { status: 500 });
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(PROXY_FETCH_TIMEOUT_MS),
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy error:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 502 }
    );
  }
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
