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

**New-user help**
- A guided tour (11 steps) starts on first sign-in. It spotlights each part of the app and moves between pages.
  Replay it from Help, Settings or the account menu.
- A "Getting started" checklist on the Overview ticks itself off as you use each feature.
- A Help & guides page with step-by-step guides, an FAQ, keyboard shortcuts and a glossary.
- ⓘ explanations on every key number.

**Pages**

| Page | What you can do |
|---|---|
| **Overview** | KPIs with trend lines (7 or 30 days), revenue chart, "needs your attention", biggest opportunity, top earners, checklist, recent activity |
| **Customer insights** | Reasons customers leave, ranked; for each: mentions per week, guest quotes, data sources and a suggested fix; customer journey |
| **Promotions** | Running/paused filters; create targeted promotions with a live weekly-lift estimate; pause or delete |
| **Loyalty & members** | Searchable member list with at-risk and regulars filters; member profile with habits, stamp card and Send reward |
| **Menu** | Costs come from recipes; click an item to open its recipe builder (templates, batch recipes, live margin and suggested price); target margin; categories, search, sorting, totals; sold-out switch; add items |
| **Ingredients & costs** | Enter ingredients as bought in bulk (e.g. 12 × 1 L for $43.20) plus waste %; real cost per kg / L / each; edit pack prices inline; supplier price-rise alerts with one-click suggested prices; invoice scan (demo) |
| **Reviews** | Rating and response-rate stats; filter by status and source; reply composer with tone choice, regenerate and post |
| **Help & guides** | Tour, how-to guides, FAQ, shortcuts, glossary |
| **Settings** | Café details, theme, team, connected sources, plan & billing (Starter $49 / Growth $129 / Multi-location $99 per location), reset demo data |

Also: ⌘K (Ctrl+K) quick search, a notifications menu, an account menu, light/dark themes, and a phone-friendly layout.

Everything you change is saved in your browser (localStorage), so a demo survives a refresh.
**Settings → Reset demo data** starts fresh. Nothing is sent anywhere, and there's no backend yet.

## Code layout

- `src/pages/`: one file per page.
- `src/components/`: app shell (sidebar), the revenue chart, and small UI pieces.
- `src/state/store.tsx`: all app state, saved to localStorage.
- `src/lib/costing.ts`: recipe costing (unit conversion, waste, batch recipes, suggested prices).
- `src/lib/ingredients.ts`: sample ingredients, recipes, starter templates and the sample invoice.
- `src/lib/promos.ts`: audiences and the promotion lift estimate.
- `src/lib/sample.ts`: portal-only sample data (members, extra reviews, insight evidence, plans).
- `src/components/Tour.tsx`: the guided tour steps; edit `TOUR_STEPS` to change the wording.
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
