// Sample data for a fictional café, matching the website demo.
// Replace with API data once the backend exists.
import type { Driver, FunnelStep, Member, MenuItem, Promo, RangeData, RangeKey, Review } from './types';

export const CAFE_NAME = 'Corner Café';

export const RANGES: Record<RangeKey, RangeData> = {
  '7d': {
    bars: [980, 1120, 1040, 1260, 1390, 1610, 1020],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    kpis: [
      { label: 'Revenue', value: '$8,420', delta: '+6% vs last week', good: true },
      { label: 'Customers', value: '1,284', delta: '+4%', good: true },
      { label: 'Return rate', value: '38%', delta: '+3 pts', good: true },
      { label: 'Revenue at risk', value: '$1,150', delta: '−9%', good: true },
    ],
  },
  '30d': {
    bars: [6900, 7400, 7850, 8420],
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    kpis: [
      { label: 'Revenue', value: '$30,570', delta: '+11% vs last month', good: true },
      { label: 'Customers', value: '4,960', delta: '+7%', good: true },
      { label: 'Return rate', value: '36%', delta: '+5 pts', good: true },
      { label: 'Revenue at risk', value: '$4,380', delta: '−14%', good: true },
    ],
  },
};

export const DRIVERS: Driver[] = [
  {
    id: 'waits',
    name: 'Long waits at morning peak',
    share: 34,
    detail:
      'Orders placed between 8 and 10am wait over 6 minutes on average. Guests who wait that long are 18% less likely to come back.',
    fix: 'Add a second barista from 8 to 10am.',
  },
  {
    id: 'portion',
    name: 'Price vs. portion',
    share: 22,
    detail: '“Small for the price” came up 41 times in reviews this month, mostly about sandwiches.',
    fix: 'Bundle a sandwich with a drink at a small discount.',
    action: { module: 'promos', label: 'Set up a bundle offer' },
  },
  {
    id: 'seats',
    name: 'No seats at lunch',
    share: 18,
    detail: 'Lunch visits drop on days the café is more than 85% full.',
    fix: 'Push takeaway at lunch with a pre-order offer.',
    action: { module: 'promos', label: 'See lunch offers' },
  },
  {
    id: 'menu',
    name: 'Same menu every visit',
    share: 14,
    detail: 'Three items make up 52% of repeat orders. Regulars say they “always get the same thing”.',
    fix: 'Rotate a weekly special.',
    action: { module: 'menu', label: 'Open the menu' },
  },
  {
    id: 'welcome',
    name: 'Rushed welcome',
    share: 12,
    detail: 'Mostly positive, but 9 reviews mention a rushed hello at busy times.',
    fix: 'Share a quick greeting routine with the morning team.',
  },
];

export const FUNNEL: FunnelStep[] = [
  { label: 'Discovered you', count: 3200 },
  { label: 'First visit', count: 1284 },
  { label: 'Came back within 30 days', count: 488 },
  { label: 'Became a regular', count: 211 },
];

export const PROMOS: Promo[] = [
  { id: 'winback', name: 'Win-back: 20% off', audience: '212 guests away for 30+ days', weeklyLift: 640, on: true },
  { id: 'rainy', name: 'Rainy-day latte + pastry', audience: 'Runs when rain is forecast', weeklyLift: 310, on: true },
  { id: 'pastry', name: '2-for-1 pastries, 2–4pm', audience: 'Everyone, weekdays', weeklyLift: 420, on: false },
  { id: 'bundle', name: 'Sandwich + drink bundle', audience: 'Lunch, 11am–2pm', weeklyLift: 380, on: false },
  { id: 'birthday', name: 'Birthday drink on us', audience: '38 members this month', weeklyLift: 190, on: true },
];

export const LOYALTY = { members: 642, visitsThisMonth: 1930, rewardsRedeemed: 87, stampsForReward: 10 };

export const AT_RISK: Member[] = [
  { id: 'maya', name: 'Maya R.', cadence: 'Daily regular', daysAway: 24 },
  { id: 'jordan', name: 'Jordan T.', cadence: 'Weekly', daysAway: 19 },
  { id: 'priya', name: 'Priya S.', cadence: 'Regular', daysAway: 31 },
  { id: 'sam', name: 'Sam K.', cadence: 'Weekly', daysAway: 22 },
];

// Prices and costs are chosen so margins match the website demo (72%, 78%, 69%, 58%, 34%, 64%).
export const MENU: MenuItem[] = [
  { id: 'oat-latte', name: 'Oat Latte', price: 5.5, cost: 1.54, sold: 412, trend: 8, available: true },
  { id: 'cold-brew', name: 'Cold Brew', price: 5.0, cost: 1.1, sold: 268, trend: -3, available: true },
  { id: 'matcha', name: 'Matcha Latte', price: 6.0, cost: 1.86, sold: 194, trend: 24, available: true },
  { id: 'croissant', name: 'Almond Croissant', price: 4.75, cost: 2.0, sold: 231, trend: 5, available: true },
  { id: 'avo-toast', name: 'Avocado Toast', price: 12.0, cost: 7.92, sold: 122, trend: -11, available: true },
  { id: 'banana-bread', name: 'Banana Bread', price: 3.75, cost: 1.35, sold: 96, trend: 2, available: false },
];

export const REVIEWS: Review[] = [
  {
    id: 'marcus',
    author: 'Marcus D.',
    source: 'Google',
    stars: 2,
    text: 'Waited almost 10 minutes for a cold brew on a weekday morning. Coffee was good but I was late for work.',
    replyBody:
      'We’re sorry about the wait. Mornings have been busy, so we’re adding a second barista from 8 to 10am to keep the line moving.',
  },
  {
    id: 'aisha',
    author: 'Aisha K.',
    source: 'Instagram',
    stars: 4,
    text: 'Lovely space and great coffee, but the sandwiches feel small for the price.',
    replyBody:
      'Thank you for the honest feedback on our sandwiches. We’re trying a sandwich and drink bundle so lunch feels like better value.',
  },
  {
    id: 'hannah',
    author: 'Hannah L.',
    source: 'Google',
    stars: 5,
    text: 'Best oat latte in the neighbourhood, and the staff remembered my name!',
    replyBody: 'We’re so happy the oat latte hit the spot, and the team loved reading that they made you feel at home.',
  },
];
