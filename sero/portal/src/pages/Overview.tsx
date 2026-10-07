import { Link } from 'react-router';

import { greeting, money, projectedLift } from '@core/logic';
import { DRIVERS, RANGES } from '@core/sample-data';
import type { RangeKey } from '@core/types';

import { BarChart } from '../components/BarChart';
import { PageHead, Segmented, Stat } from '../components/ui';
import { useAttention, useStore } from '../state/store';

export default function Overview() {
  const { state, dispatch } = useStore();
  const { atRisk, toAnswer, promosRunning } = useAttention();
  const R = RANGES[state.range];
  const top = DRIVERS[0];

  return (
    <>
      <PageHead title={`${greeting()}, ${state.user?.name.split(' ')[0]}`} sub={`Here’s how ${state.cafe.name} is doing.`}>
        <Segmented<RangeKey>
          label="Date range"
          value={state.range}
          onChange={(range) => dispatch({ type: 'setRange', range })}
          options={[
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
          ]}
        />
      </PageHead>

      <div className="grid cols-4">
        {R.kpis.map((k) => (
          <Stat key={k.label} label={k.label} value={k.value} delta={k.delta} good={k.good} />
        ))}
      </div>

      <div className="grid split">
        <section className="card">
          <div className="card-head">
            <h2>Revenue</h2>
            <span className="muted small">{state.range === '7d' ? 'By day' : 'By week'}</span>
          </div>
          <BarChart title="Revenue" values={R.bars} labels={R.labels} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Needs your attention</h2>
          </div>
          <div className="attn">
            <Link to="/reviews">
              <span>Reviews waiting for a reply</span>
              <b className="num">{toAnswer}</b>
            </Link>
            <Link to="/loyalty">
              <span>Regulars at risk of leaving</span>
              <b className="num">{atRisk}</b>
            </Link>
            <Link to="/promotions">
              <span>Promotions running</span>
              <b className="num">{promosRunning}</b>
            </Link>
            <Link to="/promotions">
              <span>Projected lift this week</span>
              <b className="num good">+{money(projectedLift(state.promos))}</b>
            </Link>
          </div>
        </section>
      </div>

      <section className="card ai stack">
        <span className="tag" style={{ justifySelf: 'start' }}>
          ✦ Biggest opportunity
        </span>
        <h2>
          {top.name}: {top.share}% of lost visits
        </h2>
        <p>{top.detail}</p>
        <p>
          <b>Suggested fix:</b> {top.fix}
        </p>
        <Link className="btn ghost sm" style={{ justifySelf: 'start' }} to="/insights">
          See all reasons →
        </Link>
      </section>
    </>
  );
}
