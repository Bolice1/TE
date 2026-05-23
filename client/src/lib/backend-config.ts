/**
 * Single source of truth for how the Next.js app reaches the Express API.
 *
 * Flow:
 *   Browser  →  /api/* (same origin)
 *   Next.js  →  BACKEND_API_URL + /api/*
 *   Express  →  routes under /api/*
 */

export const CLIENT_API_PREFIX = "/api";

export const normalizeBackendApiUrl = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

/** Server-only: Express API base including `/api` suffix. */
export const getBackendApiUrl = (): string | null =>
  normalizeBackendApiUrl(process.env.BACKEND_API_URL);

/** Browser-safe API prefix — always same-origin proxy. */
export const getClientApiBaseUrl = (): string => CLIENT_API_PREFIX;

export const buildClientApiPath = (endpoint: string): string => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${CLIENT_API_PREFIX}${path}`;
};

export const buildBackendTargetUrl = (pathSegments: string[], search = ""): string | null => {
  const backendApiUrl = getBackendApiUrl();
  if (!backendApiUrl) {
    return null;
  }

  const path = pathSegments.filter(Boolean).join("/");
  const url = new URL(`${backendApiUrl}/${path}`);
  if (search.startsWith("?")) {
    const params = new URLSearchParams(search.slice(1));
    params.forEach((value, key) => url.searchParams.append(key, value));
  }
  return url.toString();
};

export const PROXY_FETCH_TIMEOUT_MS = 30_000;
