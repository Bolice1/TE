/**
 * Environment configuration for the frontend.
 * All environment variables are defined here and validated at runtime.
 */

export const env = {
  /**
   * API Base URL - must be a public URL (NEXT_PUBLIC_ prefix)
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api",

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
  const required = ["NEXT_PUBLIC_API_BASE_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && typeof window === "undefined") {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateEnv();
}

export default env;
