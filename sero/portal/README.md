# Sero portal

The web app café owners sign in to: the full Sero dashboard, running on sample data.

## Run it

Needs Node.js (LTS) from https://nodejs.org.

```sh
cd sero/portal
npm install
npm run dev        # then open http://localhost:5173
```

On the sign-in screen, click **Explore the demo café**, or type any email and password.

## What's in it

| Page | What you can do |
|---|---|
| **Overview** | KPIs for 7 or 30 days, revenue chart (hover a bar), "needs your attention", biggest opportunity |
| **Customer insights** | Why customers leave, ranked; AI insight and suggested fix for each; customer journey |
| **Promotions** | Switch offers on/off, create a new targeted promotion with a live weekly-lift estimate, delete your own |
| **Loyalty** | Members and visits, send rewards to regulars at risk, stamp card |
| **Menu** | Edit price and cost inline and the margin recalculates; sort any column; mark items sold out; add items |
| **Reviews** | Review inbox; draft replies in Warm / Professional / Short, edit, regenerate, post |
| **Settings** | Café name and address, light/dark/system theme, connected sources (coming with real accounts), reset demo data |

Everything you change is saved in your browser (localStorage), so a demo survives a refresh.
**Settings → Reset demo data** starts fresh. Nothing is sent anywhere, and there's no backend yet.

## Code layout

- `src/pages/`: one file per page.
- `src/components/`: app shell (sidebar), the revenue chart, and small UI pieces.
- `src/state/store.tsx`: all app state, saved to localStorage.
- `src/lib/promos.ts`: audiences and the promotion lift estimate.
- `@core/*`: business logic and sample data shared with the phone app (`sero/app/src/core`).
  Margin maths, reply drafting and sample numbers live there, so both apps agree.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

## Next: real accounts and data

Replace the demo sign-in and localStorage with a backend (e.g. Supabase: auth plus a Postgres database).
Each café's menu, promotions, members and reviews then load from the database, and the Settings
"Connect" buttons become real integrations (Google reviews, Instagram, point of sale).
