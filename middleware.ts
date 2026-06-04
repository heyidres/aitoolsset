/**
 * Route protection for /admin/*.
 *
 * Only signed-in users with role "editor" or "admin" can hit
 * those routes. Unauthenticated users are redirected to /signin;
 * regular users land on /.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const url = new URL("/api/auth/signin", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (session.user.role !== "admin" && session.user.role !== "editor") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
