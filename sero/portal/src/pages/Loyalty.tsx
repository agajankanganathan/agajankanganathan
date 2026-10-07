import { AT_RISK, LOYALTY } from '@core/sample-data';

import { PageHead, Stat, useToast } from '../components/ui';
import { STAMPS_FOR_REWARD, useStore } from '../state/store';

export default function Loyalty() {
  const { state, dispatch } = useStore();
  const say = useToast();
  const full = state.stamps >= STAMPS_FOR_REWARD;

  return (
    <>
      <PageHead title="Loyalty & rewards" sub="A digital stamp card that knows who your regulars are, and notices when they drift away." />

      <div className="grid cols-3">
        <Stat label="Members" value={LOYALTY.members.toLocaleString('en-US')} />
        <Stat label="Visits this month" value={LOYALTY.visitsThisMonth.toLocaleString('en-US')} />
        <Stat label="Rewards redeemed" value={String(LOYALTY.rewardsRedeemed + state.redeemed)} />
      </div>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <section className="card">
          <div className="card-head">
            <h2>Regulars at risk</h2>
            <span className="muted small">Haven’t visited as often as usual</span>
          </div>
          <ul className="people">
            {AT_RISK.map((m) => {
              const sent = state.rewardsSent.includes(m.id);
              return (
                <li key={m.id}>
                  <span className="avatar" aria-hidden="true">
                    {m.name.charAt(0)}
                  </span>
                  <div>
                    <b>{m.name}</b>
                    <span>
                      {m.cadence} · last visit {m.daysAway} days ago
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn sm"
                    disabled={sent}
                    onClick={() => {
                      dispatch({ type: 'sendReward', id: m.id });
                      say(`Free drink sent to ${m.name}`);
                    }}>
                    {sent ? 'Sent ✓' : 'Send reward'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Stamp card · Maya R.</h2>
            <span className="muted small">
              {state.stamps} / {STAMPS_FOR_REWARD}
            </span>
          </div>
          <div className="stamps" role="img" aria-label={`${state.stamps} of ${STAMPS_FOR_REWARD} stamps`}>
            {Array.from({ length: STAMPS_FOR_REWARD }, (_, i) => (
              <i key={i} className={i < state.stamps ? 'on' : ''} />
            ))}
          </div>
          <p className="muted small" style={{ marginBottom: 12 }}>
            {full ? 'Free drink unlocked 🎉' : `${STAMPS_FOR_REWARD - state.stamps} more for a free drink`}
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (full) say('Reward redeemed 🎉');
              dispatch({ type: 'addStamp' });
            }}>
            {full ? 'Redeem reward' : 'Add a stamp'}
          </button>
        </section>
      </div>
    </>
  );
}
