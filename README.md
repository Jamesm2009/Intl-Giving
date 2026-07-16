# International Giving Dashboard

Interactive dashboard for the 2020–2026 (H1) international giving transaction
data: Overview, Transactions, Regions, Year-on-Year, By Fund Code, By
Country, Retention, and Campaigns (the "Victorython" effect).

Built with Next.js (App Router), Recharts, and Upstash Redis. Deploys on
Vercel's free Hobby plan.

## How it's built

- **Data storage**: Redis (Upstash, via the Vercel Marketplace integration).
  One key holds all the pre-computed chart/table data (`kcm:dashboard`);
  the raw 62,541 transactions are stored chunked by year
  (`kcm:transactions:2020` … `kcm:transactions:2026`) so no single Redis
  value gets too large.
- **Password protection**: Vercel's native "Deployment Protection" password
  screen requires a Pro plan. Since you're on Hobby, this app implements its
  own: a `/login` page + `middleware.js` that gates every other route behind
  a signed cookie. Set the password once via the `DASHBOARD_PASSWORD`
  environment variable in Vercel — changing that variable instantly logs
  everyone out.
- **Charts**: Recharts (React charting library), all client-side.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — from your existing
  Upstash/Redis database. In Vercel: **Storage → (your Redis DB) → .env.local
  tab** has these ready to copy. (If Vercel labeled them
  `KV_REST_API_URL` / `KV_REST_API_TOKEN` instead, that's fine — the app
  reads either naming.)
- `DASHBOARD_PASSWORD` — any password you want to gate the site with.

## 2. Load the data into Redis

The `/data` folder in this repo already contains the pre-computed
aggregates (`dashboard_data.json`) and the raw transactions, chunked by
year (`data/transactions-by-year/transactions_2020.json`, etc.) — these
were exported from the underlying analysis.

Push them into your Redis database:

```bash
npm run load-data
```

You only need to re-run this if the underlying data changes — the site
reads live from Redis on every request (with a 60-second in-memory cache
per serverless instance), so you don't need to redeploy after a data
refresh, just re-run the loader.

## 3. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000` — you should hit the login page, then the
dashboard after entering `DASHBOARD_PASSWORD`.

## 4. Push to a new GitHub repo

```bash
git init
git add .
git commit -m "Initial dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first — "New repository", no README/license
so it stays empty — then run the commands above.)

## 5. Deploy to Vercel

1. Go to vercel.com → **Add New → Project** → import the GitHub repo you
   just pushed.
2. Before deploying, add environment variables (**Settings → Environment
   Variables**, or in the import screen):
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `DASHBOARD_PASSWORD`
   (If you already have the Upstash integration connected to this Vercel
   project, the Redis vars may already be populated automatically — check
   before re-adding them.)
3. Deploy. Framework preset should auto-detect "Next.js" — no build
   settings need changing.
4. Visit your `*.vercel.app` URL — you should see the login screen.

## Updating the password later

Change `DASHBOARD_PASSWORD` in Vercel's Environment Variables, then
redeploy (Vercel → Deployments → redeploy latest, or just push any commit).
Existing logged-in sessions are invalidated automatically because the
session cookie is signed with the password itself.

## Updating the underlying data later

Re-export new JSON into `/data`, run `npm run load-data` again (pointed at
your production Redis), and that's it — no redeploy needed since the app
reads from Redis at request time.

## Project structure

```
app/
  (dashboard)/          # all tabs, wrapped in shared nav chrome
    page.js             # Overview
    transactions/        # filterable raw transaction browser
    regions/             # regional comparison + all-in/adjusted toggle
    yoy/                 # year-on-year + mega-gift outliers
    fund-code/            # fund/program mix
    country/             # country rankings & trend
    retention/           # donor cohorts, concentration, regional retention
    campaigns/           # Victorython effect
  login/                 # password gate (outside the dashboard chrome)
  api/
    data/                # serves the aggregate JSON from Redis
    transactions/         # filtered/paginated raw transaction queries
    login/, logout/       # session cookie handling
lib/
  redis.js               # Upstash client + key names
  data.js                 # Redis read helpers (with light in-memory cache)
  auth.js                 # signed-cookie password gate logic
  hooks.js                 # client-side fetch hook + formatters
middleware.js             # enforces the password gate on every route
scripts/load-data.mjs     # one-time/as-needed Redis loader
data/                     # the JSON this loader reads
```

## Known caveats carried over from the analysis

- Fund-code entity split (KCM vs. EMIC) is inferred from project-code prefix
  (`C…` = EMIC, `K…`/`Y…` = KCM), validated against known totals but not an
  authoritative source mapping.
- The "Ukraine" region in the data includes Russia, Belarus, Kazakhstan,
  Georgia, and Uzbekistan, not Ukraine alone.
- KCM Australia/Canada/Europe/South Africa are internal batch/staff accounts,
  not individual donors — the Regions tab's "Adjusted" toggle backs the
  Australia batch and Europe one-offs out of the regional totals.
