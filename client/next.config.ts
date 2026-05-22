import type { NextConfig } from "next";

const normalizeBackendApiUrl = (value?: string): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "http://localhost:4000/api";
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const nextConfig: NextConfig = {
  async rewrites() {
    const backendApiUrl = normalizeBackendApiUrl(
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
    );

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
