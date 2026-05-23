import { NextResponse } from "next/server";
import {
  CLIENT_API_PREFIX,
  getBackendApiUrl,
  PROXY_FETCH_TIMEOUT_MS,
} from "@/lib/backend-config";

export const dynamic = "force-dynamic";

/** Diagnostics for frontend ↔ backend connectivity (no secrets). */
export async function GET() {
  const backendApiUrl = getBackendApiUrl();

  if (!backendApiUrl) {
    return NextResponse.json({
      ok: false,
      clientApiPrefix: CLIENT_API_PREFIX,
      backendConfigured: false,
      backendReachable: false,
      message: "BACKEND_API_URL is not set on the Next.js service.",
    });
  }

  let backendReachable = false;
  let backendHealth: unknown = null;
  let error: string | null = null;

  try {
    const response = await fetch(`${backendApiUrl}/health`, {
      signal: AbortSignal.timeout(PROXY_FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    backendReachable = response.ok;
    backendHealth = await response.json().catch(() => null);
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : "Unknown error";
  }

  return NextResponse.json({
    ok: backendReachable,
    clientApiPrefix: CLIENT_API_PREFIX,
    backendConfigured: true,
    backendApiUrl,
    backendReachable,
    backendHealth,
    ...(error ? { error } : {}),
  });
}
