/**
 * Environment configuration for the frontend.
 * All environment variables are defined here and validated at runtime.
 */

const normalizeApiBaseUrl = (value?: string): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "/api";
  }

  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\/+$/, "") || "/api";
  }

  return "/api";
};

export const env = {
  /**
   * API Base URL - frontend uses the same-origin proxy path by default.
   */
  apiBaseUrl: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),

  /**
   * Application metadata
   */
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Teacher Emmy",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  /**
   * Derived URLs for common endpoints
   */
  get apiUrls() {
    const base = this.apiBaseUrl;
    return {
      auth: `${base}/auth`,
      students: `${base}/students`,
      assignments: `${base}/assignments`,
      marks: `${base}/marks`,
      reports: `${base}/reports`,
      analytics: `${base}/analytics`,
    };
  },
} as const;

/**
 * Validate that required environment variables are set
 */
export function validateEnv(): void {
  if (typeof window === "undefined" && !process.env.BACKEND_API_URL && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn(
      "Missing backend API configuration. Set BACKEND_API_URL or NEXT_PUBLIC_API_BASE_URL for non-local environments."
    );
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateEnv();
}

export default env;
