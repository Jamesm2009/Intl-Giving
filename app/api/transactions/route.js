import { NextResponse } from "next/server";

const ALL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

async function getTransactions(yearsToLoad) {
  try {
    const { Redis } = await import("@upstash/redis");
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) return null;
    const redis = new Redis({ url, token });
    const results = await Promise.all(
      yearsToLoad.map((y) => redis.get(`kcm:transactions:${y}`))
    );
    return results.flatMap((chunk) => chunk || []);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const region = searchParams.get("region");
  const country = searchParams.get("country");
  const fundCode = searchParams.get("fundCode");
  const minAmount = searchParams.get("minAmount");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50", 10), 200);

  const yearsToLoad = year && year !== "all" ? [parseInt(year, 10)] : ALL_YEARS;
  let rows = await getTransactions(yearsToLoad);

  if (!rows) {
    return NextResponse.json({
      rows: [],
      total: 0,
      totalAmount: 0,
      page: 1,
      pageSize,
      totalPages: 1,
      error: "Transaction data not yet loaded into Redis. Visit /api/seed to load it, or run npm run load-data locally.",
    });
  }

  if (region && region !== "all") rows = rows.filter((r) => r.region === region);
  if (country && country !== "all") rows = rows.filter((r) => r.country === country);
  if (fundCode && fundCode !== "all") rows = rows.filter((r) => r.fundCode === fundCode);
  if (minAmount) { const min = parseFloat(minAmount); rows = rows.filter((r) => r.amount >= min); }
  if (q) { const needle = q.toLowerCase(); rows = rows.filter((r) => (r.org && r.org.toLowerCase().includes(needle)) || (r.country && r.country.toLowerCase().includes(needle)) || (r.fundCode && r.fundCode.toLowerCase().includes(needle))); }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = rows.length;
  const totalAmount = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return NextResponse.json({ rows: pageRows, total, totalAmount, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}
