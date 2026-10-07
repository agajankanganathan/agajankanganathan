import { useRef, useState, type FormEvent, type RefObject } from 'react';

import { money, projectedLift } from '@core/logic';
import { PROMOS } from '@core/sample-data';

import { PageHead, Stat, Switch, useToast } from '../components/ui';
import { newId } from '../lib/ids';
import { AUDIENCES, estimateWeeklyLift } from '../lib/promos';
import { useStore } from '../state/store';

const BUILT_IN = new Set(PROMOS.map((p) => p.id));

export default function Promotions() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const running = state.promos.filter((p) => p.on).length;
  const best = [...state.promos].filter((p) => p.on).sort((a, b) => b.weeklyLift - a.weeklyLift)[0];

  return (
    <>
      <PageHead title="Promotions" sub="Targeted offers for the guests you’re most at risk of losing, not blanket discounts.">
        <button type="button" className="btn" onClick={() => dialog.current?.showModal()}>
          + New promotion
        </button>
      </PageHead>

      <div className="grid cols-3">
        <Stat label="Running now" value={`${running} of ${state.promos.length}`} />
        <Stat label="Projected lift / week" value={`+${money(projectedLift(state.promos))}`} />
        <Stat label="Best performer" value={best ? best.name : '–'} />
      </div>

      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Offer</th>
                <th>Who it reaches</th>
                <th className="r">Est. lift / week</th>
                <th className="r">Running</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.promos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                  </td>
                  <td className="muted">{p.audience}</td>
                  <td className="r num">+{money(p.weeklyLift)}</td>
                  <td className="r">
                    <Switch
                      on={p.on}
                      label={`${p.name} running`}
                      onChange={() => {
                        dispatch({ type: 'togglePromo', id: p.id });
                        say(p.on ? `Paused “${p.name}”` : `“${p.name}” is live`);
                      }}
                    />
                  </td>
                  <td className="r">
                    {BUILT_IN.has(p.id) ? null : (
                      <button
                        type="button"
                        className="btn danger sm"
                        onClick={() => {
                          dispatch({ type: 'removePromo', id: p.id });
                          say('Promotion deleted');
                        }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NewPromo dialog={dialog} />
    </>
  );
}

function NewPromo({ dialog }: { dialog: RefObject<HTMLDialogElement | null> }) {
  const { dispatch } = useStore();
  const say = useToast();
  const [name, setName] = useState('');
  const [audienceId, setAudienceId] = useState(AUDIENCES[0].id);
  const [discount, setDiscount] = useState(15);
  const audience = AUDIENCES.find((a) => a.id === audienceId) ?? AUDIENCES[0];
  const lift = estimateWeeklyLift(audience, discount);

  const close = () => {
    dialog.current?.close();
    setName('');
    setDiscount(15);
    setAudienceId(AUDIENCES[0].id);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const title = name.trim() || `${discount}% off for ${audience.label.toLowerCase()}`;
    dispatch({
      type: 'addPromo',
      promo: {
        id: newId('promo'),
        name: title,
        audience: `${audience.size.toLocaleString('en-US')} guests · ${audience.label}`,
        weeklyLift: lift,
        on: true,
      },
    });
    say(`“${title}” is live`);
    close();
  };

  return (
    <dialog ref={dialog} aria-labelledby="new-promo-title" onClose={close}>
      <form onSubmit={submit}>
        <h2 id="new-promo-title" style={{ fontSize: 22 }}>
          New promotion
        </h2>
        <label className="field">
          <span>
            Name <span className="muted small">(optional)</span>
          </span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Come back for 15% off" />
        </label>
        <label className="field">
          Who should get it?
          <select className="input" value={audienceId} onChange={(e) => setAudienceId(e.target.value)}>
            {AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} ({a.size.toLocaleString('en-US')})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Discount: {discount}%
          <input type="range" min={5} max={50} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </label>
        <div className="card ai">
          <p className="small muted">Projected extra revenue per week</p>
          <p style={{ fontSize: 26, fontWeight: 600 }} className="good">
            +{money(lift)}
          </p>
          <p className="small muted">
            Estimate from audience size, how often these guests come back, average spend ($11.40) and the discount.
          </p>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn">
            Launch promotion
          </button>
        </div>
      </form>
    </dialog>
  );
}
