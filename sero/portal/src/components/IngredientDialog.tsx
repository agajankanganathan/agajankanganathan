import { useEffect, useRef, useState, type FormEvent } from 'react';

import { money } from '@core/logic';

import { costPerBase, packBaseQty, UNITS, type Ingredient, type Unit } from '../lib/costing';
import { newId } from '../lib/ids';
import { INGREDIENT_GROUPS } from '../lib/ingredients';
import { useStore } from '../state/store';
import { InfoTip, useToast } from './ui';

const BLANK = { name: '', supplier: '', group: INGREDIENT_GROUPS[0], packCount: '1', packSize: '1', packUnit: 'kg' as Unit, packPrice: '', wastePct: '0' };

/** Add or edit an ingredient exactly as it appears on the supplier invoice. Open by passing `open`. */
export function IngredientDialog({
  open,
  ingredient,
  onClose,
  onSaved,
}: {
  open: boolean;
  ingredient?: Ingredient | null;
  onClose: () => void;
  onSaved?: (ingredient: Ingredient) => void;
}) {
  const { dispatch } = useStore();
  const say = useToast();
  const ref = useRef<HTMLDialogElement>(null);
  const [f, setF] = useState(BLANK);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setF(
        ingredient
          ? {
              name: ingredient.name,
              supplier: ingredient.supplier,
              group: ingredient.group,
              packCount: String(ingredient.packCount),
              packSize: String(ingredient.packSize),
              packUnit: ingredient.packUnit,
              packPrice: ingredient.packPrice.toFixed(2),
              wastePct: String(ingredient.wastePct),
            }
          : BLANK
      );
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, ingredient]);

  const n = (v: string) => Number(v.replace(',', '.'));
  const draft: Ingredient = {
    id: ingredient?.id ?? '',
    name: f.name.trim(),
    supplier: f.supplier.trim(),
    group: f.group,
    packCount: n(f.packCount),
    packSize: n(f.packSize),
    packUnit: f.packUnit,
    packPrice: n(f.packPrice),
    wastePct: Math.min(90, Math.max(0, n(f.wastePct) || 0)),
    history: ingredient?.history ?? [],
  };
  const valid = draft.name !== '' && draft.packCount > 0 && draft.packSize > 0 && draft.packPrice > 0;
  const base = UNITS[f.packUnit].dim === 'mass' ? 'kg' : UNITS[f.packUnit].dim === 'volume' ? 'L' : 'each';
  const per = valid ? costPerBase(draft) * (base === 'each' ? 1 : 1000) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const id = ingredient?.id ?? newId('ing');
    dispatch({ type: 'saveIngredient', ingredient: { ...draft, id } });
    say(ingredient ? `${draft.name} updated` : `${draft.name} added`);
    onSaved?.({ ...draft, id });
    onClose();
  };

  const set = (k: keyof typeof BLANK) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <dialog ref={ref} aria-labelledby="ing-title" onClose={onClose} style={{ width: 'min(560px, calc(100% - 32px))' }}>
      <form onSubmit={submit}>
        <div>
          <h2 id="ing-title" style={{ fontSize: 22 }}>
            {ingredient ? `Edit ${ingredient.name}` : 'Add an ingredient'}
          </h2>
          <p className="muted small">Enter it the way you buy it, straight from the invoice. Sero works out the cost per gram, ml or piece.</p>
        </div>
        <div className="grid cols-2">
          <label className="field">
            Ingredient
            <input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Oat milk (barista)" required />
          </label>
          <label className="field">
            <span>
              Supplier <span className="hint">optional</span>
            </span>
            <input className="input" value={f.supplier} onChange={set('supplier')} placeholder="e.g. GFS" />
          </label>
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 6 }}>
            What you buy
            <InfoTip>Example: a case of 12 one-litre cartons is 12 × 1 L. A 1 kg bag of beans is 1 × 1 kg. A box of 48 avocados is 48 × 1 each.</InfoTip>
          </legend>
          <div className="row wrap" style={{ gap: 8 }}>
            <input className="input" style={{ width: 80 }} inputMode="decimal" aria-label="Number of units in the pack" value={f.packCount} onChange={set('packCount')} />
            <span className="muted">×</span>
            <input className="input" style={{ width: 90 }} inputMode="decimal" aria-label="Size of each unit" value={f.packSize} onChange={set('packSize')} />
            <select className="input" style={{ width: 96 }} aria-label="Unit" value={f.packUnit} onChange={set('packUnit')}>
              {(Object.keys(UNITS) as Unit[]).map((u) => (
                <option key={u} value={u}>
                  {UNITS[u].label}
                </option>
              ))}
            </select>
            <span className="muted">for</span>
            <span className="money" style={{ width: 120 }}>
              <input className="input" inputMode="decimal" aria-label="Pack price" value={f.packPrice} onChange={set('packPrice')} placeholder="0.00" />
            </span>
          </div>
        </fieldset>

        <div className="grid cols-2">
          <label className="field">
            <span>
              Waste
              <InfoTip>What you lose before it reaches the cup or plate: milk left in the jug, avocado skin and stone, trimmings. Typical: milk 5%, avocado 30%, most dry goods 0%.</InfoTip>
            </span>
            <span style={{ position: 'relative' }}>
              <input className="input" inputMode="decimal" value={f.wastePct} onChange={set('wastePct')} style={{ paddingRight: 30 }} />
              <span className="muted" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                %
              </span>
            </span>
          </label>
          <label className="field">
            Category
            <select className="input" value={f.group} onChange={set('group')}>
              {INGREDIENT_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="card ai" style={{ padding: 14 }} aria-live="polite">
          {valid ? (
            <>
              <span className="muted small">Your real cost (after {draft.wastePct}% waste)</span>
              <p style={{ fontSize: 24, fontWeight: 600 }} className="num">
                {money(per, true)} <span style={{ fontSize: 15, fontWeight: 400 }}>{base === 'each' ? 'each' : `per ${base}`}</span>
              </p>
              <span className="muted small">
                {packBaseQty(draft).toLocaleString('en-US')} {UNITS[f.packUnit].dim === 'mass' ? 'g' : UNITS[f.packUnit].dim === 'volume' ? 'ml' : 'pieces'} per purchase
              </span>
            </>
          ) : (
            <span className="muted small">Fill in the pack size and price to see the cost per unit.</span>
          )}
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={!valid}>
            {ingredient ? 'Save changes' : 'Add ingredient'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
