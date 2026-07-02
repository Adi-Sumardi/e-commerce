import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = ["SUPER_ADMIN", "STAFF_GUDANG", "CS"];

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (!req.auth || !role || !ADMIN_ROLES.includes(role)) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
