import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { money, parseMoney } from '@core/logic';

import { Icon } from '../components/icons';
import { IngredientDialog } from '../components/IngredientDialog';
import { PriceAlerts } from '../components/PriceAlerts';
import { InfoTip, PageHead, Segmented, Stat, useToast } from '../components/ui';
import { lastChangePct, packLabel, unitCostLabel, type Ingredient } from '../lib/costing';
import { INGREDIENT_GROUPS, SAMPLE_INVOICE } from '../lib/ingredients';
import { useStore } from '../state/store';

export default function Ingredients() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const [params, setParams] = useSearchParams();
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Ingredient | null | 'new'>(null);
  const [scan, setScan] = useState(false);

  // /ingredients?scan=1 opens the invoice scanner; ?add=1 opens the add form (used by ⌘K and Help).
  useEffect(() => {
    if (params.get('scan')) setScan(true);
    if (params.get('add')) setEditing('new');
    if (params.get('scan') || params.get('add')) setParams({}, { replace: true });
  }, [params, setParams]);

  const usedIn = (id: string) => state.menu.filter((m) => state.recipes[m.id]?.lines.some((l) => l.ingredientId === id));
  const rows = state.ingredients
    .filter((i) => group === 'all' || i.group === group)
    .filter((i) => `${i.name} ${i.supplier}`.toLowerCase().includes(q.trim().toLowerCase()));
  const costed = state.menu.filter((m) => state.recipes[m.id]).length;
  const rising = state.ingredients.filter((i) => lastChangePct(i) > 0).length;

  return (
    <>
      <PageHead crumb="Run" title="Ingredients & costs" sub="Enter what you buy, the way your supplier sells it. Sero turns it into the cost of every drink and dish, and keeps your margins up to date.">
        <button type="button" className="btn ghost" onClick={() => setScan(true)}>
          <Icon name="camera" size={16} /> Scan an invoice
        </button>
        <button type="button" className="btn" onClick={() => setEditing('new')}>
          + Add ingredient
        </button>
      </PageHead>

      <section className="card grid cols-3" data-tour="ingredients">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <span className="ico-circle">1</span>
          <div>
            <h3>Enter what you buy</h3>
            <p className="muted small">Case of 12 × 1 L oat milk for $43.20? Type exactly that. Sero works out the cost per ml.</p>
          </div>
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <span className="ico-circle">2</span>
          <div>
            <h3>Build each recipe once</h3>
            <p className="muted small">
              18 g beans + 220 ml oat milk + a cup. On the <Link className="link" to="/menu">Menu</Link>, click any item’s cost to open its recipe.
            </p>
          </div>
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <span className="ico-circle">3</span>
          <div>
            <h3>Prices change? Update once</h3>
            <p className="muted small">Change a price here, or scan the invoice, and every margin updates. Sero flags anything below target.</p>
          </div>
        </div>
      </section>

      <div className="grid cols-4">
        <Stat label="Ingredients tracked" value={String(state.ingredients.length)} />
        <Stat label="Menu items costed" value={`${costed} of ${state.menu.length}`} tip="Items with a recipe. Their cost to make is calculated automatically from ingredient prices." />
        <Stat label="Prices up recently" value={String(rising)} tip="Ingredients whose latest price is higher than the one before." />
        <Stat label="Target margin" value={`${state.targetMargin}%`} tip="Set on the Menu page. Sero suggests prices that hit this target." />
      </div>

      <PriceAlerts />

      <section className="card">
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <Segmented
            label="Category"
            value={group}
            onChange={setGroup}
            options={[{ key: 'all', label: 'All' }, ...INGREDIENT_GROUPS.map((g) => ({ key: g, label: g }))]}
          />
          <label className="search">
            <Icon name="search" />
            <span className="sr-only">Search ingredients</span>
            <input className="input" placeholder="Search ingredient or supplier…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>You buy</th>
                <th className="r">Pack price</th>
                <th className="r">
                  Waste <InfoTip>Share lost before serving (steaming, trimming, spills). It’s added to the real cost.</InfoTip>
                </th>
                <th className="r">Real cost</th>
                <th className="r">Last change</th>
                <th>Used in</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const ch = lastChangePct(i);
                const used = usedIn(i.id);
                return (
                  <tr key={i.id}>
                    <td>
                      <div className="item-cell">
                        <div>
                          <b>{i.name}</b>
                          <small>{i.supplier || '—'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{packLabel(i)}</td>
                    <td className="r">
                      <PackPrice
                        ing={i}
                        onCommit={(packPrice) => {
                          dispatch({ type: 'saveIngredient', ingredient: { ...i, packPrice } });
                          say(`${i.name} price updated, margins recalculated`);
                        }}
                      />
                    </td>
                    <td className="r num">{i.wastePct}%</td>
                    <td className="r num">
                      <b>{unitCostLabel(i)}</b>
                    </td>
                    <td className="r">
                      {ch === 0 ? <span className="faint small">—</span> : <span className={`pill ${ch > 0 ? 'bad' : 'good'}`}>{ch > 0 ? '▲' : '▼'} {Math.abs(ch).toFixed(0)}%</span>}
                    </td>
                    <td className="muted small" style={{ whiteSpace: 'normal', minWidth: 140 }}>
                      {used.length ? used.map((m) => m.name).join(', ') : 'Not in a recipe yet'}
                    </td>
                    <td className="r">
                      <button type="button" className="btn ghost sm" onClick={() => setEditing(i)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    No ingredients match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <p className="muted small">Tip: click a pack price to edit it, press Enter to save. Every recipe that uses it updates instantly.</p>

      <IngredientDialog open={editing !== null} ingredient={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      <InvoiceScan open={scan} onClose={() => setScan(false)} />
    </>
  );
}

function PackPrice({ ing, onCommit }: { ing: Ingredient; onCommit: (v: number) => void }) {
  const [text, setText] = useState(ing.packPrice.toFixed(2));
  const [prev, setPrev] = useState(ing.packPrice);
  if (prev !== ing.packPrice) {
    setPrev(ing.packPrice);
    setText(ing.packPrice.toFixed(2));
  }
  const commit = () => {
    const v = parseMoney(text);
    if (Number.isNaN(v) || v <= 0) setText(ing.packPrice.toFixed(2));
    else if (Math.round(v * 100) / 100 !== ing.packPrice) onCommit(Math.round(v * 100) / 100);
  };
  return (
    <span className="money" style={{ display: 'inline-block' }}>
      <input
        className="input num"
        inputMode="decimal"
        aria-label={`${ing.name} pack price`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setText(ing.packPrice.toFixed(2));
            e.currentTarget.blur();
          }
        }}
      />
    </span>
  );
}

type Step = 'pick' | 'reading' | 'review';

/** Demo of invoice scanning: any photo or PDF "reads" as the sample GFS invoice. Nothing is uploaded. */
function InvoiceScan({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>('pick');
  const [file, setFile] = useState('');
  const [over, setOver] = useState(false);
  const [keep, setKeep] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStep('pick');
      setFile('');
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const read = (name: string) => {
    setFile(name);
    setStep('reading');
    setKeep(Object.fromEntries(SAMPLE_INVOICE.lines.map((_, n) => [n, true])));
    window.setTimeout(() => setStep('review'), 1400);
  };

  const lines = SAMPLE_INVOICE.lines.map((l) => {
    const ing = state.ingredients.find((i) => i.id === l.ingredientId);
    return { ...l, ing, changed: ing ? ing.packPrice !== l.packPrice : false };
  });
  const toApply = lines.filter((l, n) => keep[n] && l.ing && l.changed);

  return (
    <dialog ref={ref} aria-labelledby="scan-title" onClose={onClose} style={{ width: 'min(620px, calc(100% - 32px))' }}>
      <div style={{ display: 'grid', gap: 16, padding: 26 }}>
        <div className="row between">
          <div>
            <h2 id="scan-title" style={{ fontSize: 22 }}>
              Scan a supplier invoice
            </h2>
            <p className="muted small">Snap a photo of a delivery invoice. Sero reads each line, matches it to your ingredients and updates prices.</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {step === 'pick' ? (
          <>
            <label
              className={`dropzone${over ? ' over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                const f = e.dataTransfer.files[0];
                if (f) read(f.name);
              }}>
              <Icon name="camera" size={28} />
              <b style={{ color: 'var(--fg)' }}>Drop a photo or PDF here, or click to choose</b>
              <span className="small">On a phone this opens your camera.</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) read(f.name);
                }}
              />
            </label>
            <div className="row between wrap">
              <span className="faint small">Demo: any file shows a sample GFS invoice. Your file never leaves your browser.</span>
              <button type="button" className="btn ghost sm" onClick={() => read('sample-gfs-invoice.jpg')}>
                Try the sample invoice
              </button>
            </div>
          </>
        ) : null}

        {step === 'reading' ? (
          <div className="empty" style={{ padding: 40 }}>
            <div className="spinner" aria-hidden="true" />
            <b style={{ color: 'var(--fg)' }}>Reading {file}…</b>
            <span className="small">Finding line items and matching them to your ingredients</span>
          </div>
        ) : null}

        {step === 'review' ? (
          <>
            <div className="row between wrap">
              <span>
                <b>{SAMPLE_INVOICE.supplier}</b> <span className="muted small">· {SAMPLE_INVOICE.number}</span>
              </span>
              <span className="pill good">✓ {lines.filter((l) => l.ing).length} lines matched</span>
            </div>
            <div className="table-wrap" style={{ margin: 0, border: '1px solid var(--line)', borderRadius: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <span className="sr-only">Update</span>
                    </th>
                    <th>On the invoice</th>
                    <th>Matched to</th>
                    <th className="r">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, n) => (
                    <tr key={l.text}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Update ${l.ing?.name ?? l.text}`}
                          checked={Boolean(keep[n]) && l.changed}
                          disabled={!l.changed}
                          onChange={(e) => setKeep((k) => ({ ...k, [n]: e.target.checked }))}
                        />
                      </td>
                      <td className="small" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {l.text}
                      </td>
                      <td>{l.ing?.name ?? <span className="bad">No match</span>}</td>
                      <td className="r num">
                        {l.ing && l.changed ? (
                          <>
                            <span className="faint" style={{ textDecoration: 'line-through' }}>
                              {money(l.ing.packPrice, true)}
                            </span>{' '}
                            <b className={l.packPrice > l.ing.packPrice ? 'bad' : 'good'}>{money(l.packPrice, true)}</b>
                          </>
                        ) : (
                          <span className="muted">{money(l.packPrice, true)} · no change</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={toApply.length === 0}
                onClick={() => {
                  dispatch({
                    type: 'applyInvoice',
                    supplier: SAMPLE_INVOICE.supplier.split(' ')[0],
                    updates: toApply.map((l) => ({ ingredientId: l.ingredientId, packPrice: l.packPrice })),
                  });
                  say(`${toApply.length} prices updated, margins recalculated`);
                  onClose();
                }}>
                Update {toApply.length} price{toApply.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
