// Pure business logic. Keep this free of UI code so the web dashboard can reuse it.
import type { MenuItem, Promo, Review, Tone } from './types';

/** Gross margin as a percentage of selling price: (price − cost) ÷ price × 100. */
export function marginPct(price: number, cost: number): number {
  if (!(price > 0)) return 0;
  return ((price - cost) / price) * 100;
}

/** Profit per item in dollars. */
export function profitPerItem(item: Pick<MenuItem, 'price' | 'cost'>): number {
  return item.price - item.cost;
}

/** Gross profit this week across the units sold. */
export function weeklyProfit(item: Pick<MenuItem, 'price' | 'cost' | 'sold'>): number {
  return profitPerItem(item) * item.sold;
}

export type MarginBand = 'healthy' | 'ok' | 'low';

/** Rough café benchmarks: drinks usually run 70%+, food 55%+. Below 45% deserves a look. */
export function marginBand(pct: number): MarginBand {
  if (pct >= 65) return 'healthy';
  if (pct >= 45) return 'ok';
  return 'low';
}

/** A one-line AI-style tip for the menu, derived from the data rather than hard-coded. */
export function menuTip(items: MenuItem[]): string | null {
  const live = items.filter((i) => i.available);
  if (live.length === 0) return null;
  const rising = [...live].sort((a, b) => b.trend - a.trend)[0];
  const weakest = [...live].sort((a, b) => marginPct(a.price, a.cost) - marginPct(b.price, b.cost))[0];
  const parts: string[] = [];
  if (rising.trend > 10) parts.push(`${rising.name} is up ${rising.trend}% this week, so feature it in a promotion.`);
  const wm = Math.round(marginPct(weakest.price, weakest.cost));
  if (marginBand(wm) === 'low') {
    parts.push(
      `${weakest.name} has the lowest margin (${wm}%)${weakest.trend < 0 ? ` and is down ${Math.abs(weakest.trend)}%` : ''}, so review its price or recipe cost.`
    );
  }
  return parts.length ? parts.join(' ') : null;
}

export function projectedLift(promos: Promo[]): number {
  return promos.reduce((total, p) => total + (p.on ? p.weeklyLift : 0), 0);
}

const OPENERS: Record<Tone, [string, string]> = {
  warm: ['Hi {n}, thank you for taking the time to write.', 'Hey {n}, thanks so much for visiting.'],
  professional: ['Dear {n}, thank you for your review.', 'Hello {n}, we appreciate your feedback.'],
  short: ['Thanks, {n}!', 'Hi {n},'],
};
const CLOSERS: Record<Tone, string> = {
  warm: ' Hope to see you again soon.',
  professional: ' We look forward to welcoming you back.',
  short: ' – The team',
};

/** Draft a reply. `variant` cycles through alternative openers (the "Regenerate" button). */
export function draftReply(review: Review, tone: Tone, variant = 0): string {
  const first = review.author.split(' ')[0];
  const opener = OPENERS[tone][variant % OPENERS[tone].length].replace('{n}', first);
  return `${opener} ${review.replyBody}${CLOSERS[tone]}`;
}

export function money(n: number, cents = false): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

/** Parse a user-typed dollar amount like "$5.50" or "5,5". Returns NaN when it isn't a number. */
export function parseMoney(text: string): number {
  const cleaned = text.replace(/[$\s]/g, '').replace(',', '.');
  return cleaned === '' ? NaN : Number(cleaned);
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
