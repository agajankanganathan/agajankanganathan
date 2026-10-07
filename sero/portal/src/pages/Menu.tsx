import { useRef, useState, type FormEvent, type RefObject } from 'react';

import { marginBand, marginPct, menuTip, money, parseMoney, weeklyProfit } from '@core/logic';
import type { MenuItem } from '@core/types';

import { PageHead, Switch, useToast } from '../components/ui';
import { newId } from '../lib/ids';
import { useStore } from '../state/store';

type SortKey = 'name' | 'price' | 'cost' | 'margin' | 'sold' | 'profit' | 'trend';

const SORTERS: Record<SortKey, (m: MenuItem) => number | string> = {
  name: (m) => m.name,
  price: (m) => m.price,
  cost: (m) => m.cost,
  margin: (m) => marginPct(m.price, m.cost),
  sold: (m) => m.sold,
  profit: (m) => weeklyProfit(m),
  trend: (m) => m.trend,
};

export default function Menu() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'profit', dir: -1 });
  const dialog = useRef<HTMLDialogElement>(null);
  const tip = menuTip(state.menu);

  const rows = [...state.menu].sort((a, b) => {
    const x = SORTERS[sort.key](a);
    const y = SORTERS[sort.key](b);
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
  });

  const th = (key: SortKey, label: string, right = true) => (
    <th className={right ? 'r' : ''} aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }))}>
        {label}
        {sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  );

  const totalProfit = state.menu.filter((m) => m.available).reduce((t, m) => t + weeklyProfit(m), 0);

  return (
    <>
      <PageHead title="Menu" sub="What sells, what earns, and what to change. Edit a price or cost and the margin updates.">
        <button type="button" className="btn" onClick={() => dialog.current?.showModal()}>
          + Add item
        </button>
      </PageHead>

      {tip ? (
        <section className="card ai row" style={{ alignItems: 'flex-start' }}>
          <span className="tag">✦ AI tip</span>
          <p>{tip}</p>
        </section>
      ) : null}

      <section className="card">
        <div className="card-head">
          <h2>Items</h2>
          <span className="muted small">
            Gross profit this week: <b className="num">{money(totalProfit)}</b>
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {th('name', 'Item', false)}
                {th('price', 'Price')}
                {th('cost', 'Cost to make')}
                {th('margin', 'Margin')}
                {th('sold', 'Sold')}
                {th('profit', 'Profit / wk')}
                {th('trend', 'Trend')}
                <th className="r">On menu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const pct = marginPct(m.price, m.cost);
                const band = marginBand(pct);
                return (
                  <tr key={m.id} className={m.available ? '' : 'off'}>
                    <td>
                      <b>{m.name}</b>
                    </td>
                    <td className="r">
                      <MoneyCell
                        label={`${m.name} price`}
                        value={m.price}
                        onCommit={(price) => dispatch({ type: 'updateItem', id: m.id, price, cost: m.cost })}
                      />
                    </td>
                    <td className="r">
                      <MoneyCell
                        label={`${m.name} cost`}
                        value={m.cost}
                        onCommit={(cost) => dispatch({ type: 'updateItem', id: m.id, price: m.price, cost })}
                      />
                    </td>
                    <td className="r num">
                      <span className={band === 'healthy' ? 'good' : band === 'low' ? 'bad' : ''} title={`(${money(m.price, true)} − ${money(m.cost, true)}) ÷ ${money(m.price, true)}`}>
                        <b>{Math.round(pct)}%</b>
                      </span>
                    </td>
                    <td className="r num">{m.sold}</td>
                    <td className="r num">{money(weeklyProfit(m))}</td>
                    <td className={`r num ${m.trend >= 0 ? 'good' : 'bad'}`}>
                      {m.trend >= 0 ? '▲' : '▼'} {Math.abs(m.trend)}%
                    </td>
                    <td className="r">
                      <Switch
                        on={m.available}
                        label={`${m.name} on menu`}
                        onChange={() => {
                          dispatch({ type: 'toggleItem', id: m.id });
                          say(m.available ? `${m.name} marked sold out` : `${m.name} is back on the menu`);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="muted small">
        Margin = (price − cost to make) ÷ price. <span className="good">65%+ healthy</span> · 45–64% ok ·{' '}
        <span className="bad">under 45% worth a look</span>.
      </p>

      <AddItem dialog={dialog} />
    </>
  );
}

/** Inline-editable dollar amount. Saves on blur or Enter; Escape cancels. */
function MoneyCell({ value, onCommit, label }: { value: number; onCommit: (v: number) => void; label: string }) {
  const [text, setText] = useState(value.toFixed(2));
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setText(value.toFixed(2));
  }
  const commit = () => {
    const v = parseMoney(text);
    if (Number.isNaN(v) || v < 0) setText(value.toFixed(2));
    else if (Math.round(v * 100) / 100 !== value) onCommit(Math.round(v * 100) / 100);
  };
  return (
    <span className="money" style={{ display: 'inline-block' }}>
      <input
        className="input num"
        inputMode="decimal"
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setText(value.toFixed(2));
            e.currentTarget.blur();
          }
        }}
      />
    </span>
  );
}

function AddItem({ dialog }: { dialog: RefObject<HTMLDialogElement | null> }) {
  const { dispatch } = useStore();
  const say = useToast();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const p = parseMoney(price);
  const c = parseMoney(cost);
  const valid = name.trim() !== '' && p > 0 && c >= 0;

  const close = () => {
    dialog.current?.close();
    setName('');
    setPrice('');
    setCost('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    dispatch({
      type: 'addItem',
      item: { id: newId('item'), name: name.trim(), price: p, cost: c, sold: 0, trend: 0, available: true },
    });
    say(`${name.trim()} added to the menu`);
    close();
  };

  return (
    <dialog ref={dialog} aria-labelledby="add-item-title" onClose={close}>
      <form onSubmit={submit}>
        <h2 id="add-item-title" style={{ fontSize: 22 }}>
          Add a menu item
        </h2>
        <label className="field">
          Name
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chai Latte" required />
        </label>
        <div className="grid cols-2">
          <label className="field">
            Selling price
            <span className="money">
              <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </span>
          </label>
          <label className="field">
            Cost to make
            <span className="money">
              <input className="input" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
            </span>
          </label>
        </div>
        <p className="muted small" aria-live="polite">
          {p > 0 && c >= 0
            ? `Margin: ${Math.round(marginPct(p, c))}% · ${money(p - c, true)} profit per item`
            : 'Enter a price and cost to see the margin.'}
        </p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={!valid}>
            Add item
          </button>
        </div>
      </form>
    </dialog>
  );
}
