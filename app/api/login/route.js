import { NextResponse } from "next/server";
import { AUTH_COOKIE, checkPassword, makeSessionCookieValue } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, makeSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
