import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/messages",
  "/marketplace",
  "/groups",
  "/learn",
  "/leaderboard",
  "/settings",
  "/topup",
  "/ai",
  "/vip",
  "/admin",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/messages/:path*",
    "/marketplace/:path*",
    "/groups/:path*",
    "/learn/:path*",
    "/leaderboard/:path*",
    "/settings/:path*",
    "/topup/:path*",
    "/ai/:path*",
    "/vip/:path*",
    "/admin/:path*",
  ],
};
