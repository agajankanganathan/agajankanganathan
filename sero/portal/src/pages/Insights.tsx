import { type CSSProperties } from 'react';
import { Link } from 'react-router';

import { DRIVERS, FUNNEL } from '@core/sample-data';
import type { ModuleKey } from '@core/types';

import { PageHead } from '../components/ui';
import { useStore } from '../state/store';

const ROUTE: Record<ModuleKey, string> = {
  insights: '/insights',
  promos: '/promotions',
  loyalty: '/loyalty',
  menu: '/menu',
  reviews: '/reviews',
};

export default function Insights() {
  const { state, dispatch } = useStore();
  const driver = DRIVERS.find((d) => d.id === state.driverId) ?? DRIVERS[0];
  const max = DRIVERS[0].share;

  return (
    <>
      <PageHead title="Customer insights" sub="Why guests don’t come back, ranked by lost visits. Read from reviews, visit patterns and feedback." />

      <div className="grid cols-2">
        <section className="card">
          <div className="card-head">
            <h2>Why customers leave</h2>
            <span className="muted small">Share of lost visits</span>
          </div>
          <ul className="hbars">
            {DRIVERS.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="hbar"
                  aria-pressed={d.id === driver.id}
                  style={{ '--w': `${(d.share / max) * 100}%` } as CSSProperties}
                  onClick={() => dispatch({ type: 'selectDriver', id: d.id })}>
                  <span>{d.name}</span>
                  <b className="num">{d.share}%</b>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card ai stack" aria-live="polite">
          <span className="tag" style={{ justifySelf: 'start' }}>
            ✦ AI insight
          </span>
          <h2 style={{ fontSize: 20 }}>{driver.name}</h2>
          <p>{driver.detail}</p>
          <p>
            <b>Suggested fix:</b> {driver.fix}
          </p>
          {driver.action ? (
            <Link className="btn sm" style={{ justifySelf: 'start' }} to={ROUTE[driver.action.module]}>
              {driver.action.label} →
            </Link>
          ) : null}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Customer journey</h2>
          <span className="muted small">Last 30 days</span>
        </div>
        <ol className="hbars">
          {FUNNEL.map((f, i) => (
            <li key={f.label} className="hbar" style={{ '--w': `${Math.max(6, (f.count / FUNNEL[0].count) * 100)}%` } as CSSProperties}>
              <span>
                {f.label}
                {i > 0 ? <span className="sub">{Math.round((f.count / FUNNEL[i - 1].count) * 100)}% of the step before</span> : null}
              </span>
              <b className="num">{f.count.toLocaleString('en-US')}</b>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
