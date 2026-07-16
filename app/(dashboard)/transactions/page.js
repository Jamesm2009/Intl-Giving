"use client";

import { useEffect, useState } from "react";
import { fmtUSD } from "@/lib/hooks";

const YEARS = ["all", 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const REGIONS = ["all", "Africa", "Australasia", "Canada", "Europe", "LATAM", "Ukraine"];

export default function TransactionsPage() {
  const [year, setYear] = useState("all");
  const [region, setRegion] = useState("all");
  const [q, setQ] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      year: String(year),
      region: String(region),
      q,
      minAmount,
      page: String(page),
      pageSize: "50",
    });
    fetch(`/api/transactions?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        setResult(json);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [year, region, q, minAmount, page]);

  function resetPageAnd(setter) {
    return (v) => {
      setPage(1);
      setter(v);
    };
  }

  return (
    <div className="card">
      <h2>Transaction Browser</h2>
      <div className="card-sub">
        Filter the raw transaction-level data (2020&ndash;2026 H1, 62,541 rows).
      </div>

      <div className="controls-row">
        <select value={year} onChange={(e) => resetPageAnd(setYear)(e.target.value)}>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y === "all" ? "All years" : y}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => resetPageAnd(setRegion)(e.target.value)}>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r === "all" ? "All regions" : r}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search org / country / fund code…"
          value={q}
          onChange={(e) => resetPageAnd(setQ)(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <input
          type="number"
          placeholder="Min amount ($)"
          value={minAmount}
          onChange={(e) => resetPageAnd(setMinAmount)(e.target.value)}
          style={{ width: 130 }}
        />
      </div>

      {error && <p style={{ color: "#8B3A3A" }}>{error}</p>}
      {loading && !result && <p className="card-sub">Loading…</p>}

      {result && !result.error && (
        <>
          <p className="card-sub">
            {result.total.toLocaleString()} matching transactions &middot;{" "}
            {fmtUSD(result.totalAmount)} total
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Region</th>
                  <th>Country</th>
                  <th>Org</th>
                  <th>Fund Code</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.region}</td>
                    <td>{r.country}</td>
                    <td>{r.org || "—"}</td>
                    <td>{r.fundCode}</td>
                    <td>{fmtUSD(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            <button
              disabled={page >= result.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {result?.error && (
        <p style={{ color: "#8B3A3A" }}>{result.error}</p>
      )}
    </div>
  );
}
