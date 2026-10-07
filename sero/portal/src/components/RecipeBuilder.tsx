import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { marginBand, marginPct, money } from '@core/logic';

import { lineCost, recipeCost, suggestPrice, UNITS, unitsFor, type Recipe, type RecipeLine, type Unit } from '../lib/costing';
import { INGREDIENT_GROUPS, TEMPLATES } from '../lib/ingredients';
import { useStore } from '../state/store';
import { Icon } from './icons';
import { IngredientDialog } from './IngredientDialog';
import { InfoTip, useToast } from './ui';

export function RecipeBuilder({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const panel = useRef<HTMLDivElement>(null);
  const item = state.menu.find((m) => m.id === itemId);
  const saved = state.recipes[itemId];
  const [draft, setDraft] = useState<Recipe>(() => saved ?? { portions: 1, lines: [] });
  const [adding, setAdding] = useState<number | null>(null); // line index waiting for a new ingredient
  const ings = state.ingredients;

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Let an open dialog handle its own Escape first.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item) return null;

  const cost = recipeCost(draft, ings);
  const mg = marginPct(item.price, cost);
  const band = marginBand(mg);
  const target = state.targetMargin;
  const sp = suggestPrice(cost, target);
  const total = draft.lines.reduce((t, l) => t + lineCost(l, ings), 0) || 1;

  const setLine = (i: number, patch: Partial<RecipeLine>) =>
    setDraft((d) => ({ ...d, lines: d.lines.map((l, n) => (n === i ? { ...l, ...patch } : l)) }));
  const pickIngredient = (i: number, id: string) => {
    if (id === '__new') return setAdding(i);
    const ing = ings.find((x) => x.id === id);
    if (!ing) return;
    const dim = UNITS[ing.packUnit].dim;
    const unit: Unit = dim === 'mass' ? 'g' : dim === 'volume' ? 'ml' : 'each';
    setLine(i, { ingredientId: id, unit: UNITS[draft.lines[i].unit].dim === dim ? draft.lines[i].unit : unit });
  };
  const addLine = () => {
    const first = ings[0];
    if (!first) return setAdding(draft.lines.length);
    setDraft((d) => ({ ...d, lines: [...d.lines, { ingredientId: '', qty: 1, unit: 'g' }] }));
  };

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const lines = t.lines.filter((l) => ings.some((i) => i.id === l.ingredientId));
    setDraft({ portions: t.portions, lines });
    say(`Started from “${t.name}”. Adjust the amounts to match how you make it.`);
  };

  const save = () => {
    const clean = { ...draft, lines: draft.lines.filter((l) => l.ingredientId && l.qty > 0) };
    dispatch({ type: 'setRecipe', itemId, recipe: clean });
    say(clean.lines.length ? `Recipe saved. ${item.name} now costs ${money(recipeCost(clean, ings), true)} to make` : 'Recipe removed');
    onClose();
  };

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <div ref={panel} className="drawer glass recipe" role="dialog" aria-modal="true" aria-labelledby="recipe-title" tabIndex={-1}>
        <div className="row between">
          <div>
            <span className="crumb">Recipe</span>
            <h2 id="recipe-title" style={{ fontSize: 22 }}>
              {item.name}
            </h2>
            <span className="muted small">Sells for {money(item.price, true)}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <label className="field">
          <span>
            Start from a template <span className="hint">typical café amounts, then adjust</span>
          </span>
          <select className="input" value="" onChange={(e) => applyTemplate(e.target.value)}>
            <option value="" disabled>
              Choose a starter recipe…
            </option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}: {t.note}
              </option>
            ))}
          </select>
        </label>

        <div className="stack" style={{ gap: 8 }}>
          <div className="row between">
            <h3>Ingredients per {draft.portions > 1 ? 'batch' : 'serving'}</h3>
            <span className="faint small">Cost</span>
          </div>
          {draft.lines.length === 0 ? <p className="muted small">No ingredients yet. Pick a template or add them one by one.</p> : null}
          {draft.lines.map((l, i) => {
            const ing = ings.find((x) => x.id === l.ingredientId);
            const c = lineCost(l, ings);
            return (
              <div key={i} className="recipe-line">
                <select className="input" aria-label={`Ingredient ${i + 1}`} value={l.ingredientId} onChange={(e) => pickIngredient(i, e.target.value)}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {INGREDIENT_GROUPS.map((g) => (
                    <optgroup key={g} label={g}>
                      {ings
                        .filter((x) => x.group === g)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  <option value="__new">+ New ingredient…</option>
                </select>
                <input
                  className="input num"
                  inputMode="decimal"
                  aria-label={`Amount of ${ing?.name ?? 'ingredient'}`}
                  value={l.qty}
                  onChange={(e) => setLine(i, { qty: Number(e.target.value.replace(',', '.')) || 0 })}
                />
                <select className="input" aria-label="Unit" value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value as Unit })} disabled={!ing}>
                  {(ing ? unitsFor(UNITS[ing.packUnit].dim) : (['g'] as Unit[])).map((u) => (
                    <option key={u} value={u}>
                      {UNITS[u].label}
                    </option>
                  ))}
                </select>
                <span className="num r" style={{ minWidth: 56 }}>
                  {money(c, true)}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${ing?.name ?? 'line'}`}
                  onClick={() => setDraft((d) => ({ ...d, lines: d.lines.filter((_, n) => n !== i) }))}>
                  <Icon name="trash" />
                </button>
                {c > 0 ? (
                  <div className="share" aria-hidden="true">
                    <i style={{ width: `${(c / total) * 100}%` }} />
                  </div>
                ) : null}
              </div>
            );
          })}
          <button type="button" className="btn ghost sm" style={{ justifySelf: 'start' }} onClick={addLine}>
            <Icon name="plus" size={14} /> Add ingredient
          </button>
        </div>

        <label className="field">
          <span>
            Servings from this recipe
            <InfoTip>For batch recipes. A loaf cut into 8 slices is 8 servings, so each slice costs ⅛ of the ingredients. Leave at 1 for drinks and single plates.</InfoTip>
          </span>
          <input
            className="input num"
            style={{ width: 120 }}
            inputMode="numeric"
            value={draft.portions}
            onChange={(e) => setDraft((d) => ({ ...d, portions: Math.max(1, Math.round(Number(e.target.value) || 1)) }))}
          />
        </label>

        <div className="card ai stack" style={{ padding: 16, gap: 8 }} aria-live="polite">
          <div className="kv" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div>
              <small>Cost to make</small>
              <b className="num">{money(cost, true)}</b>
            </div>
            <div>
              <small>Margin</small>
              <b className={band === 'healthy' ? 'good' : band === 'low' ? 'bad' : ''}>{Math.round(mg)}%</b>
            </div>
            <div>
              <small>Profit / item</small>
              <b className="num">{money(item.price - cost, true)}</b>
            </div>
          </div>
          {draft.lines.length > 0 && mg < target && sp > item.price ? (
            <div className="row between wrap">
              <span className="small">
                Below your {target}% target. Selling at <b>{money(sp, true)}</b> gets you there.
              </span>
              <button
                type="button"
                className="btn sm"
                onClick={() => {
                  dispatch({ type: 'setPrice', itemId, price: sp });
                  say(`${item.name} is now ${money(sp, true)}`);
                }}>
                Use {money(sp, true)}
              </button>
            </div>
          ) : draft.lines.length > 0 ? (
            <span className="good small">✓ On target ({target}%+).</span>
          ) : null}
        </div>

        <div className="row between wrap" style={{ marginTop: 'auto' }}>
          <Link className="link small" to="/ingredients" onClick={onClose}>
            Manage ingredients →
          </Link>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={save}>
              Save recipe
            </button>
          </div>
        </div>
      </div>

      <IngredientDialog
        open={adding !== null}
        onClose={() => setAdding(null)}
        onSaved={(ing) => {
          const i = adding ?? draft.lines.length;
          const dim = UNITS[ing.packUnit].dim;
          const unit: Unit = dim === 'mass' ? 'g' : dim === 'volume' ? 'ml' : 'each';
          setDraft((d) => {
            const lines = [...d.lines];
            lines[i] = { ingredientId: ing.id, qty: 1, unit };
            return { ...d, lines };
          });
        }}
      />
    </>
  );
}
