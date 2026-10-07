import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { useSearchParams } from 'react-router';

import { money, projectedLift } from '@core/logic';
import { PROMOS } from '@core/sample-data';

import { InfoTip, PageHead, Segmented, Stat, Switch, useToast } from '../components/ui';
import { newId } from '../lib/ids';
import { AUDIENCES, AVG_TICKET, estimateWeeklyLift } from '../lib/promos';
import { useStore } from '../state/store';

const BUILT_IN = new Set(PROMOS.map((p) => p.id));
type Filter = 'all' | 'on' | 'off';

export default function Promotions() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');

  // /promotions?new=1 opens the create dialog (used by links across the app).
  useEffect(() => {
    if (params.get('new')) {
      dialog.current?.showModal();
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const running = state.promos.filter((p) => p.on);
  const best = [...running].sort((a, b) => b.weeklyLift - a.weeklyLift)[0];
  const rows = state.promos.filter((p) => filter === 'all' || (filter === 'on' ? p.on : !p.on));

  return (
    <>
      <PageHead crumb="Grow" title="Promotions" sub="Targeted offers for the guests you’re most likely to lose, instead of blanket discounts for everyone.">
        <button type="button" className="btn" data-tour="new-promo" onClick={() => dialog.current?.showModal()}>
          + New promotion
        </button>
      </PageHead>

      <div className="grid cols-3">
        <Stat label="Running now" value={`${running.length} of ${state.promos.length}`} />
        <Stat
          label="Projected lift / week"
          value={`+${money(projectedLift(state.promos))}`}
          tip="Extra revenue Sero expects from the promotions currently running, based on who they reach and how those guests usually behave."
        />
        <Stat label="Best performer" value={best ? best.name : '–'} />
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Your promotions</h2>
          <Segmented<Filter>
            label="Filter promotions"
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'all', label: 'All', count: state.promos.length },
              { key: 'on', label: 'Running', count: running.length },
              { key: 'off', label: 'Paused', count: state.promos.length - running.length },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Offer</th>
                <th>Who it reaches</th>
                <th>Status</th>
                <th className="r">Est. lift / week</th>
                <th className="r">On / off</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    {BUILT_IN.has(p.id) ? null : <span className="tag soft" style={{ marginLeft: 8 }}>New</span>}
                  </td>
                  <td className="muted">{p.audience}</td>
                  <td>
                    <span className={`pill ${p.on ? 'good' : 'neutral'}`}>{p.on ? '● Running' : 'Paused'}</span>
                  </td>
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No {filter === 'on' ? 'running' : 'paused'} promotions.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card grid cols-3">
        <div>
          <h3>1. Pick who it’s for</h3>
          <p className="muted small">Lapsed guests, regulars, first-timers or members. Smaller, specific groups convert best.</p>
        </div>
        <div>
          <h3>2. Choose the discount</h3>
          <p className="muted small">Sero estimates the weekly lift as you go. Bigger discounts bring more people in but earn less per visit.</p>
        </div>
        <div>
          <h3>3. Launch and watch</h3>
          <p className="muted small">It goes live straight away. Pause it with the switch any time, and track it on your Overview.</p>
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
    const title = name.trim() || `${discount}% off: ${audience.label}`;
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
        <div>
          <h2 id="new-promo-title" style={{ fontSize: 22 }}>
            New promotion
          </h2>
          <p className="muted small">Goes live as soon as you launch it. You can pause it any time.</p>
        </div>
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
          <span className="row between">
            <span>Discount</span>
            <b className="num">{discount}%</b>
          </span>
          <input type="range" min={5} max={50} step={5} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </label>
        <label className="field">
          <span>
            Name <span className="hint">(optional)</span>
          </span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={`${discount}% off: ${audience.label}`} />
        </label>
        <div className="card ai" style={{ padding: 16 }}>
          <span className="muted small">
            Projected extra revenue per week
            <InfoTip>
              {audience.size.toLocaleString('en-US')} guests × how likely they are to come in because of the offer × average spend (${AVG_TICKET.toFixed(2)}) × what you keep after
              the {discount}% discount.
            </InfoTip>
          </span>
          <p style={{ fontSize: 28, fontWeight: 600 }} className="good num">
            +{money(lift)}
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
