import { createContext, use, useEffect, useReducer, type ReactNode } from 'react';

import { AT_RISK, CAFE_NAME, MENU, PROMOS, REVIEWS } from '@core/sample-data';
import type { MenuItem, Promo, RangeKey } from '@core/types';

export type ThemePref = 'system' | 'light' | 'dark';

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
  replies: Record<string, string>; // review id -> posted reply
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
  | { type: 'sendReward'; id: string }
  | { type: 'toggleItem'; id: string }
  | { type: 'updateItem'; id: string; price: number; cost: number }
  | { type: 'addItem'; item: MenuItem }
  | { type: 'postReply'; id: string; text: string }
  | { type: 'resetDemo' };

export const STAMPS_FOR_REWARD = 10;

const fresh = (user: State['user'] = null, theme: ThemePref = 'system'): State => ({
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
  replies: {},
});

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'signIn':
      return { ...s, user: { name: a.name, email: a.email } };
    case 'signOut':
      return { ...s, user: null };
    case 'setCafe':
      return { ...s, cafe: { name: a.name, address: a.address } };
    case 'setTheme':
      return { ...s, theme: a.theme };
    case 'setRange':
      return { ...s, range: a.range };
    case 'selectDriver':
      return { ...s, driverId: a.id };
    case 'togglePromo':
      return { ...s, promos: s.promos.map((p) => (p.id === a.id ? { ...p, on: !p.on } : p)) };
    case 'addPromo':
      return { ...s, promos: [a.promo, ...s.promos] };
    case 'removePromo':
      return { ...s, promos: s.promos.filter((p) => p.id !== a.id) };
    case 'addStamp':
      return s.stamps >= STAMPS_FOR_REWARD
        ? { ...s, stamps: 0, redeemed: s.redeemed + 1 }
        : { ...s, stamps: s.stamps + 1 };
    case 'sendReward':
      return s.rewardsSent.includes(a.id) ? s : { ...s, rewardsSent: [...s.rewardsSent, a.id] };
    case 'toggleItem':
      return { ...s, menu: s.menu.map((m) => (m.id === a.id ? { ...m, available: !m.available } : m)) };
    case 'updateItem':
      return { ...s, menu: s.menu.map((m) => (m.id === a.id ? { ...m, price: a.price, cost: a.cost } : m)) };
    case 'addItem':
      return { ...s, menu: [...s.menu, a.item] };
    case 'postReply':
      return { ...s, replies: { ...s.replies, [a.id]: a.text } };
    case 'resetDemo':
      return fresh(s.user, s.theme);
  }
}

const KEY = 'sero-portal-v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...(JSON.parse(raw) as Partial<State>) };
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

/** Counts used by the sidebar badges and the Overview "needs attention" list. */
export function useAttention() {
  const { state } = useStore();
  return {
    atRisk: AT_RISK.length - state.rewardsSent.length,
    toAnswer: REVIEWS.filter((r) => !state.replies[r.id]).length,
    promosRunning: state.promos.filter((p) => p.on).length,
  };
}
