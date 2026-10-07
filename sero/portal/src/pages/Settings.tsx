import { useState, type FormEvent } from 'react';

import { PageHead, Segmented, useToast } from '../components/ui';
import { useStore, type ThemePref } from '../state/store';

const SOURCES = [
  { name: 'Google reviews', detail: 'Read and reply to reviews' },
  { name: 'Instagram', detail: 'Comments and mentions' },
  { name: 'Point of sale (Square, Toast, Lightspeed)', detail: 'Sales, items and visits' },
];

export default function Settings() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const [name, setName] = useState(state.cafe.name);
  const [address, setAddress] = useState(state.cafe.address);

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'setCafe', name: name.trim(), address: address.trim() });
    say('Café details saved');
  };

  return (
    <>
      <PageHead title="Settings" />

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <form className="card stack" onSubmit={save}>
          <h2>Café details</h2>
          <label className="field">
            Café name
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            Address
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <button className="btn" type="submit" style={{ justifySelf: 'start' }}>
            Save
          </button>
        </form>

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
          <h2>Connected sources</h2>
          <p className="muted small">Sero reads these together to find why customers leave.</p>
          {SOURCES.map((s) => (
            <div key={s.name} className="row between">
              <div>
                <b>{s.name}</b>
                <p className="muted small">{s.detail}</p>
              </div>
              <button type="button" className="btn ghost sm" disabled title="Available once Sero connects to real accounts">
                Connect
              </button>
            </div>
          ))}
          <p className="muted small">Connections arrive with real accounts. This workspace runs on sample data.</p>
        </section>

        <section className="card stack">
          <h2>Demo data</h2>
          <p className="muted small">Undo everything you’ve changed (promotions, menu edits, replies, rewards) and start fresh.</p>
          <button
            type="button"
            className="btn danger"
            style={{ justifySelf: 'start' }}
            onClick={() => {
              if (window.confirm('Reset all demo data? Your changes will be lost.')) {
                dispatch({ type: 'resetDemo' });
                say('Demo data reset');
              }
            }}>
            Reset demo data
          </button>
        </section>
      </div>
    </>
  );
}
