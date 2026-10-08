import { marginPct, money } from '@core/logic';

import { suggestPrice } from '../lib/costing';
import { useStore } from '../state/store';
import { Icon } from './icons';
import { useToast } from './ui';

/** Supplier price increases, which menu items they affect, and a one-click suggested price. */
export function PriceAlerts({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  if (state.alerts.length === 0) return null;

  return (
    <section className="card ai stack" aria-label="Supplier price changes">
      <div className="row between wrap">
        <div className="row">
          <span className="ico-circle bad">
            <Icon name="alert" />
          </span>
          <div>
            <h2>Supplier prices went up</h2>
            <p className="muted small">Your target margin is {state.targetMargin}%. Here’s what changed and what to do about it.</p>
          </div>
        </div>
      </div>

      {state.alerts.slice(0, compact ? 2 : undefined).map((al) => {
        const ing = state.ingredients.find((i) => i.id === al.ingredientId);
        if (!ing) return null;
        const pct = ((al.newPrice - al.oldPrice) / al.oldPrice) * 100;
        const items = state.menu.filter((m) => state.recipes[m.id]?.lines.some((l) => l.ingredientId === ing.id));
        return (
          <div key={al.id} className="card" style={{ padding: 16 }}>
            <div className="row between wrap" style={{ marginBottom: 10 }}>
              <div>
                <b>{ing.name}</b>{' '}
                <span className="pill bad">
                  ▲ {pct.toFixed(0)}% · {money(al.oldPrice, true)} → {money(al.newPrice, true)}
                </span>
                <div className="muted small">
                  {ing.supplier} · used in {items.length} item{items.length === 1 ? '' : 's'}
                </div>
              </div>
              <button type="button" className="link small" onClick={() => dispatch({ type: 'dismissAlert', id: al.id })}>
                Dismiss
              </button>
            </div>
            <ul className="list">
              {items.map((m) => {
                const mg = marginPct(m.price, m.cost);
                const below = mg < state.targetMargin;
                const sp = suggestPrice(m.cost, state.targetMargin);
                return (
                  <li key={m.id}>
                    <span className="grow">
                      <b>{m.name}</b>
                      <div className="muted small">
                        Costs {money(m.cost, true)} · sells for {money(m.price, true)} ·{' '}
                        <span className={below ? 'bad' : 'good'}>{Math.round(mg)}% margin</span>
                      </div>
                    </span>
                    {below && sp > m.price ? (
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => {
                          dispatch({ type: 'setPrice', itemId: m.id, price: sp });
                          say(`${m.name} is now ${money(sp, true)}`);
                        }}>
                        Raise to {money(sp, true)}
                      </button>
                    ) : (
                      <span className="pill good">Still on target</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {compact && state.alerts.length > 2 ? <p className="muted small">+{state.alerts.length - 2} more on the Ingredients page</p> : null}
    </section>
  );
}
