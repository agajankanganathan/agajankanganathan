import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router';

import { PageHead, Segmented, useToast } from '../components/ui';
import { PLANS } from '../lib/sample';
import { useStore, type ThemePref } from '../state/store';

const SOURCES = [
  { name: 'Google reviews', detail: 'Read and reply to reviews' },
  { name: 'Instagram', detail: 'Comments and mentions' },
  { name: 'Point of sale', detail: 'Square, Toast or Lightspeed: sales, items and visits' },
];

export default function Settings() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const location = useLocation();
  const [name, setName] = useState(state.cafe.name);
  const [address, setAddress] = useState(state.cafe.address);

  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'setCafe', name: name.trim(), address: address.trim() });
    say('Café details saved');
  };

  return (
    <>
      <PageHead crumb="Account" title="Settings" sub="Your café, your team, your plan." />

      <div className="grid cols-2 start">
        <form className="card stack" onSubmit={save}>
          <div>
            <h2>Café details</h2>
            <p className="muted small">Shown across Sero and in review replies.</p>
          </div>
          <label className="field">
            Café name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            Address
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <button className="btn" type="submit" style={{ justifySelf: 'start' }}>
            Save changes
          </button>
        </form>

        <div className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <h2>Appearance</h2>
            <Segmented<ThemePref>
              label="Theme"
              value={state.theme}
              onChange={(theme) => dispatch({ type: 'setTheme', theme })}
              options={[
                { key: 'system', label: 'Match system' },
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ]}
            />
          </section>
          <section className="card stack">
            <h2>Learning Sero</h2>
            <div className="row wrap" style={{ gap: 8 }}>
              <button type="button" className="btn ghost sm" onClick={() => dispatch({ type: 'restartTour' })}>
                Replay product tour
              </button>
              <button
                type="button"
                className="btn ghost sm"
                disabled={!state.checklistHidden}
                onClick={() => {
                  dispatch({ type: 'hideChecklist', hidden: false });
                  say('Checklist is back on your Overview');
                }}>
                Show getting-started checklist
              </button>
            </div>
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <div>
              <h2>Team</h2>
              <p className="muted small">Growth includes 3 logins.</p>
            </div>
            <button type="button" className="btn ghost sm" disabled title="Available once Sero connects to real accounts">
              + Invite
            </button>
          </div>
          <ul className="list">
            <li>
              <span className="avatar sm">{state.user?.name.charAt(0)}</span>
              <span className="grow">
                <b>{state.user?.name}</b>
                <div className="muted small">{state.user?.email}</div>
              </span>
              <span className="pill neutral">Owner</span>
            </li>
            <li>
              <span className="avatar sm">J</span>
              <span className="grow">
                <b>Jamie (manager)</b>
                <div className="muted small">Invite pending</div>
              </span>
              <span className="pill neutral">Manager</span>
            </li>
          </ul>
        </section>

        <section className="card stack">
          <div>
            <h2>Connected sources</h2>
            <p className="muted small">Sero reads these together to find why customers leave.</p>
          </div>
          <ul className="list">
            {SOURCES.map((s) => (
              <li key={s.name}>
                <span className="grow">
                  <b>{s.name}</b>
                  <div className="muted small">{s.detail}</div>
                </span>
                <span className="pill neutral">Sample data</span>
              </li>
            ))}
          </ul>
          <p className="faint small">Real connections arrive with live accounts.</p>
        </section>
      </div>

      <section className="card stack" id="billing" style={{ scrollMarginTop: 90 }}>
        <div className="row between wrap">
          <div>
            <h2>Plan & billing</h2>
            <p className="muted small">You’re on a free trial of Growth: 11 days left. No card needed until you choose a plan. No contracts, cancel anytime.</p>
          </div>
          <span className="tag soft">Annual billing: 2 months free</span>
        </div>
        <div className="plans">
          {PLANS.map((p) => (
            <div key={p.id} className={`plan${p.id === 'growth' ? ' current' : ''}`}>
              <div className="row between">
                <h3>{p.name}</h3>
                {p.id === 'growth' ? <span className="tag">Current · trial</span> : null}
              </div>
              <div>
                <span className="price num">${p.price}</span> <span className="muted small">{p.unit}</span>
              </div>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn sm${p.id === 'growth' ? '' : ' ghost'}`}
                style={{ justifySelf: 'start', marginTop: 4 }}
                onClick={() => say('Billing is not connected in this demo')}>
                {p.id === 'growth' ? 'Keep Growth' : p.id === 'multi' ? 'Talk to us' : 'Switch to Starter'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card row between wrap">
        <div>
          <h2>Demo data</h2>
          <p className="muted small">Undo everything you’ve changed (promotions, menu edits, replies, rewards) and start fresh.</p>
        </div>
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            if (window.confirm('Reset all demo data? Your changes will be lost.')) {
              dispatch({ type: 'resetDemo' });
              say('Demo data reset');
            }
          }}>
          Reset demo data
        </button>
      </section>
    </>
  );
}
