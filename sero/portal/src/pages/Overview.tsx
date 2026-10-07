import { Link } from 'react-router';

import { greeting, marginPct, money, projectedLift, weeklyProfit } from '@core/logic';
import { DRIVERS, RANGES } from '@core/sample-data';
import type { RangeKey } from '@core/types';

import { BarChart } from '../components/BarChart';
import { Icon, type IconName } from '../components/icons';
import { PageHead, Segmented, Sparkline, Stat, timeAgo } from '../components/ui';
import { useAttention, useStore } from '../state/store';

export const KPI_TIPS: Record<string, string> = {
  Revenue: 'Total sales across all orders in the selected period, compared with the period before.',
  Customers: 'Unique guests who visited: card payments, loyalty members and estimated cash customers.',
  'Return rate': 'Share of guests who came back within 30 days of a visit. Higher means people like coming back.',
  'Revenue at risk': 'Estimated monthly spend from regulars who are visiting less than usual. Going down is good.',
};

// Sample 8-period trends behind each KPI's sparkline.
const TRENDS: Record<string, number[]> = {
  Revenue: [7100, 7350, 7240, 7600, 7820, 7930, 8050, 8420],
  Customers: [1120, 1150, 1170, 1160, 1210, 1230, 1240, 1284],
  'Return rate': [31, 32, 32, 34, 35, 35, 36, 38],
  'Revenue at risk': [1620, 1580, 1490, 1450, 1400, 1310, 1260, 1150],
};

const KIND_ICON: Record<string, IconName> = { promo: 'promos', reward: 'gift', reply: 'reviews', menu: 'menu', settings: 'settings', cost: 'box' };

export default function Overview() {
  const { state, dispatch } = useStore();
  const { atRisk, toAnswer, promosRunning, priceAlerts } = useAttention();
  const R = RANGES[state.range];
  const top = DRIVERS[0];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const topItems = [...state.menu]
    .filter((m) => m.available)
    .sort((a, b) => weeklyProfit(b) - weeklyProfit(a))
    .slice(0, 4);

  const kinds = new Set(state.activity.map((a) => a.kind));
  const tasks = [
    { done: state.visited.includes('/insights'), title: 'See why customers leave', sub: 'Open Customer insights and check the top reason.', to: '/insights' },
    { done: Object.keys(state.replies).length > 0, title: 'Reply to a review', sub: 'Pick a tone, tweak the draft and post it.', to: '/reviews?filter=open' },
    { done: kinds.has('promo'), title: 'Launch a promotion', sub: 'Target guests who haven’t visited in 30+ days.', to: '/promotions?new=1' },
    { done: kinds.has('menu'), title: 'Check your menu margins', sub: 'Open an item’s recipe or change a price and watch the margin update.', to: '/menu' },
    { done: kinds.has('cost'), title: 'Update an ingredient price', sub: 'Change a supplier price, or scan an invoice, and see every margin follow.', to: '/ingredients' },
    { done: state.rewardsSent.length > 0, title: 'Win back a regular', sub: 'Send a free drink to someone drifting away.', to: '/loyalty?filter=risk' },
    { done: kinds.has('settings'), title: 'Add your café details', sub: 'Your name and address appear across Sero.', to: '/settings' },
  ];
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <>
      <PageHead crumb={today} title={`${greeting()}, ${state.user?.name.split(' ')[0]}`} sub={`Here’s how ${state.cafe.name} is doing.`}>
        <Segmented<RangeKey>
          label="Date range"
          value={state.range}
          onChange={(range) => dispatch({ type: 'setRange', range })}
          options={[
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
          ]}
        />
        <Link className="btn" to="/promotions?new=1">
          + New promotion
        </Link>
      </PageHead>

      <div className="grid cols-4" data-tour="kpis">
        {R.kpis.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} delta={k.delta} good={k.good} tip={KPI_TIPS[k.label]}>
            <div style={{ marginTop: 8 }}>
              <Sparkline values={TRENDS[k.label]} label={`${k.label} trend, last 8 periods`} />
            </div>
          </Stat>
        ))}
      </div>

      <div className="grid split">
        <section className="card">
          <div className="card-head">
            <div>
              <h2>Revenue</h2>
              <p className="muted small">{state.range === '7d' ? 'By day, this week' : 'By week, last 4 weeks'} · hover a bar for details</p>
            </div>
            <span className="tag soft">{R.kpis[0].delta}</span>
          </div>
          <BarChart title="Revenue" values={R.bars} labels={R.labels} />
        </section>

        <section className="card" data-tour="attention">
          <div className="card-head">
            <h2>Needs your attention</h2>
            <span className="pill neutral">{toAnswer + atRisk + priceAlerts} to do</span>
          </div>
          <div className="list">
            {priceAlerts ? (
              <Attn to="/ingredients" icon="alert" tone="bad" title="Supplier prices went up" sub="Some items may be below your target margin" value={priceAlerts} />
            ) : null}
            <Attn to="/reviews?filter=open" icon="reviews" tone={toAnswer ? 'bad' : 'good'} title="Reviews waiting for a reply" sub="Reply within a day to protect your rating" value={toAnswer} />
            <Attn to="/loyalty?filter=risk" icon="gift" tone={atRisk ? 'bad' : 'good'} title="Regulars at risk of leaving" sub="Visiting much less than usual" value={atRisk} />
            <Attn to="/promotions" icon="promos" title="Promotions running" sub={`Projected +${money(projectedLift(state.promos))} this week`} value={promosRunning} />
            <Attn to="/insights" icon="insights" title="Top reason guests leave" sub={top.name} value={`${top.share}%`} />
          </div>
        </section>
      </div>

      <div className="grid split start">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card hero stack">
            <span className="tag" style={{ justifySelf: 'start', background: 'rgba(255,245,235,.16)' }}>
              ✦ Biggest opportunity this week
            </span>
            <h2 style={{ fontSize: 22 }}>{top.name}</h2>
            <p className="muted">{top.detail}</p>
            <div className="row wrap">
              <span>
                <b>Suggested fix:</b> {top.fix}
              </span>
            </div>
            <Link className="btn" style={{ justifySelf: 'start', background: 'var(--linen)', color: 'var(--mahogany)' }} to="/insights">
              See the evidence →
            </Link>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Top earners this week</h2>
              <Link className="link small" to="/menu">
                Open menu →
              </Link>
            </div>
            <ul className="list">
              {topItems.map((m, n) => (
                <li key={m.id}>
                  <span className="ico-circle" style={{ fontWeight: 700 }}>
                    {n + 1}
                  </span>
                  <div className="grow">
                    <b>{m.name}</b>
                    <div className="muted small">
                      {m.sold} sold · {Math.round(marginPct(m.price, m.cost))}% margin
                    </div>
                  </div>
                  <b className="num">{money(weeklyProfit(m))}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="stack" style={{ gap: 16 }}>
          {!state.checklistHidden ? (
            <section className="card" data-tour="checklist">
              <div className="card-head">
                <div>
                  <h2>Getting started</h2>
                  <p className="muted small">
                    {doneCount} of {tasks.length} done
                  </p>
                </div>
                <button type="button" className="link small" onClick={() => dispatch({ type: 'hideChecklist', hidden: true })}>
                  Hide
                </button>
              </div>
              <div className="progress" style={{ marginBottom: 14 }} role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={tasks.length} aria-label="Setup progress">
                <i style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
              </div>
              <ul className="list checklist">
                {tasks.map((t) => (
                  <li key={t.title} className={t.done ? 'done' : ''}>
                    <span className={`check${t.done ? ' done' : ''}`} aria-hidden="true">
                      ✓
                    </span>
                    <div className="grow">
                      <b>{t.title}</b>
                      <div className="muted small">{t.sub}</div>
                    </div>
                    {t.done ? (
                      <span className="sr-only">Done</span>
                    ) : (
                      <Link className="btn ghost sm" to={t.to}>
                        Start
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              {doneCount === tasks.length ? <p className="good small" style={{ marginTop: 12 }}>🎉 All done, you know your way around Sero.</p> : null}
            </section>
          ) : null}

          <section className="card">
            <div className="card-head">
              <h2>Recent activity</h2>
            </div>
            {state.activity.length === 0 ? (
              <div className="empty small">
                <Icon name="overview" size={22} />
                Things you do in Sero show up here: replies, promotions, rewards and menu changes.
              </div>
            ) : (
              <ul className="list">
                {state.activity.slice(0, 6).map((a) => (
                  <li key={a.id}>
                    <span className="ico-circle">
                      <Icon name={KIND_ICON[a.kind]} />
                    </span>
                    <span className="grow">{a.text}</span>
                    <span className="faint small">{timeAgo(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Attn({ to, icon, title, sub, value, tone }: { to: string; icon: IconName; title: string; sub: string; value: number | string; tone?: 'good' | 'bad' }) {
  return (
    <Link to={to} className="attn">
      <span className={`ico-circle${tone ? ` ${tone}` : ''}`}>
        <Icon name={icon} />
      </span>
      <span className="grow">
        <b style={{ display: 'block' }}>{title}</b>
        <span className="muted small">{sub}</span>
      </span>
      <b className="num" style={{ fontSize: 20 }}>
        {value}
      </b>
    </Link>
  );
}
