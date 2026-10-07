// Domain types shared by the phone app and (later) the web dashboard.
// Nothing in src/core imports React or React Native.

export type RangeKey = '7d' | '30d';

export type Kpi = { label: string; value: string; delta: string; good: boolean };

export type RangeData = { bars: number[]; labels: string[]; kpis: Kpi[] };

export type ModuleKey = 'insights' | 'promos' | 'loyalty' | 'menu' | 'reviews';

export type Driver = {
  id: string;
  name: string;
  share: number; // % of lost visits attributed to this reason
  detail: string;
  fix: string;
  action?: { module: ModuleKey; label: string };
};

export type FunnelStep = { label: string; count: number };

export type Promo = {
  id: string;
  name: string;
  audience: string;
  weeklyLift: number; // projected extra revenue per week, in dollars
  on: boolean;
};

export type Member = { id: string; name: string; cadence: string; daysAway: number };

export type MenuItem = {
  id: string;
  name: string;
  price: number; // selling price, dollars
  cost: number; // ingredients + packaging per item, dollars
  sold: number; // units this week
  trend: number; // % change vs last week
  available: boolean;
};

export type Tone = 'warm' | 'professional' | 'short';

export type Review = {
  id: string;
  author: string;
  source: 'Google' | 'Instagram';
  stars: number;
  text: string;
  replyBody: string; // the substance of the suggested reply, wrapped in a tone-specific opener/closer
};
