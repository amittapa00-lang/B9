import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login", nextUrl)
    );
  }

  const role = req.auth?.user?.role;

  if (
    nextUrl.pathname.startsWith("/admin") &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
  ],
};