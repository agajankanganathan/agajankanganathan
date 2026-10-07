// Extra sample data for the portal. Shared numbers (KPIs, drivers, menu, core reviews) come from @core.
import { REVIEWS as CORE_REVIEWS } from '@core/sample-data';
import type { Review } from '@core/types';

export type Category = 'Coffee' | 'Tea & other drinks' | 'Food' | 'Bakery';
export const CATEGORIES: Category[] = ['Coffee', 'Tea & other drinks', 'Food', 'Bakery'];

/** Category for the built-in menu items; items added in the portal store their own. */
export const ITEM_CATEGORY: Record<string, Category> = {
  'oat-latte': 'Coffee',
  'cold-brew': 'Coffee',
  matcha: 'Tea & other drinks',
  croissant: 'Bakery',
  'avo-toast': 'Food',
  'banana-bread': 'Bakery',
};

export type Member = {
  id: string;
  name: string;
  joinedMonthsAgo: number;
  visits30: number; // visits in the last 30 days
  usualGapDays: number; // typical days between visits
  lastVisitDays: number;
  lifetimeSpend: number;
  favourite: string;
  stamps: number;
};

/** A member is at risk when they've been away more than twice their usual gap (and at least 14 days). */
export const isAtRisk = (m: Member) => m.lastVisitDays >= Math.max(14, m.usualGapDays * 2);

export const cadence = (m: Member) =>
  m.usualGapDays <= 2 ? 'Daily regular' : m.usualGapDays <= 8 ? 'Weekly' : m.usualGapDays <= 16 ? 'Regular' : 'Occasional';

// The first four match the at-risk regulars in @core (same ids), so rewards sent anywhere line up.
export const MEMBERS: Member[] = [
  { id: 'maya', name: 'Maya R.', joinedMonthsAgo: 26, visits30: 2, usualGapDays: 1, lastVisitDays: 24, lifetimeSpend: 2140, favourite: 'Oat Latte', stamps: 7 },
  { id: 'jordan', name: 'Jordan T.', joinedMonthsAgo: 14, visits30: 1, usualGapDays: 7, lastVisitDays: 19, lifetimeSpend: 690, favourite: 'Cold Brew', stamps: 3 },
  { id: 'priya', name: 'Priya S.', joinedMonthsAgo: 19, visits30: 0, usualGapDays: 10, lastVisitDays: 31, lifetimeSpend: 820, favourite: 'Matcha Latte', stamps: 5 },
  { id: 'sam', name: 'Sam K.', joinedMonthsAgo: 9, visits30: 1, usualGapDays: 6, lastVisitDays: 22, lifetimeSpend: 410, favourite: 'Almond Croissant', stamps: 2 },
  { id: 'leo', name: 'Leo M.', joinedMonthsAgo: 31, visits30: 21, usualGapDays: 1, lastVisitDays: 0, lifetimeSpend: 3380, favourite: 'Oat Latte', stamps: 9 },
  { id: 'ava', name: 'Ava C.', joinedMonthsAgo: 12, visits30: 13, usualGapDays: 2, lastVisitDays: 1, lifetimeSpend: 1210, favourite: 'Cold Brew', stamps: 4 },
  { id: 'noah', name: 'Noah B.', joinedMonthsAgo: 7, visits30: 5, usualGapDays: 6, lastVisitDays: 3, lifetimeSpend: 380, favourite: 'Avocado Toast', stamps: 6 },
  { id: 'zara', name: 'Zara H.', joinedMonthsAgo: 22, visits30: 9, usualGapDays: 3, lastVisitDays: 2, lifetimeSpend: 1530, favourite: 'Matcha Latte', stamps: 1 },
  { id: 'ethan', name: 'Ethan W.', joinedMonthsAgo: 4, visits30: 4, usualGapDays: 7, lastVisitDays: 6, lifetimeSpend: 160, favourite: 'Banana Bread', stamps: 4 },
  { id: 'chloe', name: 'Chloe D.', joinedMonthsAgo: 16, visits30: 8, usualGapDays: 4, lastVisitDays: 4, lifetimeSpend: 940, favourite: 'Oat Latte', stamps: 8 },
  { id: 'omar', name: 'Omar F.', joinedMonthsAgo: 11, visits30: 2, usualGapDays: 12, lastVisitDays: 9, lifetimeSpend: 300, favourite: 'Cold Brew', stamps: 2 },
  { id: 'grace', name: 'Grace L.', joinedMonthsAgo: 28, visits30: 17, usualGapDays: 1, lastVisitDays: 1, lifetimeSpend: 2760, favourite: 'Almond Croissant', stamps: 0 },
  { id: 'ben', name: 'Ben A.', joinedMonthsAgo: 2, visits30: 3, usualGapDays: 9, lastVisitDays: 11, lifetimeSpend: 95, favourite: 'Avocado Toast', stamps: 3 },
  { id: 'isla', name: 'Isla P.', joinedMonthsAgo: 6, visits30: 6, usualGapDays: 5, lastVisitDays: 2, lifetimeSpend: 450, favourite: 'Matcha Latte', stamps: 6 },
  { id: 'kai', name: 'Kai N.', joinedMonthsAgo: 13, visits30: 0, usualGapDays: 14, lastVisitDays: 26, lifetimeSpend: 520, favourite: 'Oat Latte', stamps: 1 },
  { id: 'ruby', name: 'Ruby G.', joinedMonthsAgo: 18, visits30: 11, usualGapDays: 3, lastVisitDays: 0, lifetimeSpend: 1340, favourite: 'Cold Brew', stamps: 5 },
];

export type FullReview = Review & { daysAgo: number };

const CORE_DAYS: Record<string, number> = { marcus: 1, aisha: 2, hannah: 4 };

export const REVIEWS: FullReview[] = [
  ...CORE_REVIEWS.map((r) => ({ ...r, daysAgo: CORE_DAYS[r.id] ?? 3 })),
  {
    id: 'tom',
    author: 'Tom V.',
    source: 'Google',
    stars: 3,
    daysAgo: 5,
    text: 'Coffee is solid but there was nowhere to sit at lunch, so I took it to go.',
    replyBody: 'Lunchtime has been packed lately. You can now pre-order from 11am to skip the wait and grab it to go.',
  },
  {
    id: 'mei',
    author: 'Mei Y.',
    source: 'Instagram',
    stars: 5,
    daysAgo: 6,
    text: 'The new matcha latte is unreal 🍵 my new favourite spot.',
    replyBody: 'We’re thrilled you love the matcha! Next time, ask about our weekly special.',
  },
  {
    id: 'daniel',
    author: 'Daniel O.',
    source: 'Google',
    stars: 2,
    daysAgo: 8,
    text: 'Felt rushed at the counter on Saturday morning, barely got a hello.',
    replyBody: 'You deserve a proper welcome, busy morning or not. We’ve shared your note with the team and are adding a greeting routine for peak hours.',
  },
  {
    id: 'sofia',
    author: 'Sofia R.',
    source: 'Google',
    stars: 4,
    daysAgo: 11,
    text: 'Love the vibe. Would be great to see some new menu items, I always order the same thing.',
    replyBody: 'Great idea. We’re starting a weekly special so there’s always something new to try.',
  },
];

/** Evidence behind each "why customers leave" reason: weekly mentions (oldest first) and sample quotes. */
export const DRIVER_EVIDENCE: Record<string, { weekly: number[]; quotes: string[]; sources: string }> = {
  waits: {
    weekly: [9, 12, 15, 18],
    quotes: ['Waited almost 10 minutes for a cold brew…', 'Line out the door at 8:30, gave up.'],
    sources: '38 reviews · 212 visit patterns · 14 feedback forms',
  },
  portion: {
    weekly: [8, 9, 11, 13],
    quotes: ['Sandwiches feel small for the price.', 'Pricey for what you get at lunch.'],
    sources: '41 reviews · 9 feedback forms',
  },
  seats: {
    weekly: [5, 7, 6, 9],
    quotes: ['Nowhere to sit at lunch, so I took it to go.', 'Always full around noon.'],
    sources: '17 reviews · 96 visit patterns',
  },
  menu: {
    weekly: [4, 4, 6, 7],
    quotes: ['I always order the same thing.', 'Would love something new on the menu.'],
    sources: '21 reviews · 52% of repeat orders are 3 items',
  },
  welcome: {
    weekly: [2, 3, 2, 4],
    quotes: ['Barely got a hello.', 'Felt rushed at the counter.'],
    sources: '9 reviews',
  },
};

/** Plans from the agreed pricing (see the pricing discussion). */
export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    unit: '/month',
    features: ['Analytics dashboard', 'Menu management & margins', 'AI review replies (Google, 30/month)', 'Monthly insights summary', '1 team login'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 129,
    unit: '/month',
    features: ['Everything in Starter', 'Full AI Customer Insights', 'Smart Promotions', 'Loyalty & Rewards', 'Unlimited replies, all sources', '3 team logins'],
  },
  {
    id: 'multi',
    name: 'Multi-location',
    price: 99,
    unit: '/location/month',
    features: ['Everything in Growth', 'Compare locations', 'Unlimited logins with roles', 'Priority support & onboarding'],
  },
] as const;
