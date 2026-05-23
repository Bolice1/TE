import type { NextConfig } from "next";

/**
 * API traffic is proxied by `src/app/api/[...path]/route.ts` using BACKEND_API_URL.
 * Do not add conflicting /api rewrites here.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
