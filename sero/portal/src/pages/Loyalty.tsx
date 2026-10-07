import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { money } from '@core/logic';
import { LOYALTY } from '@core/sample-data';

import { Icon } from '../components/icons';
import { PageHead, Segmented, Stat, useToast } from '../components/ui';
import { cadence, isAtRisk, MEMBERS, type Member } from '../lib/sample';
import { STAMPS_FOR_REWARD, useStore } from '../state/store';

type Filter = 'all' | 'risk' | 'regulars';

export default function Loyalty() {
  const { state } = useStore();
  const [params, setParams] = useSearchParams();
  const filter = (params.get('filter') as Filter) || 'all';
  const memberId = params.get('member');
  const [q, setQ] = useState('');

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const atRisk = MEMBERS.filter((m) => isAtRisk(m) && !state.rewardsSent.includes(m.id));
  const regulars = MEMBERS.filter((m) => m.usualGapDays <= 3);
  const rows = MEMBERS.filter((m) => (filter === 'risk' ? isAtRisk(m) : filter === 'regulars' ? m.usualGapDays <= 3 : true))
    .filter((m) => `${m.name} ${m.favourite}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(isAtRisk(b)) - Number(isAtRisk(a)) || b.lifetimeSpend - a.lifetimeSpend);
  const member = MEMBERS.find((m) => m.id === memberId);

  return (
    <>
      <PageHead crumb="Grow" title="Loyalty & members" sub="A digital stamp card that knows who your regulars are, and tells you when they start to drift away." />

      <div className="grid cols-4">
        <Stat label="Members" value={LOYALTY.members.toLocaleString('en-US')} delta="+18 this month" good />
        <Stat label="Visits this month" value={LOYALTY.visitsThisMonth.toLocaleString('en-US')} />
        <Stat label="Rewards redeemed" value={String(LOYALTY.rewardsRedeemed + state.redeemed)} />
        <Stat
          label="At risk"
          value={String(atRisk.length)}
          tip="Members who’ve been away more than twice as long as usual (and at least two weeks). A small reward now often brings them back."
        />
      </div>

      <section className="card">
        <div className="card-head wrap" style={{ flexWrap: 'wrap' }}>
          <Segmented<Filter>
            label="Filter members"
            value={filter}
            onChange={(f) => set({ filter: f === 'all' ? null : f })}
            options={[
              { key: 'all', label: 'All members', count: MEMBERS.length },
              { key: 'risk', label: 'At risk', count: MEMBERS.filter(isAtRisk).length },
              { key: 'regulars', label: 'Regulars', count: regulars.length },
            ]}
          />
          <label className="search">
            <Icon name="search" />
            <span className="sr-only">Search members</span>
            <input className="input" placeholder="Search name or favourite…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th className="r">Last visit</th>
                <th className="r">Visits (30 d)</th>
                <th className="r">Lifetime spend</th>
                <th>Favourite</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <MemberRow key={m.id} m={m} onOpen={() => set({ member: m.id })} />
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No members match “{q}”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginTop: 28 }}>
          Showing {rows.length} of {LOYALTY.members} members (sample). Click a member to see their profile.
        </p>
      </section>

      {member ? <MemberDrawer m={member} onClose={() => set({ member: null })} /> : null}
    </>
  );
}

function SendReward({ m, sm = true }: { m: Member; sm?: boolean }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const sent = state.rewardsSent.includes(m.id);
  return (
    <button
      type="button"
      className={`btn${sm ? ' sm' : ''}${isAtRisk(m) ? '' : ' ghost'}`}
      disabled={sent}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'sendReward', id: m.id, name: m.name });
        say(`Free drink sent to ${m.name}`);
      }}>
      {sent ? 'Reward sent ✓' : 'Send reward'}
    </button>
  );
}

function MemberRow({ m, onOpen }: { m: Member; onOpen: () => void }) {
  const { state } = useStore();
  const risk = isAtRisk(m);
  const sent = state.rewardsSent.includes(m.id);
  return (
    <tr className="clickable" onClick={onOpen}>
      <td>
        <div className="item-cell">
          <span className="avatar sm" aria-hidden="true">
            {m.name.charAt(0)}
          </span>
          <div>
            <button type="button" className="link" style={{ color: 'inherit', fontWeight: 600 }} onClick={onOpen}>
              {m.name}
            </button>
            <small>{cadence(m)}</small>
          </div>
        </div>
      </td>
      <td>
        {risk ? (
          <span className={`pill ${sent ? 'neutral' : 'bad'}`}>{sent ? 'Reward sent' : 'At risk'}</span>
        ) : (
          <span className="pill good">Active</span>
        )}
      </td>
      <td className="r num">{m.lastVisitDays === 0 ? 'Today' : `${m.lastVisitDays} d ago`}</td>
      <td className="r num">{m.visits30}</td>
      <td className="r num">{money(m.lifetimeSpend)}</td>
      <td className="muted">{m.favourite}</td>
      <td className="r">{risk ? <SendReward m={m} /> : null}</td>
    </tr>
  );
}

function MemberDrawer({ m, onClose }: { m: Member; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const panel = useRef<HTMLDivElement>(null);
  const risk = isAtRisk(m);
  // Maya's card is the interactive one from the original demo.
  const stamps = m.id === 'maya' ? state.stamps : m.stamps;
  const full = stamps >= STAMPS_FOR_REWARD;

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <div ref={panel} className="drawer glass" role="dialog" aria-modal="true" aria-labelledby="member-name" tabIndex={-1}>
        <div className="row between">
          <div className="row">
            <span className="avatar" style={{ width: 48, height: 48, fontSize: 18 }} aria-hidden="true">
              {m.name.charAt(0)}
            </span>
            <div>
              <h2 id="member-name" style={{ fontSize: 20 }}>
                {m.name}
              </h2>
              <span className="muted small">
                {cadence(m)} · member for {m.joinedMonthsAgo} months
              </span>
            </div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {risk ? (
          <div className="card ai" style={{ padding: 14 }}>
            <b>Drifting away</b>
            <p className="small" style={{ marginTop: 4 }}>
              Usually visits every {m.usualGapDays === 1 ? 'day' : `${m.usualGapDays} days`}, but hasn’t been in for {m.lastVisitDays} days. A free {m.favourite.toLowerCase()} is a
              good nudge.
            </p>
          </div>
        ) : null}

        <div className="kv">
          <div>
            <small>Last visit</small>
            <b>{m.lastVisitDays === 0 ? 'Today' : `${m.lastVisitDays} days ago`}</b>
          </div>
          <div>
            <small>Visits (30 days)</small>
            <b>{m.visits30}</b>
          </div>
          <div>
            <small>Lifetime spend</small>
            <b>{money(m.lifetimeSpend)}</b>
          </div>
          <div>
            <small>Usual gap</small>
            <b>{m.usualGapDays === 1 ? 'Daily' : `${m.usualGapDays} days`}</b>
          </div>
        </div>

        <div>
          <div className="row between">
            <h3>Stamp card</h3>
            <span className="muted small">
              {stamps} / {STAMPS_FOR_REWARD}
            </span>
          </div>
          <div className="stamps" role="img" aria-label={`${stamps} of ${STAMPS_FOR_REWARD} stamps`}>
            {Array.from({ length: STAMPS_FOR_REWARD }, (_, i) => (
              <i key={i} className={i < stamps ? 'on' : ''} />
            ))}
          </div>
          <p className="muted small">{full ? 'Free drink unlocked 🎉' : `${STAMPS_FOR_REWARD - stamps} more for a free drink · favourite: ${m.favourite}`}</p>
          {m.id === 'maya' ? (
            <button
              type="button"
              className="btn ghost sm"
              style={{ marginTop: 10 }}
              onClick={() => {
                if (full) say('Reward redeemed 🎉');
                dispatch({ type: 'addStamp' });
              }}>
              {full ? 'Redeem reward' : 'Add a stamp'}
            </button>
          ) : null}
        </div>

        <SendReward m={m} sm={false} />
      </div>
    </>
  );
}
