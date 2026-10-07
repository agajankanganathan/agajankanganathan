import { type CSSProperties } from 'react';
import { Link } from 'react-router';

import { DRIVERS, FUNNEL } from '@core/sample-data';
import type { ModuleKey } from '@core/types';

import { InfoTip, PageHead, Sparkline } from '../components/ui';
import { DRIVER_EVIDENCE } from '../lib/sample';
import { useStore } from '../state/store';

const ROUTE: Record<ModuleKey, string> = {
  insights: '/insights',
  promos: '/promotions?new=1',
  loyalty: '/loyalty',
  menu: '/menu',
  reviews: '/reviews',
};

export default function Insights() {
  const { state, dispatch } = useStore();
  const driver = DRIVERS.find((d) => d.id === state.driverId) ?? DRIVERS[0];
  const ev = DRIVER_EVIDENCE[driver.id];
  const max = DRIVERS[0].share;
  const change = Math.round(((ev.weekly[3] - ev.weekly[2]) / ev.weekly[2]) * 100);

  return (
    <>
      <PageHead
        crumb="Grow"
        title="Customer insights"
        sub="Sero reads your reviews, visit patterns and feedback together, then ranks the reasons guests don’t come back."
      />

      <div className="grid split-r start">
        <section className="card" data-tour="drivers">
          <div className="card-head">
            <div>
              <h2>
                Why customers leave
                <InfoTip>Each reason’s share of lost visits in the last 30 days. A “lost visit” is a regular who came less often than usual.</InfoTip>
              </h2>
              <p className="muted small">Share of lost visits · click a reason</p>
            </div>
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
          <div className="row between wrap">
            <span className="tag">✦ AI insight</span>
            <span className="faint small">Based on {ev.sources}</span>
          </div>
          <h2 style={{ fontSize: 22 }}>{driver.name}</h2>
          <p>{driver.detail}</p>

          <div className="grid cols-2">
            <div className="card" style={{ padding: 14 }}>
              <div className="row between">
                <span className="muted small">Mentions per week</span>
                <span className={`pill ${change > 0 ? 'bad' : 'good'}`}>
                  {change > 0 ? '▲' : '▼'} {Math.abs(change)}%
                </span>
              </div>
              <b style={{ fontSize: 24 }}>{ev.weekly[3]}</b>
              <Sparkline values={ev.weekly} label={`Mentions per week: ${ev.weekly.join(', ')}`} />
            </div>
            <div className="card" style={{ padding: 14 }}>
              <span className="muted small">Share of lost visits</span>
              <b style={{ fontSize: 24, display: 'block' }}>{driver.share}%</b>
              <span className="muted small">
                #{DRIVERS.indexOf(driver) + 1} of {DRIVERS.length} reasons
              </span>
            </div>
          </div>

          <div className="stack" style={{ gap: 8 }}>
            <h3>What guests are saying</h3>
            {ev.quotes.map((q) => (
              <p key={q} className="quote">
                “{q}”
              </p>
            ))}
          </div>

          <div className="card" style={{ padding: 14 }}>
            <h3>Suggested fix</h3>
            <p style={{ marginTop: 4 }}>{driver.fix}</p>
          </div>
          {driver.action ? (
            <Link className="btn" style={{ justifySelf: 'start' }} to={ROUTE[driver.action.module]}>
              {driver.action.label} →
            </Link>
          ) : null}
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>
              Customer journey
              <InfoTip>How many people moved through each stage in the last 30 days. The biggest drop is where you lose the most customers.</InfoTip>
            </h2>
            <p className="muted small">Last 30 days · from discovering you to becoming a regular</p>
          </div>
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
        <p className="muted small" style={{ marginTop: 12 }}>
          💡 Only {Math.round((FUNNEL[2].count / FUNNEL[1].count) * 100)}% of first-time visitors come back within 30 days. A welcome-back offer for first-timers is the fastest way to lift this.{' '}
          <Link className="link" to="/promotions?new=1">
            Create one →
          </Link>
        </p>
      </section>
    </>
  );
}
