"use client";

export default function StatusWrapper({ loading, error, children }) {
  if (error) {
    return (
      <div className="card">
        <h2>Couldn&apos;t load data</h2>
        <p style={{ color: "#8B3A3A" }}>{error}</p>
        <p className="card-sub">
          Make sure the data loader has been run (<code>npm run load-data</code>)
          and your Redis env vars are set in Vercel.
        </p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="card">
        <p className="card-sub">Loading…</p>
      </div>
    );
  }
  return children;
}
