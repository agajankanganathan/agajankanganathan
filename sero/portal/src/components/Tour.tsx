import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

type Step = { route?: string; target?: string; title: string; body: string };

export const TOUR_STEPS: Step[] = [
  {
    route: '/',
    title: 'Welcome to Sero 👋',
    body: 'Sero shows you why customers stop coming back, and gives you the tools to win them back. This 1-minute tour shows you around. You can replay it any time from Help.',
  },
  { target: 'nav', title: 'Six tools, one place', body: 'Everything lives in the sidebar (tap ☰ on a phone). Each section solves one problem: insights, promotions, loyalty, menu and reviews, all feeding the Overview.' },
  { route: '/', target: 'kpis', title: 'Your numbers at a glance', body: 'Revenue, customers, return rate and revenue at risk. Switch between 7 and 30 days at the top. Hover the ⓘ next to any number to see what it means.' },
  { route: '/', target: 'attention', title: 'Start here each morning', body: 'Reviews to answer, regulars drifting away and promotions running. Click any row to jump straight to it.' },
  { route: '/', target: 'checklist', title: 'Your setup checklist', body: 'Five quick wins to get value from Sero. Each one ticks itself off as you do it.' },
  { route: '/insights', target: 'drivers', title: 'Why customers leave', body: 'Sero reads reviews, visit patterns and feedback, then ranks the reasons guests don’t come back. Click a reason to see the evidence and a suggested fix.' },
  { route: '/promotions', target: 'new-promo', title: 'Win them back with offers', body: 'Create a targeted promotion for a specific group, like guests away 30+ days. Sero estimates the extra revenue before you launch.' },
  { route: '/menu', target: 'menu-table', title: 'Know what earns', body: 'Edit any price or cost and the margin updates instantly. Green is healthy, red needs a look. Click a column to sort.' },
  { route: '/reviews', target: 'composer', title: 'Reply in seconds', body: 'Pick a review, choose a tone and Sero drafts an on-brand reply. Edit it if you like. Nothing is posted until you click Post.' },
  { target: 'search', title: 'Find anything fast', body: 'Press ⌘K (or Ctrl+K) to jump to any page, menu item or member. The ? button opens Help.' },
  { route: '/', title: 'You’re all set ✨', body: 'Start with the checklist on your Overview. This workspace uses sample data, so explore freely: Settings → Reset demo data undoes everything.' },
];

type Box = { top: number; left: number; width: number; height: number };

export function Tour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const card = useRef<HTMLDivElement>(null);
  const step = TOUR_STEPS[i];
  const last = i === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (step.route && location.pathname !== step.route) navigate(step.route);
  }, [step.route, location.pathname, navigate]);

  // Find the highlighted element (it may render a moment after navigating) and keep its box in sync.
  useLayoutEffect(() => {
    if (!step.target) {
      setBox(null);
      return;
    }
    let frame = 0;
    let tries = 0;
    let el: Element | null = null;
    const measure = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.right > 0 && r.left < window.innerWidth;
      setBox(visible ? { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 } : null);
    };
    const find = () => {
      el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        // Tall areas scroll to their top so the card can sit below without hiding the start.
        const tall = el.getBoundingClientRect().height > window.innerHeight * 0.6;
        el.scrollIntoView({ block: tall ? 'start' : 'center', behavior: 'instant' as ScrollBehavior });
        measure();
      } else if (tries++ < 60) {
        frame = requestAnimationFrame(find);
      } else {
        setBox(null);
      }
    };
    find();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step.target, location.pathname]);

  useEffect(() => {
    card.current?.focus();
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, TOUR_STEPS.length - 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  // Place the card beside the highlight: to the right of tall or left-edge elements (the sidebar), otherwise below or above.
  let pos: { top: number; left: number } | null = null;
  if (box) {
    const W = Math.min(360, window.innerWidth - 32);
    const H = 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if ((box.height > vh * 0.5 || box.left < vw * 0.2) && box.left + box.width + W + 24 < vw) {
      pos = { left: box.left + box.width + 16, top: Math.min(Math.max(16, box.top + 40), vh - H - 16) };
    } else if (box.height + H + 24 > vh) {
      pos = { top: vh - H - 16, left: Math.max(16, (vw - W) / 2) };
    } else {
      const below = box.top + box.height + 12;
      const top = below + H < vh ? below : Math.max(16, box.top - H - 12);
      pos = { top, left: Math.min(Math.max(16, box.left), vw - W - 16) };
    }
  }

  return (
    <>
      {box ? <div className="tour-spot" style={box} /> : <div className="tour-dim" />}
      <div
        ref={card}
        className={`tour-card glass${pos ? '' : ' center'}`}
        style={pos ?? undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}>
        <div className="row between">
          <div className="tour-steps" aria-hidden="true">
            {TOUR_STEPS.map((_, n) => (
              <i key={n} className={n <= i ? 'on' : ''} />
            ))}
          </div>
          <span className="faint small">
            {i + 1} of {TOUR_STEPS.length}
          </span>
        </div>
        <h2 id="tour-title" style={{ fontSize: i === 0 || last ? 22 : 17 }}>
          {step.title}
        </h2>
        <p id="tour-body" className="muted">
          {step.body}
        </p>
        <div className="row between" style={{ marginTop: 6 }}>
          {last ? (
            <span />
          ) : (
            <button type="button" className="link" onClick={onDone}>
              Skip tour
            </button>
          )}
          <div className="row" style={{ gap: 8 }}>
            {i > 0 && !last ? (
              <button type="button" className="btn ghost sm" onClick={() => setI(i - 1)}>
                Back
              </button>
            ) : null}
            <button type="button" className="btn sm" onClick={() => (last ? onDone() : setI(i + 1))}>
              {i === 0 ? 'Show me around' : last ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
