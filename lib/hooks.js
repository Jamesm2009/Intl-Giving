"use client";

import { useEffect, useState } from "react";

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((e) => setError(e.message));
  }, []);

  return { data, error, loading: !data && !error };
}

export function fmtUSD(n) {
  if (n == null || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function fmtNum(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function fmtPct(n, digits = 1) {
  if (n == null || isNaN(n)) return "—";
  return n.toFixed(digits) + "%";
}
