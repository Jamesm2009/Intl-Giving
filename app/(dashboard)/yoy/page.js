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
  Cell,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum, fmtPct } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

export default function YoyPage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <YoyInner data={data} />}
    </StatusWrapper>
  );
}

function YoyInner({ data }) {
  const overall = data.overall;
  const rows = overall.map((r, i) => {
    const prev = overall[i - 1];
    return {
      year: r["Transaction Year"],
      USD: r.USD,
      Donors: r.Donors,
      yoyUsd: prev ? ((r.USD - prev.USD) / prev.USD) * 100 : null,
      yoyDonors: prev ? ((r.Donors - prev.Donors) / prev.Donors) * 100 : null,
    };
  });

  return (
    <>
      <div className="card">
        <h2>Year-on-Year $ Change</h2>
        <div className="card-sub">
          Bars colored red where dollars declined vs. the prior year.
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={rows.filter((r) => r.yoyUsd != null)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => fmtPct(v)} />
            <Bar dataKey="yoyUsd" name="YoY $ Change">
              {rows.filter((r) => r.yoyUsd != null).map((r, idx) => (
                <Cell key={idx} fill={r.yoyUsd >= 0 ? "#4B6E4B" : "#8B3A3A"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Year-on-Year Detail</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Total $</th>
              <th>YoY $</th>
              <th>Donors</th>
              <th>YoY Donors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year}>
                <td>{r.year}</td>
                <td>{fmtUSD(r.USD)}</td>
                <td style={{ color: r.yoyUsd == null ? undefined : r.yoyUsd >= 0 ? "#4B6E4B" : "#8B3A3A" }}>
                  {r.yoyUsd == null ? "—" : fmtPct(r.yoyUsd)}
                </td>
                <td>{fmtNum(r.Donors)}</td>
                <td style={{ color: r.yoyDonors == null ? undefined : r.yoyDonors >= 0 ? "#4B6E4B" : "#8B3A3A" }}>
                  {r.yoyDonors == null ? "—" : fmtPct(r.yoyDonors)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Mega-Gift Outliers (&ge;$20,000)</h2>
        <div className="card-sub">
          These single transactions materially shape the year/region they land
          in &mdash; worth checking before reading a year-over-year swing as
          organic donor behavior.
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Region</th>
              <th>Country</th>
              <th>Donor</th>
              <th>Fund</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.mega_gifts.map((g, i) => (
              <tr key={i}>
                <td>{g["Transaction Date"]}</td>
                <td>{g["Regional Office"]}</td>
                <td>{g["Country Name"]}</td>
                <td>{g["Organization Name"]}</td>
                <td>{g["Project Code"]}</td>
                <td>{fmtUSD(g["Total Amount"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
