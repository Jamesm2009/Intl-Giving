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
  BarChart,
  Bar,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

const CAT_COLORS = {
  "KCM General Fund": "#1B2A4A",
  "EMIC General Fund": "#B8860B",
  "Media / Broadcast": "#5C7A99",
  "Israel Fund": "#8B3A3A",
  "Campus / Building": "#6B8E23",
  "KCGC (Major Institutional)": "#7B6888",
  "Other / Designated": "#C9C9C9",
  Relief: "#B0B0B0",
};

export default function FundCodePage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <FundCodeInner data={data} />}
    </StatusWrapper>
  );
}

function FundCodeInner({ data }) {
  const [view, setView] = useState("category"); // category | topcodes

  const catShare = data.fund_category_share;
  const catChartData = catShare.years.map((y, i) => {
    const row = { year: y };
    Object.keys(catShare.categories).forEach((c) => {
      row[c] = catShare.categories[c][i];
    });
    return row;
  });

  const fc = data.fund_code;
  const topCodes = fc.codes.slice(0, 15).map((code, i) => ({
    code,
    total: fc.totals[i],
    count: fc.counts[i],
    program: fc.program_map[code] || "Other",
  }));

  return (
    <>
      <div className="card">
        <h2>Fund Category Mix</h2>
        <div className="card-sub">
          Share of total annual dollars by program category, full calendar
          years 2020&ndash;2025.
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={catChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            {Object.keys(catShare.categories).map((c) => (
              <Line key={c} type="monotone" dataKey={c} stroke={CAT_COLORS[c] || "#888"} strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Top 15 Project Codes by Total $ (2020&ndash;2026)</h2>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={topCodes} layout="vertical" margin={{ top: 10, right: 30, left: 90, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" tickFormatter={(v) => `$${Math.round(v / 1000)}K`} />
            <YAxis type="category" dataKey="code" width={90} />
            <Tooltip formatter={(v) => fmtUSD(v)} />
            <Bar dataKey="total" fill="#1B2A4A" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <table className="data-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Program Category</th>
              <th>Total $</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {topCodes.map((c) => (
              <tr key={c.code}>
                <td>{c.code}</td>
                <td>{c.program}</td>
                <td>{fmtUSD(c.total)}</td>
                <td>{fmtNum(c.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="note">
        K100 = KCM General Fund, C100 = EMIC General Fund (validated against
        the original summary workbook). Codes beginning with &quot;C&quot;
        belong to the EMIC entity; &quot;K&quot;/&quot;Y&quot; codes belong to
        KCM.
      </div>
    </>
  );
}
