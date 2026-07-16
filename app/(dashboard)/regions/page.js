"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

const REGION_COLORS = {
  Africa: "#1B2A4A",
  Australasia: "#B8860B",
  Canada: "#5C7A99",
  Europe: "#8B3A3A",
  LATAM: "#6B8E23",
  Ukraine: "#7B6888",
};
const REGIONS = Object.keys(REGION_COLORS);

export default function RegionsPage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <RegionsInner data={data} />}
    </StatusWrapper>
  );
}

function RegionsInner({ data }) {
  const [metric, setMetric] = useState("usd"); // usd | trans | donors
  const [mode, setMode] = useState("all-in"); // all-in | adjusted

  const years = data.regional.years;
  const chartData = years.map((y, i) => {
    const row = { year: y };
    REGIONS.forEach((r) => {
      row[r] = data.regional[metric][r][i];
    });
    return row;
  });

  // Apply adjustment: subtract KCM Australia batch from Australasia, KCM Europe one-offs from Europe (usd only)
  let adjustedNote = null;
  if (mode === "adjusted" && metric === "usd") {
    chartData.forEach((row) => {
      const a = data.australasia_adjusted.find((x) => x["Transaction Year"] === row.year);
      if (a) row.Australasia = a.Adjusted;
      const e = data.europe_adjusted.find((x) => x["Transaction Year"] === row.year);
      if (e) row.Europe = e.Adjusted;
    });
    adjustedNote =
      "Adjusted view removes the KCM Australia batch account from Australasia and the two KCM Europe one-off remittances from Europe.";
  }

  const latestYear = years[years.length - 1];
  const latestIdx = years.length - 1;
  const totals = REGIONS.map((r) => ({
    region: r,
    usd: data.regional.usd[r][latestIdx],
    trans: data.regional.trans[r][latestIdx],
    donors: data.regional.donors[r][latestIdx],
  })).sort((a, b) => b.usd - a.usd);

  return (
    <>
      <div className="card">
        <h2>Regional Comparison</h2>
        <div className="card-sub">
          Transactions, dollars, and donors by region, 2020&ndash;2026 (2026 = H1).
        </div>

        <div className="controls-row">
          <div className="toggle-group">
            {["usd", "trans", "donors"].map((m) => (
              <button
                key={m}
                className={metric === m ? "active" : ""}
                onClick={() => setMetric(m)}
              >
                {m === "usd" ? "Dollars" : m === "trans" ? "Transactions" : "Donors"}
              </button>
            ))}
          </div>
          <div className="toggle-group">
            {["all-in", "adjusted"].map((m) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => setMode(m)}
              >
                {m === "all-in" ? "All-in (reported)" : "Adjusted (organic)"}
              </button>
            ))}
          </div>
        </div>
        {adjustedNote && <div className="note">{adjustedNote}</div>}
        {mode === "adjusted" && metric !== "usd" && (
          <div className="note">
            Adjustment is currently only modeled for dollars. Switch to
            &quot;Dollars&quot; to see the adjusted view.
          </div>
        )}

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(v) => (metric === "usd" ? fmtUSD(v) : fmtNum(v))} />
            <Legend />
            {REGIONS.map((r) => (
              <Line
                key={r}
                type="monotone"
                dataKey={r}
                stroke={REGION_COLORS[r]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Region Ranking &mdash; {latestYear}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Total $</th>
              <th>Transactions</th>
              <th>Unique Donors</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t) => (
              <tr key={t.region}>
                <td>{t.region}</td>
                <td>{fmtUSD(t.usd)}</td>
                <td>{fmtNum(t.trans)}</td>
                <td>{fmtNum(t.donors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
