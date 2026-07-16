import { NextResponse } from "next/server";
import y2020 from "@/lib/txn-data/y2020";
import y2021 from "@/lib/txn-data/y2021";
import y2022 from "@/lib/txn-data/y2022";
import y2023 from "@/lib/txn-data/y2023";
import y2024 from "@/lib/txn-data/y2024";
import y2025 from "@/lib/txn-data/y2025";
import y2026 from "@/lib/txn-data/y2026";

const BY_YEAR = { 2020: y2020, 2021: y2021, 2022: y2022, 2023: y2023, 2024: y2024, 2025: y2025, 2026: y2026 };
const ALL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

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
  let rows = yearsToLoad.flatMap((y) => BY_YEAR[y] || []);

  if (region && region !== "all") rows = rows.filter((r) => r.region === region);
  if (country && country !== "all") rows = rows.filter((r) => r.country === country);
  if (fundCode && fundCode !== "all") rows = rows.filter((r) => r.fundCode === fundCode);
  if (minAmount) { const min = parseFloat(minAmount); rows = rows.filter((r) => r.amount >= min); }
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) =>
      (r.org && r.org.toLowerCase().includes(needle)) ||
      (r.country && r.country.toLowerCase().includes(needle)) ||
      (r.fundCode && r.fundCode.toLowerCase().includes(needle))
    );
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = rows.length;
  const totalAmount = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return NextResponse.json({ rows: pageRows, total, totalAmount, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}
