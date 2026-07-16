import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";

export async function GET() {
  const data = await getDashboardData();
  if (!data) {
    return NextResponse.json(
      { error: "No data found in Redis. Run `npm run load-data` first." },
      { status: 404 }
    );
  }
  return NextResponse.json(data);
}
