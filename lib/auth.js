import crypto from "crypto";

const COOKIE_NAME = "kcm_dash_auth";

function secret() {
  // Falls back to a fixed string only so local dev without .env doesn't crash;
  // in production you MUST set DASHBOARD_PASSWORD in Vercel env vars.
  return process.env.DASHBOARD_PASSWORD || "dev-only-insecure-secret";
}

function sign(value) {
  const h = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function verify(signed) {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return false;
  const value = signed.slice(0, idx);
  const expected = sign(value);
  return expected === signed;
}

export const AUTH_COOKIE = COOKIE_NAME;

export function makeSessionCookieValue() {
  // Value itself doesn't need to carry data, just needs to be validly signed
  // with the current DASHBOARD_PASSWORD so rotating the password invalidates
  // all existing sessions automatically.
  return sign("ok");
}

export function isValidSession(cookieValue) {
  return verify(cookieValue);
}

export function checkPassword(candidate) {
  const real = process.env.DASHBOARD_PASSWORD;
  if (!real) return false;
  // Constant-time-ish comparison
  const a = Buffer.from(candidate || "");
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
