import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "SET (" + process.env.UPSTASH_REDIS_REST_URL.substring(0, 30) + "...)" : "MISSING",
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "SET (hidden)" : "MISSING",
      KV_REST_API_URL: process.env.KV_REST_API_URL ? "SET (" + process.env.KV_REST_API_URL.substring(0, 30) + "...)" : "MISSING",
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "SET (hidden)" : "MISSING",
      DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD ? "SET (hidden)" : "MISSING",
    },
    redis_test: null,
    data_test: null,
  };

  // Test Redis connection
  try {
    const { Redis } = await import("@upstash/redis");
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    
    if (!url || !token) {
      checks.redis_test = "SKIP - no URL/token available";
    } else {
      const redis = new Redis({ url, token });
      const ping = await redis.ping();
      checks.redis_test = "OK - ping: " + ping;

      // Check if data exists
      const meta = await redis.get("kcm:meta");
      checks.data_test = meta ? "OK - data loaded at " + JSON.stringify(meta) : "EMPTY - run npm run load-data";
      
      // Check dashboard key specifically
      const dashboard = await redis.get("kcm:dashboard");
      checks.dashboard_key = dashboard ? "OK - has data (" + JSON.stringify(dashboard).length + " bytes)" : "EMPTY";
    }
  } catch (err) {
    checks.redis_test = "ERROR: " + err.message;
  }

  return NextResponse.json(checks, { status: 200 });
}
