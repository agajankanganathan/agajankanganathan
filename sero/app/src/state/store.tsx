import { createContext, use, useReducer, type ReactNode } from 'react';

import { AT_RISK, LOYALTY, MENU, PROMOS, REVIEWS } from '@/core/sample-data';
import type { MenuItem, Promo, RangeKey } from '@/core/types';

type State = {
  range: RangeKey;
  driverId: string;
  promos: Promo[];
  stamps: number;
  redeemed: number;
  rewardsSent: string[]; // member ids
  menu: MenuItem[];
  replied: string[]; // review ids
};

type Action =
  | { type: 'setRange'; range: RangeKey }
  | { type: 'selectDriver'; id: string }
  | { type: 'togglePromo'; id: string }
  | { type: 'addStamp' }
  | { type: 'sendReward'; id: string }
  | { type: 'toggleItem'; id: string }
  | { type: 'updateItem'; id: string; price: number; cost: number }
  | { type: 'postReply'; id: string };

const initial: State = {
  range: '7d',
  driverId: 'waits',
  promos: PROMOS,
  stamps: 7,
  redeemed: 0,
  rewardsSent: [],
  menu: MENU,
  replied: [],
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'setRange':
      return { ...s, range: a.range };
    case 'selectDriver':
      return { ...s, driverId: a.id };
    case 'togglePromo':
      return { ...s, promos: s.promos.map((p) => (p.id === a.id ? { ...p, on: !p.on } : p)) };
    case 'addStamp':
      // A full card redeems the reward and starts a fresh card.
      return s.stamps >= LOYALTY.stampsForReward
        ? { ...s, stamps: 0, redeemed: s.redeemed + 1 }
        : { ...s, stamps: s.stamps + 1 };
    case 'sendReward':
      return s.rewardsSent.includes(a.id) ? s : { ...s, rewardsSent: [...s.rewardsSent, a.id] };
    case 'toggleItem':
      return { ...s, menu: s.menu.map((m) => (m.id === a.id ? { ...m, available: !m.available } : m)) };
    case 'updateItem':
      return { ...s, menu: s.menu.map((m) => (m.id === a.id ? { ...m, price: a.price, cost: a.cost } : m)) };
    case 'postReply':
      return s.replied.includes(a.id) ? s : { ...s, replied: [...s.replied, a.id] };
  }
}

const StoreContext = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <StoreContext value={{ state, dispatch }}>{children}</StoreContext>;
}

export function useStore() {
  const ctx = use(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Counts shown on the Today screen and as tab badges. */
export function useAttention() {
  const { state } = useStore();
  return {
    atRisk: AT_RISK.length - state.rewardsSent.length,
    toAnswer: REVIEWS.length - state.replied.length,
    promosRunning: state.promos.filter((p) => p.on).length,
  };
}
