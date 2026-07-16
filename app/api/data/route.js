import { NextResponse } from "next/server";
import dashboardData from "@/lib/dashboard-data";

export async function GET() {
  return NextResponse.json(dashboardData);
}
