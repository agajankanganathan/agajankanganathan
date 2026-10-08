import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { useSearchParams } from 'react-router';

import { marginBand, marginPct, menuTip, money, parseMoney, weeklyProfit } from '@core/logic';
import type { MenuItem } from '@core/types';

import { Icon } from '../components/icons';
import { PriceAlerts } from '../components/PriceAlerts';
import { RecipeBuilder } from '../components/RecipeBuilder';
import { InfoTip, PageHead, Segmented, Stat, Switch, useToast } from '../components/ui';
import { newId } from '../lib/ids';
import { CATEGORIES, ITEM_CATEGORY, type Category } from '../lib/sample';
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
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'profit', dir: -1 });
  const [cat, setCat] = useState<'all' | Category>('all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const dialog = useRef<HTMLDialogElement>(null);
  const recipeFor = params.get('recipe');
  const openRecipe = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('recipe', id);
    else next.delete('recipe');
    setParams(next, { replace: true });
  };
  const tip = menuTip(state.menu);
  const categoryOf = (m: MenuItem): Category => state.categories[m.id] ?? ITEM_CATEGORY[m.id] ?? 'Food';

  // /menu?add=1 opens the add dialog; /menu?q=… pre-fills the search (from ⌘K); /menu?recipe=id opens a recipe.
  useEffect(() => {
    if (params.get('add')) dialog.current?.showModal();
    if (params.get('add') || params.get('q')) {
      const next = new URLSearchParams(params);
      next.delete('add');
      next.delete('q');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const rows = state.menu
    .filter((m) => cat === 'all' || categoryOf(m) === cat)
    .filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => {
      const x = SORTERS[sort.key](a);
      const y = SORTERS[sort.key](b);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });

  const live = state.menu.filter((m) => m.available);
  const revenue = live.reduce((t, m) => t + m.price * m.sold, 0);
  const profit = live.reduce((t, m) => t + weeklyProfit(m), 0);
  const blended = revenue ? (profit / revenue) * 100 : 0;
  const low = live.filter((m) => marginPct(m.price, m.cost) < state.targetMargin);
  const costed = state.menu.filter((m) => state.recipes[m.id]).length;
  const best = [...live].sort((a, b) => weeklyProfit(b) - weeklyProfit(a))[0];

  const th = (key: SortKey, label: string, right = true) => (
    <th className={right ? 'r' : ''} aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }))}>
        {label}
        {sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  );

  return (
    <>
      <PageHead crumb="Run" title="Menu" sub="What sells, what earns, and what to change. Costs come from your recipes, so margins stay up to date when supplier prices change.">
        <label className="row small" style={{ gap: 8 }}>
          <span className="muted">
            Target margin
            <InfoTip>The margin you aim for. Sero flags items below it and suggests a price that gets you there. Cafés often aim for 65–75%.</InfoTip>
          </span>
          <span style={{ position: 'relative' }}>
            <input
              className="input num"
              style={{ width: 76, paddingRight: 26 }}
              inputMode="numeric"
              aria-label="Target margin percent"
              value={state.targetMargin}
              onChange={(e) => {
                const v = Math.round(Number(e.target.value));
                if (!Number.isNaN(v)) dispatch({ type: 'setTargetMargin', pct: Math.min(95, Math.max(0, v)) });
              }}
            />
            <span className="muted" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
              %
            </span>
          </span>
        </label>
        <button type="button" className="btn" onClick={() => dialog.current?.showModal()}>
          + Add item
        </button>
      </PageHead>

      <div className="grid cols-4">
        <Stat label="Gross profit this week" value={money(profit)} tip="Price minus cost to make, times units sold, for every item currently on the menu." />
        <Stat
          label="Average margin"
          value={`${Math.round(blended)}%`}
          tip="Your blended gross margin, weighted by sales. Cafés typically aim for 65–75% on drinks and 55%+ on food."
        />
        <Stat label="Top earner" value={best?.name ?? '–'} />
        <Stat
          label="Below target"
          value={String(low.length)}
          tip={`Items under your ${state.targetMargin}% target margin. Open the item’s recipe to see what drives the cost and a suggested price.`}
        />
      </div>

      <PriceAlerts />
      {costed < state.menu.length ? (
        <section className="card row between wrap">
          <span>
            <b>
              {state.menu.length - costed} item{state.menu.length - costed === 1 ? '' : 's'} without a recipe.
            </b>{' '}
            <span className="muted">Their cost is typed in by hand, so it won’t update when supplier prices change.</span>
          </span>
          <button type="button" className="btn ghost sm" onClick={() => openRecipe(state.menu.find((m) => !state.recipes[m.id])?.id ?? null)}>
            Build a recipe
          </button>
        </section>
      ) : null}

      {tip ? (
        <section className="card ai row" style={{ alignItems: 'flex-start' }}>
          <span className="tag">✦ AI tip</span>
          <p>{tip}</p>
        </section>
      ) : null}

      <section className="card" data-tour="menu-table">
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <Segmented<'all' | Category>
            label="Category"
            value={cat}
            onChange={setCat}
            options={[{ key: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ key: c, label: c }))]}
          />
          <label className="search">
            <Icon name="search" />
            <span className="sr-only">Search menu</span>
            <input className="input" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {th('name', 'Item', false)}
                {th('price', 'Price')}
                {th('cost', 'Cost to make')}
                {th('margin', 'Margin')}
                {th('sold', 'Sold / wk')}
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
                      <div className="item-cell">
                        <div>
                          <button type="button" className="link" style={{ color: 'inherit', fontWeight: 600 }} onClick={() => openRecipe(m.id)}>
                            {m.name}
                          </button>
                          <small>
                            {categoryOf(m)}
                            {m.available ? '' : ' · sold out'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="r">
                      <MoneyCell label={`${m.name} price`} value={m.price} onCommit={(price) => dispatch({ type: 'updateItem', id: m.id, price, cost: m.cost })} />
                    </td>
                    <td className="r">
                      {state.recipes[m.id] ? (
                        <button type="button" className="cost-btn num" onClick={() => openRecipe(m.id)} aria-label={`${m.name} costs ${money(m.cost, true)}. Open recipe`}>
                          {money(m.cost, true)} <small>Recipe</small>
                        </button>
                      ) : (
                        <span className="stack" style={{ gap: 2, justifyItems: 'end' }}>
                          <MoneyCell label={`${m.name} cost`} value={m.cost} onCommit={(cost) => dispatch({ type: 'updateItem', id: m.id, price: m.price, cost })} />
                          <button type="button" className="link" style={{ fontSize: 12 }} onClick={() => openRecipe(m.id)}>
                            Build recipe
                          </button>
                        </span>
                      )}
                    </td>
                    <td className="r num">
                      <span
                        className={`pill ${band === 'healthy' ? 'good' : band === 'low' ? 'bad' : 'neutral'}`}
                        title={`(${money(m.price, true)} − ${money(m.cost, true)}) ÷ ${money(m.price, true)}`}>
                        {Math.round(pct)}%
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    No items match.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot>
              <tr>
                <td>On the menu ({live.length} items)</td>
                <td />
                <td />
                <td className="r num">{Math.round(blended)}%</td>
                <td className="r num">{live.reduce((t, m) => t + m.sold, 0)}</td>
                <td className="r num">{money(profit)}</td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <p className="muted small">
        Margin = (price − cost to make) ÷ price. Click an item’s name or cost to open its recipe. Press Enter to save a price edit, Esc to undo it.
        <InfoTip>“Cost to make” is ingredients plus packaging for one serving, worked out from your Ingredients. It doesn’t include staff time.</InfoTip>
      </p>

      <AddItem dialog={dialog} onBuild={openRecipe} />
      {recipeFor ? <RecipeBuilder key={recipeFor} itemId={recipeFor} onClose={() => openRecipe(null)} /> : null}
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

function AddItem({ dialog, onBuild }: { dialog: RefObject<HTMLDialogElement | null>; onBuild: (id: string) => void }) {
  const { dispatch } = useStore();
  const say = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Coffee');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const p = parseMoney(price);
  const c = cost.trim() === '' ? 0 : parseMoney(cost);
  const valid = name.trim() !== '' && p > 0 && c >= 0;

  const close = () => {
    dialog.current?.close();
    setName('');
    setPrice('');
    setCost('');
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    const id = newId('item');
    const build = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'build';
    dispatch({
      type: 'addItem',
      item: { id, name: name.trim(), price: p, cost: c, sold: 0, trend: 0, available: true },
      category,
    });
    say(`${name.trim()} added to the menu`);
    close();
    if (build) onBuild(id);
  };

  return (
    <dialog ref={dialog} aria-labelledby="add-item-title" onClose={close}>
      <form onSubmit={submit}>
        <h2 id="add-item-title" style={{ fontSize: 22 }}>
          Add a menu item
        </h2>
        <div className="grid cols-2">
          <label className="field">
            Name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chai Latte" required />
          </label>
          <label className="field">
            Category
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid cols-2">
          <label className="field">
            Selling price
            <span className="money">
              <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </span>
          </label>
          <label className="field">
            <span>
              Cost to make <span className="hint">optional if you build a recipe</span>
            </span>
            <span className="money">
              <input className="input" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
            </span>
          </label>
        </div>
        <div className="card ai" style={{ padding: 14 }} aria-live="polite">
          {p > 0 && c > 0 ? (
            <>
              <span className="muted small">Margin</span>
              <p style={{ fontSize: 24, fontWeight: 600 }} className={marginBand(marginPct(p, c)) === 'low' ? 'bad' : 'good'}>
                {Math.round(marginPct(p, c))}%{' '}
                <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>
                  · {money(p - c, true)} profit per item
                </span>
              </p>
            </>
          ) : (
            <span className="muted small">Know the cost? Type it in. Otherwise click “Add & build recipe” and Sero works it out from your ingredients.</span>
          )}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn ghost" value="add" disabled={!valid}>
            Add item
          </button>
          <button type="submit" className="btn" value="build" disabled={!valid}>
            Add & build recipe →
          </button>
        </div>
      </form>
    </dialog>
  );
}
