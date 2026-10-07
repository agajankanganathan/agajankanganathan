import { useState } from 'react';

import { draftReply } from '@core/logic';
import { REVIEWS } from '@core/sample-data';
import type { Review, Tone } from '@core/types';

import { PageHead, Segmented, Stars, useToast } from '../components/ui';
import { useStore } from '../state/store';

export default function Reviews() {
  const { state } = useStore();
  const [selected, setSelected] = useState(REVIEWS[0].id);
  const review = REVIEWS.find((r) => r.id === selected) ?? REVIEWS[0];

  return (
    <>
      <PageHead title="Reviews" sub="Every review in one inbox, with an on-brand reply drafted for you. Nothing posts until you approve it." />
      <div className="inbox">
        <div className="stack" role="list" aria-label="Reviews">
          {REVIEWS.map((r) => {
            const done = Boolean(state.replies[r.id]);
            return (
              <button key={r.id} type="button" role="listitem" className="review" aria-pressed={r.id === selected} onClick={() => setSelected(r.id)}>
                <span className="row between">
                  <Stars n={r.stars} />
                  <span className={`pill ${done ? 'good' : 'bad'}`}>{done ? 'Replied' : 'Needs a reply'}</span>
                </span>
                <b>
                  {r.author} · {r.source}
                </b>
                <p>{r.text}</p>
              </button>
            );
          })}
        </div>
        {/* key resets the composer when switching reviews */}
        <Composer key={review.id} review={review} />
      </div>
    </>
  );
}

function Composer({ review }: { review: Review }) {
  const { state, dispatch } = useStore();
  const say = useToast();
  const posted = state.replies[review.id];
  const [tone, setTone] = useState<Tone>('warm');
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState(() => draftReply(review, 'warm', 0));
  const first = review.author.split(' ')[0];

  const redraft = (t: Tone, v: number) => {
    setTone(t);
    setVariant(v);
    setText(draftReply(review, t, v));
  };

  return (
    <section className="card stack">
      <div>
        <Stars n={review.stars} />
        <h2 style={{ marginTop: 4 }}>
          {review.author} on {review.source}
        </h2>
      </div>
      <p>“{review.text}”</p>
      <hr style={{ width: '100%', border: 0, borderTop: '1px solid var(--line)', margin: '4px 0' }} />
      {posted ? (
        <>
          <span className="pill good" style={{ justifySelf: 'start' }}>
            Replied
          </span>
          <p>{posted}</p>
        </>
      ) : (
        <>
          <div className="row between wrap">
            <h2>Reply to {first}</h2>
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
          <textarea className="input" aria-label="Draft reply" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => redraft(tone, variant + 1)}>
              ↻ Regenerate
            </button>
            <button
              type="button"
              className="btn"
              disabled={!text.trim()}
              onClick={() => {
                dispatch({ type: 'postReply', id: review.id, text: text.trim() });
                say(`Reply posted to ${review.source}`);
              }}>
              Post to {review.source}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
