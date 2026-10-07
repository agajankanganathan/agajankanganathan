# Sero app

The café owner's app: iOS and Android from one codebase (Expo / React Native), running on sample data.

## Run it on your phone

1. Install **Node.js** (LTS) on your computer: https://nodejs.org
2. Install **Expo Go** on your phone (App Store / Google Play).
3. In a terminal:
   ```sh
   cd sero/app
   npm install
   npx expo start
   ```
4. Scan the QR code: with the Camera app on iPhone, or from inside Expo Go on Android.
   Your phone and computer need to be on the same Wi-Fi. If they can't see each other, run `npx expo start --tunnel`.

Press `w` in the terminal to open a browser preview instead.

## What's in it

Five tabs, covering all six Sero modules:

| Tab | Modules |
|---|---|
| **Today** | Analytics dashboard: KPIs, revenue chart, "needs your attention" shortcuts |
| **Insights** | AI Customer Insights: why customers leave, suggested fixes, customer journey |
| **Grow** | Smart Promotions and Loyalty & Rewards |
| **Menu** | Menu Management: margin is calculated from price and cost; tap an item to edit them |
| **Reviews** | AI-generated responses in Warm / Professional / Short tones |

Changes carry across the app (e.g. sending a reward lowers the "Regulars at risk" count and tab badge).
State resets when the app restarts. There's no backend yet.

## Code layout

- `src/core/`: business logic and sample data in plain TypeScript, with no UI code. The future web dashboard
  reuses this as-is. Margin maths is in `logic.ts` (`marginPct`).
- `src/state/store.tsx`: app-wide state (what's toggled, sent, posted, edited).
- `src/app/`: screens (Expo Router: every file is a route). `(tabs)/_layout.tsx` is the native tab bar;
  `_layout.web.tsx` is the browser version.
- `src/components/ui.tsx`: shared building blocks (text styles, cards, buttons, switches).
- `src/constants/theme.ts`: brand colours and fonts.

## Checks

```sh
npx tsc --noEmit   # typecheck
npx expo lint      # lint
npx expo-doctor    # dependency / config health
```

## Before the App Store

- Font: Inter Tight stands in for Articulat CF. Swap in the licensed font in `src/app/_layout.tsx` and `theme.ts`.
- `com.sero.app` in `app.json` is a placeholder bundle ID; pick one you own.
- Real data, accounts and saving need a backend (next phase). Builds and store submission go through EAS:
  https://docs.expo.dev/eas/
