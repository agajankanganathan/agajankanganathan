// Recipe costing: turn bulk supplier purchases into a cost per serving.

export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'each';
export type Dimension = 'mass' | 'volume' | 'count';

export const UNITS: Record<Unit, { dim: Dimension; toBase: number; label: string }> = {
  g: { dim: 'mass', toBase: 1, label: 'g' },
  kg: { dim: 'mass', toBase: 1000, label: 'kg' },
  ml: { dim: 'volume', toBase: 1, label: 'ml' },
  L: { dim: 'volume', toBase: 1000, label: 'L' },
  each: { dim: 'count', toBase: 1, label: 'each' },
};

export const BASE: Record<Dimension, Unit> = { mass: 'g', volume: 'ml', count: 'each' };
export const unitsFor = (dim: Dimension) => (Object.keys(UNITS) as Unit[]).filter((u) => UNITS[u].dim === dim);

export type Ingredient = {
  id: string;
  name: string;
  supplier: string;
  group: string;
  packCount: number; // e.g. 12 cartons in a case
  packSize: number; // e.g. 1 (L) per carton
  packUnit: Unit;
  packPrice: number; // what the invoice says for the whole pack/case
  wastePct: number; // share lost to steaming, trimming, spills (0–90)
  history: { at: number; price: number }[]; // past pack prices, oldest first
};

export type RecipeLine = { ingredientId: string; qty: number; unit: Unit };
export type Recipe = { lines: RecipeLine[]; portions: number }; // portions > 1 for batch recipes (a loaf cut into slices)

/** Total base units (g, ml or each) in one purchase. */
export const packBaseQty = (i: Ingredient) => i.packCount * i.packSize * UNITS[i.packUnit].toBase;

/** Cost per usable base unit, after waste. */
export function costPerBase(i: Ingredient): number {
  const usable = 1 - Math.min(Math.max(i.wastePct, 0), 90) / 100;
  return i.packPrice / packBaseQty(i) / usable;
}

export function lineCost(line: RecipeLine, ingredients: Ingredient[]): number {
  const ing = ingredients.find((x) => x.id === line.ingredientId);
  if (!ing || UNITS[line.unit].dim !== UNITS[ing.packUnit].dim) return 0;
  return costPerBase(ing) * line.qty * UNITS[line.unit].toBase;
}

/** Cost to make one serving. */
export function recipeCost(r: Recipe, ingredients: Ingredient[]): number {
  const total = r.lines.reduce((t, l) => t + lineCost(l, ingredients), 0);
  return total / Math.max(1, r.portions);
}

/** Price needed to reach a target margin, rounded up to the next 25¢ like a café menu. */
export function suggestPrice(cost: number, targetPct: number): number {
  const raw = cost / (1 - targetPct / 100);
  return Math.ceil(raw * 4) / 4;
}

/** Friendly unit cost label, e.g. "$0.032 / g" or "$0.12 each". */
export function unitCostLabel(i: Ingredient): string {
  const base = BASE[UNITS[i.packUnit].dim];
  const c = costPerBase(i);
  if (base === 'each') return `$${c.toFixed(2)} each`;
  // Per-gram/ml costs are tiny, so show per kg / L too.
  return `$${(c * 1000).toFixed(2)} / ${base === 'g' ? 'kg' : 'L'}`;
}

export function packLabel(i: Ingredient): string {
  if (i.packUnit === 'each') return `${(i.packCount * i.packSize).toLocaleString('en-US')} each`;
  const size = `${i.packSize} ${UNITS[i.packUnit].label}`;
  return i.packCount > 1 ? `${i.packCount} × ${size}` : size;
}

/** Percent change between the last two recorded prices (0 when there's no history). */
export function lastChangePct(i: Ingredient): number {
  const h = i.history;
  if (h.length < 2) return 0;
  const prev = h[h.length - 2].price;
  return prev ? ((h[h.length - 1].price - prev) / prev) * 100 : 0;
}
