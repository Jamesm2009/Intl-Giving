"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum, fmtPct } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

export default function OverviewPage() {
  const { data, error, loading } = useDashboardData();

  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <OverviewInner data={data} />}
    </StatusWrapper>
  );
}

function OverviewInner({ data }) {
  const overall = data.overall; // [{Transaction Year, Donors, Trans, USD, AvgGift}]
  const latestFull = overall.filter((r) => r["Transaction Year"] < 2026).at(-1);
  const prevFull = overall.filter((r) => r["Transaction Year"] < 2026).at(-2);
  const h1_2026 = overall.find((r) => r["Transaction Year"] === 2026);

  const yoyUsd =
    latestFull && prevFull
      ? ((latestFull.USD - prevFull.USD) / prevFull.USD) * 100
      : null;
  const yoyDonors =
    latestFull && prevFull
      ? ((latestFull.Donors - prevFull.Donors) / prevFull.Donors) * 100
      : null;

  const chartData = overall.map((r) => ({
    year: r["Transaction Year"],
    USD_M: +(r.USD / 1e6).toFixed(3),
    Donors: r.Donors,
  }));

  return (
    <>
      <div className="kpi-grid">
        <KpiCard
          label={`Total $ (${latestFull["Transaction Year"]})`}
          value={fmtUSD(latestFull.USD)}
          delta={yoyUsd}
        />
        <KpiCard
          label={`Unique Donors (${latestFull["Transaction Year"]})`}
          value={fmtNum(latestFull.Donors)}
          delta={yoyDonors}
        />
        <KpiCard
          label="Avg. Gift"
          value={fmtUSD(latestFull.AvgGift)}
        />
        <KpiCard
          label="2026 H1 (partial)"
          value={h1_2026 ? fmtUSD(h1_2026.USD) : "—"}
          sub={h1_2026 ? `${fmtNum(h1_2026.Donors)} donors, Jan\u2013Jun` : ""}
        />
      </div>

      <div className="card">
        <h2>Total Giving &amp; Unique Donors</h2>
        <div className="card-sub">
          Full calendar years 2020&ndash;2025; 2026 is H1 only (shown lighter).
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" tickFormatter={(v) => `$${v}M`} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) =>
                name === "USD_M" ? [`$${value}M`, "Total $"] : [value, "Donors"]
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="USD_M" name="Total $ (M)" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="Donors" name="Unique Donors" stroke="#B8860B" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="note">
        This dashboard reflects the transaction-level analysis: figures may differ
        slightly (&lt;1%) from earlier summary workbooks due to post-close
        adjustments. See the Campaigns tab for the Victorython effect and the
        Regions tab for batch-account adjustments (KCM Australia/Europe/Canada/S.
        Africa).
      </div>
    </>
  );
}

function KpiCard({ label, value, delta, sub }) {
  return (
    <div className="kpi-card">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
      {delta != null && (
        <div className={`delta ${delta >= 0 ? "up" : "down"}`}>
          {delta >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(delta))}
        </div>
      )}
      {sub && <div className="label">{sub}</div>}
    </div>
  );
}
