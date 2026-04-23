import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // Security headers
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // Admin route protection
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Teacher route protection - redirect admin to admin dashboard
    if (isDashboardRoute && token?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
