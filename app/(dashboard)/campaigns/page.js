"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

export default function CampaignsPage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <CampaignsInner data={data} />}
    </StatusWrapper>
  );
}

function CampaignsInner({ data }) {
  const vict = data.victorython; // [{Year, SepOctActual, BaselineExpected, Incremental, Donors}]

  return (
    <>
      <div className="card">
        <h2>The &quot;Victorython&quot; Effect</h2>
        <div className="card-sub">
          September&ndash;October Victory Channel giving (KNET + KGOVICTORY)
          vs. the baseline pace implied by the rest of each year.
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={vict} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="Year" />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}K`} />
            <Tooltip formatter={(v) => fmtUSD(v)} />
            <Legend />
            <Bar dataKey="BaselineExpected" name="Expected (no event)" fill="#B0B0B0" />
            <Bar dataKey="SepOctActual" name="Actual Sep\u2013Oct $" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="note">
          The campaign ran 2020&ndash;2024 and was not repeated in 2025 &mdash;
          visible directly as the collapse of the September&ndash;October
          spike that year.
        </div>
      </div>

      <div className="card">
        <h2>Incremental Impact &amp; Participation</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Sep&ndash;Oct Actual</th>
              <th>Baseline Pace</th>
              <th>Incremental</th>
              <th>Participating Donors</th>
            </tr>
          </thead>
          <tbody>
            {vict.map((r) => (
              <tr key={r.Year}>
                <td>{r.Year}</td>
                <td>{fmtUSD(r.SepOctActual)}</td>
                <td>{fmtUSD(r.BaselineExpected)}</td>
                <td style={{ color: r.Incremental >= 0 ? "#4B6E4B" : "#8B3A3A" }}>
                  {r.Incremental >= 0 ? "+" : ""}
                  {fmtUSD(r.Incremental)}
                </td>
                <td>{fmtNum(r.Donors)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Why This Matters for 2025&apos;s Decline</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Of the 119 donors who gave <em>only</em> during the Sep&ndash;Oct
          2024 Victorython window (no other gift anywhere else that year),
          just 13 (11%) gave anything at all in 2025. That is 106 donors who
          effectively disappeared &mdash; roughly <strong>40% of 2025&apos;s
          entire net donor loss</strong> traces to this one discontinued
          campaign. Regionally, Canada accounted for 40&ndash;71% of the
          September&ndash;October Victory Channel dollars in every year the
          campaign ran.
        </p>
      </div>
    </>
  );
}
