import { redis, KEYS } from "@/lib/redis";

let cachedDashboard = null;
let cachedAt = 0;
const CACHE_MS = 60_000; // 1 minute in-memory cache per serverless instance

export async function getDashboardData() {
  const now = Date.now();
  if (cachedDashboard && now - cachedAt < CACHE_MS) return cachedDashboard;
  const data = await redis.get(KEYS.dashboard);
  if (data) {
    cachedDashboard = data;
    cachedAt = now;
  }
  return data;
}

export async function getTransactionsForYears(years) {
  const results = await Promise.all(
    years.map((y) => redis.get(KEYS.transactionsYear(y)))
  );
  return results.flatMap((chunk) => chunk || []);
}

export async function getMeta() {
  return redis.get(KEYS.meta);
}
