import { Redis } from "@upstash/redis";

// Supports both naming conventions Vercel may have set up:
// - Vercel Marketplace "Upstash" integration:      UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// - Legacy "Vercel KV" integration:                KV_REST_API_URL / KV_REST_API_TOKEN
const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.warn(
    "[redis] Missing UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN) env vars."
  );
}

export const redis = new Redis({
  url: url || "",
  token: token || "",
});

// Central place for the Redis keys this app reads/writes.
// Keep in sync with scripts/load-data.mjs.
export const KEYS = {
  dashboard: "kcm:dashboard", // one JSON blob: overview/regional/yoy/fund/country/retention/campaigns
  transactionsYear: (year) => `kcm:transactions:${year}`,
  meta: "kcm:meta", // load timestamp, row counts, etc.
};
