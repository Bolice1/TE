import { NextRequest } from "next/server";

const DEFAULT_BACKEND_API_URL = "http://localhost:4000/api";

const normalizeBackendApiUrl = (value?: string): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return DEFAULT_BACKEND_API_URL;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const getBackendApiUrl = (): string =>
  normalizeBackendApiUrl(
    process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
  );

const proxyRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const backendApiUrl = getBackendApiUrl();
  const targetUrl = new URL(`${backendApiUrl}/${path.join("/")}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
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
    return Response.json(
      {
        message: "Unable to reach the backend service.",
        backendApiUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
};

export const dynamic = "force-dynamic";

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
