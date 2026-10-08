import { createContext, use, useEffect, useReducer, type ReactNode } from 'react';

import { CAFE_NAME, MENU, PROMOS } from '@core/sample-data';
import type { MenuItem, Promo, RangeKey } from '@core/types';

import { recipeCost, type Ingredient, type Recipe } from '../lib/costing';
import { SAMPLE_INGREDIENTS, SAMPLE_RECIPES } from '../lib/ingredients';
import { isAtRisk, MEMBERS, REVIEWS, type Category } from '../lib/sample';

export type ThemePref = 'system' | 'light' | 'dark';
export type Activity = { id: string; text: string; at: number; kind: 'promo' | 'reward' | 'reply' | 'menu' | 'settings' | 'cost' };
export type PriceAlert = { id: string; ingredientId: string; oldPrice: number; newPrice: number; at: number };

export type State = {
  user: { name: string; email: string } | null;
  cafe: { name: string; address: string };
  theme: ThemePref;
  range: RangeKey;
  driverId: string;
  promos: Promo[];
  stamps: number;
  redeemed: number;
  rewardsSent: string[];
  menu: MenuItem[];
  categories: Record<string, Category>; // for items added in the portal
  replies: Record<string, string>; // review id -> posted reply
  activity: Activity[];
  tourDone: boolean;
  checklistHidden: boolean;
  visited: string[]; // pages opened, for the getting-started checklist
  ingredients: Ingredient[];
  recipes: Record<string, Recipe>; // menu item id -> recipe; items with a recipe get their cost calculated
  targetMargin: number; // %
  alerts: PriceAlert[];
};

type Action =
  | { type: 'signIn'; name: string; email: string }
  | { type: 'signOut' }
  | { type: 'setCafe'; name: string; address: string }
  | { type: 'setTheme'; theme: ThemePref }
  | { type: 'setRange'; range: RangeKey }
  | { type: 'selectDriver'; id: string }
  | { type: 'togglePromo'; id: string }
  | { type: 'addPromo'; promo: Promo }
  | { type: 'removePromo'; id: string }
  | { type: 'addStamp' }
  | { type: 'sendReward'; id: string; name: string }
  | { type: 'toggleItem'; id: string }
  | { type: 'updateItem'; id: string; price: number; cost: number }
  | { type: 'addItem'; item: MenuItem; category: Category }
  | { type: 'postReply'; id: string; text: string; who: string }
  | { type: 'finishTour' }
  | { type: 'restartTour' }
  | { type: 'hideChecklist'; hidden: boolean }
  | { type: 'visit'; page: string }
  | { type: 'saveIngredient'; ingredient: Ingredient }
  | { type: 'deleteIngredient'; id: string }
  | { type: 'setRecipe'; itemId: string; recipe: Recipe | null }
  | { type: 'setPrice'; itemId: string; price: number }
  | { type: 'applyInvoice'; supplier: string; updates: { ingredientId: string; packPrice: number }[] }
  | { type: 'dismissAlert'; id: string }
  | { type: 'setTargetMargin'; pct: number }
  | { type: 'resetDemo' };

export const STAMPS_FOR_REWARD = 10;

const fresh = (user: State['user'] = null, theme: ThemePref = 'system'): State =>
  syncCosts({
  user,
  cafe: { name: CAFE_NAME, address: '128 Queen St W, Toronto' },
  theme,
  range: '7d',
  driverId: 'waits',
  promos: PROMOS,
  stamps: 7,
  redeemed: 0,
  rewardsSent: [],
  menu: MENU,
  categories: {},
  replies: {},
  activity: [],
  tourDone: false,
  checklistHidden: false,
  visited: [],
  ingredients: SAMPLE_INGREDIENTS,
  recipes: SAMPLE_RECIPES,
  targetMargin: 65,
  alerts: [],
});

/** Items with a recipe get their cost to make recalculated from current ingredient prices. */
function syncCosts(s: State): State {
  return {
    ...s,
    menu: s.menu.map((m) => {
      const r = s.recipes[m.id];
      if (!r || r.lines.length === 0) return m;
      const cost = Math.round(recipeCost(r, s.ingredients) * 100) / 100;
      return cost === m.cost ? m : { ...m, cost };
    }),
  };
}

/** Record a new pack price: keeps history and raises an alert when the price goes up. */
function repriced(s: State, ing: Ingredient, packPrice: number): { ingredient: Ingredient; alert?: PriceAlert } {
  if (packPrice === ing.packPrice) return { ingredient: ing };
  const ingredient = { ...ing, packPrice, history: [...ing.history, { at: Date.now(), price: packPrice }] };
  const used = Object.values(s.recipes).some((r) => r.lines.some((l) => l.ingredientId === ing.id));
  const alert =
    packPrice > ing.packPrice && used
      ? { id: `${ing.id}-${Date.now()}-${seq++}`, ingredientId: ing.id, oldPrice: ing.packPrice, newPrice: packPrice, at: Date.now() }
      : undefined;
  return { ingredient, alert };
}

let seq = 0;
const log = (s: State, kind: Activity['kind'], text: string): Activity[] =>
  [{ id: `${Date.now()}-${seq++}`, text, at: Date.now(), kind }, ...s.activity].slice(0, 30);

function reducer(s: State, a: Action): State {
  const next = apply(s, a);
  return next === s ? s : syncCosts(next);
}

function apply(s: State, a: Action): State {
  switch (a.type) {
    case 'signIn':
      return { ...s, user: { name: a.name, email: a.email } };
    case 'signOut':
      return { ...s, user: null };
    case 'setCafe':
      return { ...s, cafe: { name: a.name, address: a.address }, activity: log(s, 'settings', `Updated café details to “${a.name}”`) };
    case 'setTheme':
      return { ...s, theme: a.theme };
    case 'setRange':
      return { ...s, range: a.range };
    case 'selectDriver':
      return { ...s, driverId: a.id };
    case 'togglePromo': {
      const p = s.promos.find((x) => x.id === a.id);
      if (!p) return s;
      return {
        ...s,
        promos: s.promos.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)),
        activity: log(s, 'promo', `${p.on ? 'Paused' : 'Turned on'} “${p.name}”`),
      };
    }
    case 'addPromo':
      return { ...s, promos: [a.promo, ...s.promos], activity: log(s, 'promo', `Launched “${a.promo.name}”`) };
    case 'removePromo': {
      const p = s.promos.find((x) => x.id === a.id);
      return { ...s, promos: s.promos.filter((x) => x.id !== a.id), activity: log(s, 'promo', `Deleted “${p?.name ?? 'promotion'}”`) };
    }
    case 'addStamp':
      return s.stamps >= STAMPS_FOR_REWARD
        ? { ...s, stamps: 0, redeemed: s.redeemed + 1, activity: log(s, 'reward', 'Maya R. redeemed a free drink') }
        : { ...s, stamps: s.stamps + 1 };
    case 'sendReward':
      return s.rewardsSent.includes(a.id)
        ? s
        : { ...s, rewardsSent: [...s.rewardsSent, a.id], activity: log(s, 'reward', `Sent a free drink to ${a.name}`) };
    case 'toggleItem': {
      const m = s.menu.find((x) => x.id === a.id);
      if (!m) return s;
      return {
        ...s,
        menu: s.menu.map((x) => (x.id === a.id ? { ...x, available: !x.available } : x)),
        activity: log(s, 'menu', `${m.name} ${m.available ? 'marked sold out' : 'back on the menu'}`),
      };
    }
    case 'updateItem': {
      const m = s.menu.find((x) => x.id === a.id);
      if (!m) return s;
      const what = m.price !== a.price ? `price to $${a.price.toFixed(2)}` : `cost to $${a.cost.toFixed(2)}`;
      return {
        ...s,
        menu: s.menu.map((x) => (x.id === a.id ? { ...x, price: a.price, cost: a.cost } : x)),
        activity: log(s, 'menu', `Changed ${m.name} ${what}`),
      };
    }
    case 'addItem':
      return {
        ...s,
        menu: [...s.menu, a.item],
        categories: { ...s.categories, [a.item.id]: a.category },
        activity: log(s, 'menu', `Added ${a.item.name} to the menu`),
      };
    case 'postReply':
      return { ...s, replies: { ...s.replies, [a.id]: a.text }, activity: log(s, 'reply', `Replied to ${a.who}’s review`) };
    case 'finishTour':
      return { ...s, tourDone: true };
    case 'restartTour':
      return { ...s, tourDone: false };
    case 'hideChecklist':
      return { ...s, checklistHidden: a.hidden };
    case 'visit':
      return s.visited.includes(a.page) ? s : { ...s, visited: [...s.visited, a.page] };
    case 'saveIngredient': {
      const old = s.ingredients.find((x) => x.id === a.ingredient.id);
      if (!old) {
        const ing = { ...a.ingredient, history: [{ at: Date.now(), price: a.ingredient.packPrice }] };
        return { ...s, ingredients: [...s.ingredients, ing], activity: log(s, 'cost', `Added ingredient ${ing.name}`) };
      }
      const { ingredient, alert } = repriced(s, { ...a.ingredient, packPrice: old.packPrice, history: old.history }, a.ingredient.packPrice);
      return {
        ...s,
        ingredients: s.ingredients.map((x) => (x.id === ingredient.id ? ingredient : x)),
        alerts: alert ? [alert, ...s.alerts] : s.alerts,
        activity:
          old.packPrice !== a.ingredient.packPrice
            ? log(s, 'cost', `${ingredient.name}: $${old.packPrice.toFixed(2)} → $${ingredient.packPrice.toFixed(2)} per pack`)
            : log(s, 'cost', `Updated ${ingredient.name}`),
      };
    }
    case 'deleteIngredient': {
      const ing = s.ingredients.find((x) => x.id === a.id);
      const recipes = Object.fromEntries(
        Object.entries(s.recipes).map(([k, r]) => [k, { ...r, lines: r.lines.filter((l) => l.ingredientId !== a.id) }])
      );
      return {
        ...s,
        ingredients: s.ingredients.filter((x) => x.id !== a.id),
        recipes,
        alerts: s.alerts.filter((x) => x.ingredientId !== a.id),
        activity: log(s, 'cost', `Removed ingredient ${ing?.name ?? ''}`),
      };
    }
    case 'setRecipe': {
      const item = s.menu.find((m) => m.id === a.itemId);
      const recipes = { ...s.recipes };
      if (a.recipe && a.recipe.lines.length) recipes[a.itemId] = a.recipe;
      else delete recipes[a.itemId];
      return { ...s, recipes, activity: log(s, 'menu', `Saved the recipe for ${item?.name ?? 'an item'}`) };
    }
    case 'setPrice': {
      const m = s.menu.find((x) => x.id === a.itemId);
      if (!m) return s;
      return {
        ...s,
        menu: s.menu.map((x) => (x.id === a.itemId ? { ...x, price: a.price } : x)),
        activity: log(s, 'menu', `Changed ${m.name} price to $${a.price.toFixed(2)}`),
      };
    }
    case 'applyInvoice': {
      let ingredients = s.ingredients;
      const alerts: PriceAlert[] = [];
      let changed = 0;
      for (const u of a.updates) {
        const ing = ingredients.find((x) => x.id === u.ingredientId);
        if (!ing || ing.packPrice === u.packPrice) continue;
        const r = repriced({ ...s, ingredients }, ing, u.packPrice);
        ingredients = ingredients.map((x) => (x.id === ing.id ? r.ingredient : x));
        if (r.alert) alerts.push(r.alert);
        changed++;
      }
      return {
        ...s,
        ingredients,
        alerts: [...alerts, ...s.alerts],
        activity: log(s, 'cost', `Scanned ${a.supplier} invoice: ${changed} price${changed === 1 ? '' : 's'} updated`),
      };
    }
    case 'dismissAlert':
      return { ...s, alerts: s.alerts.filter((x) => x.id !== a.id) };
    case 'setTargetMargin':
      return { ...s, targetMargin: a.pct };
    case 'resetDemo':
      return { ...fresh(s.user, s.theme), tourDone: s.tourDone };
  }
}

const KEY = 'sero-portal-v3';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return syncCosts({ ...fresh(), ...(JSON.parse(raw) as Partial<State>) });
  } catch {
    // Private mode or corrupted data: start fresh.
  }
  return fresh();
}

const StoreContext = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the demo still works, it just won't survive a reload.
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = state.theme;
  }, [state.theme]);

  return <StoreContext value={{ state, dispatch }}>{children}</StoreContext>;
}

export function useStore() {
  const ctx = use(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Counts used by the sidebar badges, notifications and the Overview "needs attention" list. */
export function useAttention() {
  const { state } = useStore();
  return {
    atRisk: MEMBERS.filter((m) => isAtRisk(m) && !state.rewardsSent.includes(m.id)).length,
    toAnswer: REVIEWS.filter((r) => !state.replies[r.id]).length,
    promosRunning: state.promos.filter((p) => p.on).length,
    priceAlerts: state.alerts.length,
  };
}
