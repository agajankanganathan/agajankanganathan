// Sample ingredient library, recipes, starter templates and a sample supplier invoice.
// Recipe costs are tuned to match the original sample margins (Oat Latte 72%, Cold Brew 78%, …).
import type { Ingredient, Recipe, RecipeLine } from './costing';

const DAY = 86_400_000;
const ago = (days: number) => Date.now() - days * DAY;
const hist = (...prices: number[]) => prices.map((price, i) => ({ at: ago((prices.length - 1 - i) * 30 + 2), price }));

export const INGREDIENT_GROUPS = ['Coffee & tea', 'Milk & dairy', 'Bakery & produce', 'Pantry', 'Packaging'];

export const SAMPLE_INGREDIENTS: Ingredient[] = [
  { id: 'beans', name: 'Espresso beans', supplier: 'Pilot Coffee Roasters', group: 'Coffee & tea', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 32, wastePct: 0, history: hist(29.5, 31, 32) },
  { id: 'coldbrew-beans', name: 'Cold brew coffee (coarse)', supplier: 'Pilot Coffee Roasters', group: 'Coffee & tea', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 28, wastePct: 0, history: hist(28, 28) },
  { id: 'matcha', name: 'Ceremonial matcha', supplier: 'Tea Leaf Co.', group: 'Coffee & tea', packCount: 1, packSize: 100, packUnit: 'g', packPrice: 28, wastePct: 0, history: hist(24, 26, 28) },
  { id: 'oat', name: 'Oat milk (barista)', supplier: 'GFS', group: 'Milk & dairy', packCount: 12, packSize: 1, packUnit: 'L', packPrice: 43.2, wastePct: 5, history: hist(41.4, 43.2) },
  { id: 'milk', name: 'Whole milk', supplier: 'GFS', group: 'Milk & dairy', packCount: 1, packSize: 4, packUnit: 'L', packPrice: 6.2, wastePct: 5, history: hist(5.9, 6.2) },
  { id: 'butter', name: 'Butter (unsalted)', supplier: 'GFS', group: 'Milk & dairy', packCount: 1, packSize: 454, packUnit: 'g', packPrice: 6.5, wastePct: 0, history: hist(6.5) },
  { id: 'feta', name: 'Feta', supplier: 'GFS', group: 'Milk & dairy', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 16, wastePct: 0, history: hist(16) },
  { id: 'eggs', name: 'Eggs (free range)', supplier: 'GFS', group: 'Milk & dairy', packCount: 1, packSize: 180, packUnit: 'each', packPrice: 54, wastePct: 0, history: hist(49, 54) },
  { id: 'croissant', name: 'Croissants (par-baked)', supplier: 'Bread & Butter Bakery', group: 'Bakery & produce', packCount: 24, packSize: 1, packUnit: 'each', packPrice: 42.24, wastePct: 0, history: hist(40.8, 42.24) },
  { id: 'sourdough', name: 'Sourdough (14 slices / loaf)', supplier: 'Bread & Butter Bakery', group: 'Bakery & produce', packCount: 6, packSize: 14, packUnit: 'each', packPrice: 39, wastePct: 0, history: hist(39) },
  { id: 'avocado', name: 'Avocados', supplier: 'Fresh Start Produce', group: 'Bakery & produce', packCount: 48, packSize: 1, packUnit: 'each', packPrice: 62, wastePct: 30, history: hist(54, 58, 62) },
  { id: 'bananas', name: 'Bananas', supplier: 'Fresh Start Produce', group: 'Bakery & produce', packCount: 1, packSize: 100, packUnit: 'each', packPrice: 25, wastePct: 10, history: hist(25) },
  { id: 'salmon', name: 'Smoked salmon', supplier: 'GFS', group: 'Bakery & produce', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 42, wastePct: 0, history: hist(38, 42) },
  { id: 'garnish', name: 'Microgreens & seasoning', supplier: 'Fresh Start Produce', group: 'Bakery & produce', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 30, wastePct: 0, history: hist(30) },
  { id: 'vanilla', name: 'Vanilla syrup', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 750, packUnit: 'ml', packPrice: 9.75, wastePct: 0, history: hist(9.75) },
  { id: 'almond', name: 'Almond flakes', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 18, wastePct: 0, history: hist(18) },
  { id: 'flour', name: 'Flour (all-purpose)', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 10, packUnit: 'kg', packPrice: 18, wastePct: 0, history: hist(18) },
  { id: 'sugar', name: 'Sugar', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 2, packUnit: 'kg', packPrice: 5, wastePct: 0, history: hist(5) },
  { id: 'choc', name: 'Chocolate chips', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 2, packUnit: 'kg', packPrice: 30, wastePct: 0, history: hist(30) },
  { id: 'walnuts', name: 'Walnuts', supplier: 'GFS', group: 'Pantry', packCount: 1, packSize: 1, packUnit: 'kg', packPrice: 24, wastePct: 0, history: hist(22, 24) },
  { id: 'cup12', name: '12 oz hot cup + lid', supplier: 'EcoPack', group: 'Packaging', packCount: 1, packSize: 1000, packUnit: 'each', packPrice: 120, wastePct: 0, history: hist(120) },
  { id: 'cup16', name: '16 oz cold cup + lid', supplier: 'EcoPack', group: 'Packaging', packCount: 1, packSize: 1000, packUnit: 'each', packPrice: 140, wastePct: 0, history: hist(140) },
  { id: 'bag', name: 'Pastry bag', supplier: 'EcoPack', group: 'Packaging', packCount: 1, packSize: 500, packUnit: 'each', packPrice: 30, wastePct: 0, history: hist(30) },
];

export const SAMPLE_RECIPES: Record<string, Recipe> = {
  'oat-latte': {
    portions: 1,
    lines: [
      { ingredientId: 'beans', qty: 18, unit: 'g' },
      { ingredientId: 'oat', qty: 220, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  'cold-brew': {
    portions: 1,
    lines: [
      { ingredientId: 'coldbrew-beans', qty: 34, unit: 'g' },
      { ingredientId: 'cup16', qty: 1, unit: 'each' },
    ],
  },
  matcha: {
    portions: 1,
    lines: [
      { ingredientId: 'matcha', qty: 4, unit: 'g' },
      { ingredientId: 'milk', qty: 220, unit: 'ml' },
      { ingredientId: 'vanilla', qty: 20, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  croissant: {
    portions: 1,
    lines: [
      { ingredientId: 'croissant', qty: 1, unit: 'each' },
      { ingredientId: 'almond', qty: 10, unit: 'g' },
      { ingredientId: 'bag', qty: 1, unit: 'each' },
    ],
  },
  'avo-toast': {
    portions: 1,
    lines: [
      { ingredientId: 'avocado', qty: 1.5, unit: 'each' },
      { ingredientId: 'sourdough', qty: 2, unit: 'each' },
      { ingredientId: 'feta', qty: 50, unit: 'g' },
      { ingredientId: 'eggs', qty: 2, unit: 'each' },
      { ingredientId: 'salmon', qty: 60, unit: 'g' },
      { ingredientId: 'garnish', qty: 10, unit: 'g' },
    ],
  },
  'banana-bread': {
    portions: 8,
    lines: [
      { ingredientId: 'flour', qty: 250, unit: 'g' },
      { ingredientId: 'sugar', qty: 150, unit: 'g' },
      { ingredientId: 'bananas', qty: 3, unit: 'each' },
      { ingredientId: 'butter', qty: 115, unit: 'g' },
      { ingredientId: 'eggs', qty: 2, unit: 'each' },
      { ingredientId: 'choc', qty: 200, unit: 'g' },
      { ingredientId: 'walnuts', qty: 150, unit: 'g' },
      { ingredientId: 'bag', qty: 8, unit: 'each' },
    ],
  },
};

/** Starter recipes with typical café quantities. Lines whose ingredient isn't in the library are skipped. */
export const TEMPLATES: { id: string; name: string; note: string; portions: number; lines: RecipeLine[] }[] = [
  {
    id: 'latte12',
    name: 'Latte, 12 oz',
    note: 'Double shot + steamed milk',
    portions: 1,
    lines: [
      { ingredientId: 'beans', qty: 18, unit: 'g' },
      { ingredientId: 'milk', qty: 240, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'oatlatte12',
    name: 'Oat latte, 12 oz',
    note: 'Double shot + oat milk',
    portions: 1,
    lines: [
      { ingredientId: 'beans', qty: 18, unit: 'g' },
      { ingredientId: 'oat', qty: 220, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino, 8 oz',
    note: 'Double shot + less milk, more foam',
    portions: 1,
    lines: [
      { ingredientId: 'beans', qty: 18, unit: 'g' },
      { ingredientId: 'milk', qty: 150, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'americano',
    name: 'Americano, 12 oz',
    note: 'Double shot + hot water',
    portions: 1,
    lines: [
      { ingredientId: 'beans', qty: 18, unit: 'g' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'coldbrew16',
    name: 'Cold brew, 16 oz',
    note: 'Coarse grounds steeped 18 h',
    portions: 1,
    lines: [
      { ingredientId: 'coldbrew-beans', qty: 34, unit: 'g' },
      { ingredientId: 'cup16', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'matcha12',
    name: 'Matcha latte, 12 oz',
    note: '4 g matcha + milk + syrup',
    portions: 1,
    lines: [
      { ingredientId: 'matcha', qty: 4, unit: 'g' },
      { ingredientId: 'milk', qty: 220, unit: 'ml' },
      { ingredientId: 'vanilla', qty: 20, unit: 'ml' },
      { ingredientId: 'cup12', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'pastry',
    name: 'Bought-in pastry',
    note: 'Pastry + bag',
    portions: 1,
    lines: [
      { ingredientId: 'croissant', qty: 1, unit: 'each' },
      { ingredientId: 'bag', qty: 1, unit: 'each' },
    ],
  },
  {
    id: 'loaf',
    name: 'Baked loaf, 8 slices',
    note: 'Batch recipe, cost split across slices',
    portions: 8,
    lines: [
      { ingredientId: 'flour', qty: 250, unit: 'g' },
      { ingredientId: 'sugar', qty: 150, unit: 'g' },
      { ingredientId: 'butter', qty: 115, unit: 'g' },
      { ingredientId: 'eggs', qty: 2, unit: 'each' },
      { ingredientId: 'bag', qty: 8, unit: 'each' },
    ],
  },
];

/** What the invoice scanner "reads" in the demo: this week's GFS delivery. */
export const SAMPLE_INVOICE = {
  supplier: 'GFS (Gordon Food Service)',
  number: 'INV-20418',
  lines: [
    { text: 'OAT MILK BARISTA 12x1L', ingredientId: 'oat', packPrice: 48.0 },
    { text: 'MILK 3.25% 4L', ingredientId: 'milk', packPrice: 6.2 },
    { text: 'EGGS FREE RANGE 15DZ', ingredientId: 'eggs', packPrice: 57.6 },
    { text: 'SMOKED SALMON 1KG', ingredientId: 'salmon', packPrice: 44.5 },
    { text: 'VANILLA SYRUP 750ML', ingredientId: 'vanilla', packPrice: 9.75 },
  ],
};
