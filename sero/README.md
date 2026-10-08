# Sero: project brief

Everything about Sero from the case study on my portfolio site (agajankanganathan.com, `#sero` section),
pulled into one place as the starting point for the real website and app.

## What Sero is

An **AI customer-intelligence platform for independent cafés**. It shows owners where they're losing
customers and how to win them back.

- **Headline:** "Find why your cafe customers leave and *win* them back."
- **Subhead:** AI Customer Intelligence for cafes that pinpoints where you're losing money in the customer
  experience journey, reveals revenue risk, and drives growth.
- **Primary CTA:** Book a Demo
- **Modules section:** "Sero doesn't just manage your cafe, It *grows* it." / 6 Modules in 1 Platform. Smarter Cafes.
- **Dashboard section:** "All your cafe data. *One* dashboard. *Zero* blind spots." / AI-built for independent
  cafes, turning scattered customer signals into revenue you can actually see. CTAs: Try the dashboard ↓, Book a Demo
- **Site nav:** Home · Modules · Dashboard · Book a Demo (plus a light/dark mode switch)

## Brand identity: "Warm, calm and confident"

A café-inspired palette of mahogany, chocolate and linen, set in Articulat CF, a modern take on Swiss
typography. The symbol works on its own, beside the wordmark, and as an app icon in light, dark and
alternative versions.

| Name            | Hex       | RGB            |
|-----------------|-----------|----------------|
| Black           | `#010001` | 1 · 0 · 1      |
| Linen           | `#FFF5EB` | 255 · 245 · 235|
| Rich Mahogany   | `#2B0504` | 43 · 5 · 4     |
| Chocolate Brown | `#A34C00` | 163 · 76 · 0   |

- **Typeface:** Articulat CF (light, normal, medium, bold). It's a commercial font from Connary Fagen, so
  you'll need a web licence for the site and an app licence for the mobile app.
- **Background treatment:** grainy radial gradients mixing mahogany, chocolate and a white/linen glow
  (see `brand/sero_cover.jpg`, `brand/sero_glow.jpg`).

### Assets in `brand/`

| File | What it is |
|---|---|
| `sero_cover.jpg` | Logo + wordmark on the gradient (1600×900) |
| `sero_logo.png` | Transparent logo lockup, 900×319. Use as a mask/silhouette |
| `sero_type.jpg` | Typography sheet: Articulat CF |
| `sero_mark.jpg` | Symbol colour variations |
| `sero_word.jpg` | Wordmark colour variations |
| `sero_icons.jpg` | App icons: light, dark, chocolate, gradient |
| `sero_photo_m.jpg` / `sero_photo_d.jpg` | Café interior hero photo (mobile / desktop crops) |
| `sero_glow.jpg` | Gradient glow background |

These are the web-optimised exports embedded in the portfolio. For production (app icons especially) you'll
want the original vector/high-res source files.

## The six modules

Each module solves one problem independent cafés face, and they all feed the same dashboard.

| # | Module | The problem | What it does | In the dashboard |
|---|---|---|---|---|
| 01 | **AI Customer Insights** | Most cafés only find out why a customer stopped coming when they read a bad review, if they find out at all. | Reads reviews, visit patterns and feedback together, ranks the reasons guests don't come back and suggests a fix for each. | A ranked "why customers leave" list with an AI insight for each reason, plus the customer journey from first visit to regular. |
| 02 | **Smart Promotions** | Blanket discounts give money away to people who would have come in anyway. | Suggests targeted offers for specific groups (e.g. guests away 30 days) or triggers (e.g. a rainy morning). | Each offer shows who it reaches and its projected weekly lift. Toggle on/off and totals update. |
| 03 | **Loyalty & Rewards** | Paper stamp cards can't tell you who your regulars are, or when they stop coming. | A digital stamp card and member list that flags regulars who are drifting away. | Member stats, a live stamp card and an "at risk" list with one-tap Send reward. |
| 04 | **Menu Management** | On a till report, best-sellers and money-losers look the same. | Tracks every item's sales, margin and trend; staff can mark items sold out in seconds. | Menu table with on/off switches per item and an AI tip on what to feature or re-price. |
| 05 | **AI-generated response** | Replying to every review takes time owners don't have. | Drafts an on-brand reply to each review in the chosen tone. | Review inbox: pick a review, choose Warm / Professional / Short, regenerate, post. |
| 06 | **Analytics Dashboard** | Sales, reviews and loyalty data live in apps that don't talk to each other. | Brings every module into one home screen: revenue, customers, return rate, revenue at risk. | Weekly/monthly views, tap-to-read revenue chart, shortcuts into the other five modules. |

## Dashboard sample data (from the prototype)

This is the data model the prototype runs on, which maps to what the real app's API will need to return.
Full source in `prototype/sero-prototype.js`.

- **Analytics, 7 days:** Revenue $8,420 (+6%), Customers 1,284 (+4%), Return rate 38% (+3 pts),
  Revenue at risk $1,150 (−9%). Daily bars Mon–Sun.
- **Analytics, 30 days:** Revenue $30,570 (+11%), Customers 4,960 (+7%), Return rate 36% (+5 pts),
  Revenue at risk $4,380 (−14%). Weekly bars.
- **Why customers leave (drivers):** Long waits at morning peak 34% · Price vs. portion 22% ·
  No seats at lunch 18% · Same menu every visit 14% · Rushed welcome 12%. Each has an explanation,
  a suggested fix and an optional deep-link into another module.
- **Customer journey funnel:** Discovered you 3,200 → First visit 1,284 → Came back within 30 days 488 →
  Became a regular 211.
- **Promotions:** Win-back 20% off · Rainy-day latte + pastry · 2-for-1 pastries 2–4pm ·
  Sandwich + drink bundle · Birthday drink on us (each with audience, weekly lift and on/off state).
- **Loyalty at-risk list:** member name + cadence + days since last visit.
- **Menu:** item, units sold, margin %, trend %, available toggle.
- **Reviews:** author, source (Google / Instagram), stars, text, plus AI reply generated from tone-specific
  openers and closers.
- **Dashboard nav order:** Analytics, Insights, Promotions, Loyalty, Menu, Responses.

## Website

The marketing site is in `website/` (see `website/README.md`).

## Portal (web app for clients)

The dashboard café owners sign in to is in `portal/` (see `portal/README.md`).

## App

The iOS/Android app is in `app/` (see `app/README.md`).

## Prototype source in `prototype/`

- `sero-section.html`: the case-study markup, including the mobile and desktop interactive prototypes
  (hero → modules → dashboard → live app screens). Images are referenced by `data-img` / `data-bg` keys
  that match the filenames in `brand/`.
- `sero-prototype.js`: sample data plus all prototype behaviour (screen navigation, light/dark, menu,
  the six dashboard panes and their interactions).
- `sero-prototype.css`: all Sero-specific styles, including the dashboard UI components.

These were written for a portfolio demo, not production. Use them as a spec and visual reference, not as
the app's codebase.
