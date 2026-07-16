"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData, fmtUSD, fmtNum } from "@/lib/hooks";
import StatusWrapper from "@/components/StatusWrapper";

const PALETTE = ["#1B2A4A", "#B8860B", "#5C7A99", "#8B3A3A", "#6B8E23", "#7B6888", "#C08552", "#4B6E4B"];

export default function CountryPage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <CountryInner data={data} />}
    </StatusWrapper>
  );
}

function CountryInner({ data }) {
  const c = data.country;
  const [n, setN] = useState(8);

  const topN = c.top_countries.slice(0, n);
  const trendData = c.years.map((y, i) => {
    const row = { year: y };
    topN.forEach((country) => {
      row[country] = c.usd[country][i];
    });
    return row;
  });

  const latestIdx = c.years.length - 1;
  const ranking = c.top_countries
    .map((country) => ({
      country,
      usd: c.usd[country][latestIdx],
      trans: c.trans[country][latestIdx],
    }))
    .sort((a, b) => b.usd - a.usd);

  const countryCountData = c.years.map((y, i) => ({
    year: y,
    countries: c.country_count_by_year[i],
  }));

  return (
    <>
      <div className="card">
        <h2>Active Countries per Year</h2>
        <div className="card-sub">
          Number of distinct countries giving each year &mdash; a shrinking
          list is a reach/engagement signal independent of total dollars.
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={countryCountData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="countries" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Top Countries Trend</h2>
        <div className="controls-row">
          <label className="card-sub" style={{ marginBottom: 0 }}>
            Show top&nbsp;
            <select value={n} onChange={(e) => setN(parseInt(e.target.value, 10))}>
              {[5, 8, 10, 15, 20].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            &nbsp;countries by lifetime $
          </label>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}K`} />
            <Tooltip formatter={(v) => fmtUSD(v)} />
            <Legend />
            {topN.map((country, i) => (
              <Line key={country} type="monotone" dataKey={country} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Country Ranking &mdash; {c.years[latestIdx]}</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Total $</th>
              <th>Transactions</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r) => (
              <tr key={r.country}>
                <td>{r.country}</td>
                <td>{fmtUSD(r.usd)}</td>
                <td>{fmtNum(r.trans)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
