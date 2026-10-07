// Portal-only helpers for creating promotions. Shared maths lives in @core/logic.

export type Audience = { id: string; label: string; size: number; visitRate: number };

/** Customer groups an offer can target, with sample sizes and how often a targeted guest typically comes in. */
export const AUDIENCES: Audience[] = [
  { id: 'lapsed', label: 'Guests away for 30+ days', size: 212, visitRate: 0.18 },
  { id: 'regulars', label: 'Regulars (4+ visits / month)', size: 211, visitRate: 0.6 },
  { id: 'new', label: 'First-time visitors this month', size: 796, visitRate: 0.12 },
  { id: 'members', label: 'All loyalty members', size: 642, visitRate: 0.3 },
  { id: 'everyone', label: 'Everyone', size: 1284, visitRate: 0.1 },
];

export const AVG_TICKET = 11.4; // sample average spend per visit, dollars

/**
 * Rough projected extra revenue per week:
 * guests reached × chance they come in because of the offer × average spend × (1 − discount).
 */
export function estimateWeeklyLift(audience: Audience, discountPct: number): number {
  const d = Math.min(Math.max(discountPct, 0), 100) / 100;
  // Bigger discounts pull more people in, with diminishing returns.
  const uplift = audience.visitRate * (0.6 + Math.sqrt(d));
  return Math.round(audience.size * uplift * AVG_TICKET * (1 - d));
}
