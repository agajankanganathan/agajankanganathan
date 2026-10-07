import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { draftReply } from '@core/logic';
import type { Tone } from '@core/types';

import { PageHead, Segmented, Stars, Stat, useToast } from '../components/ui';
import { REVIEWS, type FullReview } from '../lib/sample';
import { useStore } from '../state/store';

type Status = 'all' | 'open' | 'done';
type Source = 'all' | 'Google' | 'Instagram';

const TONE_HELP: Record<Tone, string> = {
  warm: 'Friendly and personal. Great for regulars and happy guests.',
  professional: 'Polite and measured. Good for complaints.',
  short: 'Quick thanks. Best for simple 5-star reviews.',
};

export default function Reviews() {
  const { state } = useStore();
  const [params, setParams] = useSearchParams();
  const status = (params.get('filter') as Status) || 'all';
  const [source, setSource] = useState<Source>('all');

  const isDone = (r: FullReview) => Boolean(state.replies[r.id]);
  const list = REVIEWS.filter((r) => (status === 'open' ? !isDone(r) : status === 'done' ? isDone(r) : true))
    .filter((r) => source === 'all' || r.source === source)
    .sort((a, b) => a.daysAgo - b.daysAgo);
  const selectedId = params.get('id') ?? list[0]?.id;
  const review = REVIEWS.find((r) => r.id === selectedId);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const avg = REVIEWS.reduce((t, r) => t + r.stars, 0) / REVIEWS.length;
  const answered = REVIEWS.filter(isDone).length;
  const open = REVIEWS.length - answered;

  return (
    <>
      <PageHead crumb="Run" title="Reviews" sub="Every review from Google and Instagram in one inbox, with an on-brand reply drafted for you. Nothing posts until you approve it." />

      <div className="grid cols-4">
        <Stat label="Average rating" value={`${avg.toFixed(1)} ★`} tip="Across the reviews shown here (last 2 weeks, sample data)." />
        <Stat label="New reviews (14 days)" value={String(REVIEWS.length)} />
        <Stat
          label="Response rate"
          value={`${Math.round((answered / REVIEWS.length) * 100)}%`}
          good={answered / REVIEWS.length >= 0.8}
          delta={answered / REVIEWS.length >= 0.8 ? 'Great' : 'Aim for 80%+'}
          tip="Share of reviews you’ve replied to. Replying to most reviews, especially negative ones, is linked to better ratings."
        />
        <Stat label="Need a reply" value={String(open)} />
      </div>

      <div className="row between wrap">
        <Segmented<Status>
          label="Status"
          value={status}
          onChange={(s) => set({ filter: s === 'all' ? null : s, id: null })}
          options={[
            { key: 'all', label: 'All', count: REVIEWS.length },
            { key: 'open', label: 'Needs reply', count: open },
            { key: 'done', label: 'Replied', count: answered },
          ]}
        />
        <Segmented<Source>
          label="Source"
          value={source}
          onChange={(s) => {
            setSource(s);
            set({ id: null });
          }}
          options={[
            { key: 'all', label: 'All sources' },
            { key: 'Google', label: 'Google' },
            { key: 'Instagram', label: 'Instagram' },
          ]}
        />
      </div>

      <div className="inbox">
        <div className="stack" role="list" aria-label="Reviews">
          {list.length === 0 ? (
            <div className="card empty">
              <b>Inbox zero 🎉</b>
              <span>Every review in this view has a reply.</span>
            </div>
          ) : null}
          {list.map((r) => (
            <button key={r.id} type="button" role="listitem" className="review glass" aria-pressed={r.id === review?.id} onClick={() => set({ id: r.id })}>
              <span className="row between">
                <Stars n={r.stars} />
                <span className={`pill ${isDone(r) ? 'good' : r.stars <= 2 ? 'bad' : 'neutral'}`}>{isDone(r) ? 'Replied' : r.stars <= 2 ? 'Reply first' : 'Needs a reply'}</span>
              </span>
              <span className="row between">
                <b>
                  {r.author} · {r.source}
                </b>
                <span className="faint small">{r.daysAgo === 1 ? 'yesterday' : `${r.daysAgo} days ago`}</span>
              </span>
              <p>{r.text}</p>
            </button>
          ))}
        </div>
        <div className="sticky" data-tour="composer">
          {review ? <Composer key={review.id} review={review} /> : <div className="card empty">Select a review to reply.</div>}
        </div>
      </div>
    </>
  );
}

function Composer({ review }: { review: FullReview }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const posted = state.replies[review.id];
  const [tone, setTone] = useState<Tone>(review.stars <= 2 ? 'professional' : 'warm');
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState(() => draftReply(review, review.stars <= 2 ? 'professional' : 'warm', 0));
  const first = review.author.split(' ')[0];

  const redraft = (t: Tone, v: number) => {
    setTone(t);
    setVariant(v);
    setText(draftReply(review, t, v));
  };

  return (
    <section className="card stack">
      <div className="row between">
        <Stars n={review.stars} />
        <span className="faint small">
          {review.source} · {review.daysAgo === 1 ? 'yesterday' : `${review.daysAgo} days ago`}
        </span>
      </div>
      <h2>{review.author}</h2>
      <p className="quote">“{review.text}”</p>
      <hr className="divider-line" />
      {posted ? (
        <>
          <span className="pill good" style={{ justifySelf: 'start' }}>
            ✓ Replied on {review.source}
          </span>
          <p>{posted}</p>
        </>
      ) : (
        <>
          <div className="row between wrap">
            <h3>Your reply to {first}</h3>
            <Segmented<Tone>
              label="Tone"
              value={tone}
              onChange={(t) => redraft(t, 0)}
              options={[
                { key: 'warm', label: 'Warm' },
                { key: 'professional', label: 'Professional' },
                { key: 'short', label: 'Short' },
              ]}
            />
          </div>
          <p className="muted small">{TONE_HELP[tone]}</p>
          <textarea className="input" aria-label="Draft reply" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row between wrap">
            <span className="faint small">{text.length} characters · drafted by Sero, edit freely</span>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn ghost" onClick={() => redraft(tone, variant + 1)}>
                ↻ Regenerate
              </button>
              <button
                type="button"
                className="btn"
                disabled={!text.trim()}
                onClick={() => {
                  dispatch({ type: 'postReply', id: review.id, text: text.trim(), who: review.author });
                  say(`Reply posted to ${review.source}`);
                }}>
                Post to {review.source}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
