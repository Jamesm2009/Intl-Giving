import { NextResponse } from "next/server";
import { COOKIE_NAME, isValidSession } from "@/lib/auth-edge";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const password = process.env.DASHBOARD_PASSWORD || "";
  const valid = await isValidSession(cookie, password);

  if (valid) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
