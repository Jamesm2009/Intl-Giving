// One-time (or re-run-as-needed) loader: pushes the pre-computed dashboard
// JSON and the raw transactions (chunked by year) into Redis.
//
// Usage:
//   1. Create .env.local in the project root with your Redis credentials
//      (see .env.example) and DASHBOARD_PASSWORD.
//   2. npm install
//   3. npm run load-data
//
// This does NOT run automatically on deploy — run it yourself whenever the
// underlying data changes, then redeploy (or just refresh the site; Redis
// is read live on every request, aside from a 60s in-memory cache).

import "dotenv/config";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(
    "Missing Redis env vars. Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN\n" +
      "(or KV_REST_API_URL / KV_REST_API_TOKEN) in .env.local before running this."
  );
  process.exit(1);
}

const redis = new Redis({ url, token });

async function main() {
  const dashboardPath = path.join(__dirname, "..", "data", "dashboard_data.json");
  const dashboardData = JSON.parse(readFileSync(dashboardPath, "utf-8"));

  console.log("Writing kcm:dashboard ...");
  await redis.set("kcm:dashboard", dashboardData);

  const txnDir = path.join(__dirname, "..", "data", "transactions-by-year");
  const files = readdirSync(txnDir).filter((f) => f.endsWith(".json"));

  let totalRows = 0;
  for (const file of files) {
    const year = file.match(/(\d{4})/)[1];
    const rows = JSON.parse(readFileSync(path.join(txnDir, file), "utf-8"));
    console.log(`Writing kcm:transactions:${year} (${rows.length} rows) ...`);
    await redis.set(`kcm:transactions:${year}`, rows);
    totalRows += rows.length;
  }

  await redis.set("kcm:meta", {
    loadedAt: new Date().toISOString(),
    totalTransactionRows: totalRows,
    years: files.map((f) => f.match(/(\d{4})/)[1]),
  });

  console.log(`Done. Loaded ${totalRows} transaction rows across ${files.length} years.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
