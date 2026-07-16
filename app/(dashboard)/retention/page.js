"use client";

import {
  BarChart,
  Bar,
  LineChart,
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

const REGION_COLORS = {
  Africa: "#1B2A4A",
  Australasia: "#B8860B",
  Canada: "#5C7A99",
  Europe: "#8B3A3A",
  LATAM: "#6B8E23",
  Ukraine: "#7B6888",
};

export default function RetentionPage() {
  const { data, error, loading } = useDashboardData();
  return (
    <StatusWrapper loading={loading} error={error}>
      {data && <RetentionInner data={data} />}
    </StatusWrapper>
  );
}

function RetentionInner({ data }) {
  const cohort = data.cohort; // [{Year, Donors, New, Returning, USD, NewUSD, ReturningUSD}]
  const conc = data.concentration; // [{Year, Top20SharePct}]
  const ret = data.regional_retention;

  const retChartData = ret.years.map((y, i) => {
    const row = { year: y };
    Object.keys(ret.rates).forEach((r) => {
      row[r] = ret.rates[r][i];
    });
    return row;
  });

  return (
    <>
      <div className="card">
        <h2>Donor Base: New vs. Returning</h2>
        <div className="card-sub">
          Excludes KCM office batch accounts (Australia/Canada/Europe/S.
          Africa/Colombia).
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={cohort} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="Year" />
            <YAxis />
            <Tooltip formatter={(v) => fmtNum(v)} />
            <Legend />
            <Bar dataKey="Returning" name="Returning Donors" stackId="a" fill="#1B2A4A" />
            <Bar dataKey="New" name="New Donors" stackId="a" fill="#B8860B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Top 20 Donor Concentration</h2>
        <div className="card-sub">
          Share of total dollars from the top 20 donors each year (excludes
          office batch accounts). 2020&apos;s spike is driven almost entirely
          by the single $500,000 Canada gift &mdash; see Year-on-Year tab.
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={conc} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="Year" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => fmtPct(v)} />
            <Line type="monotone" dataKey="Top20SharePct" name="Top 20 Share" stroke="#8B3A3A" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Year-over-Year Retention Rate by Region</h2>
        <div className="card-sub">
          Share of a region&apos;s donors from one year who gave again the
          next. 2026 is a partial-year, immature reading.
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={retChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => fmtPct(v)} />
            <Legend />
            {Object.keys(ret.rates).map((r) => (
              <Line key={r} type="monotone" dataKey={r} stroke={REGION_COLORS[r]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Cohort Detail</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Total Donors</th>
              <th>New</th>
              <th>New %</th>
              <th>Returning $ Share</th>
            </tr>
          </thead>
          <tbody>
            {cohort.map((r) => (
              <tr key={r.Year}>
                <td>{r.Year}</td>
                <td>{fmtNum(r.Donors)}</td>
                <td>{fmtNum(r.New)}</td>
                <td>{fmtPct((r.New / r.Donors) * 100)}</td>
                <td>{fmtPct((r.ReturningUSD / r.USD) * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
