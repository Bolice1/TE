import { getClientApiBaseUrl, getBackendApiUrl } from "@/lib/backend-config";

export const env = {
  get apiBaseUrl() {
    return getClientApiBaseUrl();
  },

  appName: process.env.NEXT_PUBLIC_APP_NAME || "Teacher Emmy",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
} as const;

export function validateEnv(): void {
  if (typeof window !== "undefined") {
    return;
  }

  if (!getBackendApiUrl()) {
    console.error(
      "[TE] BACKEND_API_URL is missing. The /api proxy cannot reach Express. " +
        "Set BACKEND_API_URL in .env.local (dev) or on your hosting provider (production)."
    );
  }
}

if (typeof window === "undefined") {
  validateEnv();
}

export default env;
