import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export const maxDuration = 60; // allow up to 60s for Vercel serverless

export async function GET() {
  try {
    const { Redis } = await import("@upstash/redis");
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      return NextResponse.json({ error: "Redis env vars not set" }, { status: 500 });
    }

    const redis = new Redis({ url, token });
    const dataDir = path.join(process.cwd(), "data");
    const log = [];

    // 1. Load dashboard aggregate data
    const dashboardPath = path.join(dataDir, "dashboard_data.json");
    const dashboardData = JSON.parse(readFileSync(dashboardPath, "utf-8"));
    await redis.set("kcm:dashboard", dashboardData);
    log.push("kcm:dashboard written");

    // 2. Load transaction chunks by year
    const txnDir = path.join(dataDir, "transactions-by-year");
    const files = readdirSync(txnDir).filter((f) => f.endsWith(".json"));
    let totalRows = 0;

    for (const file of files) {
      const year = file.match(/(\d{4})/)[1];
      const rows = JSON.parse(readFileSync(path.join(txnDir, file), "utf-8"));
      await redis.set(`kcm:transactions:${year}`, rows);
      log.push(`kcm:transactions:${year} written (${rows.length} rows)`);
      totalRows += rows.length;
    }

    // 3. Write meta
    await redis.set("kcm:meta", {
      loadedAt: new Date().toISOString(),
      totalTransactionRows: totalRows,
      years: files.map((f) => f.match(/(\d{4})/)[1]),
    });
    log.push(`kcm:meta written (${totalRows} total rows)`);

    return NextResponse.json({
      ok: true,
      message: `Loaded ${totalRows} transactions across ${files.length} years`,
      log,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
