// Edge-compatible version for middleware.js — uses Web Crypto, no Node.js imports.
// The full Node.js auth.js in lib/ is for API routes only (they run in Node runtime).

const COOKIE_NAME = "kcm_dash_auth";

async function hmac(key, value) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(cookieValue, password) {
  if (!cookieValue || !password) return false;
  const idx = cookieValue.lastIndexOf(".");
  if (idx === -1) return false;
  const value = cookieValue.slice(0, idx);
  const expected = `${value}.${await hmac(password, value)}`;
  return expected === cookieValue;
}

export { COOKIE_NAME };
