import { createContext, use, useCallback, useId, useRef, useState, type ReactNode } from 'react';

export function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return <button type="button" className="switch" role="switch" aria-checked={on} aria-label={label} onClick={onChange} />;
}

export function Segmented<K extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: K;
  options: { key: K; label: string; count?: number }[];
  onChange: (k: K) => void;
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.key} type="button" aria-pressed={o.key === value} onClick={() => onChange(o.key)}>
          {o.label}
          {o.count !== undefined ? <span className="count">{o.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" role="img" aria-label={`${n} out of 5 stars`}>
      {'★'.repeat(n)}
      <s>{'★'.repeat(5 - n)}</s>
    </span>
  );
}

/** Small ⓘ button with an explanation on hover or keyboard focus. */
export function InfoTip({ children, label = 'What does this mean?' }: { children: ReactNode; label?: string }) {
  const id = useId();
  return (
    <span className="tip">
      <button type="button" aria-label={label} aria-describedby={id}>
        i
      </button>
      <span role="tooltip" id={id}>
        {children}
      </span>
    </span>
  );
}

export function Stat({
  label,
  value,
  delta,
  good,
  tip,
  children,
}: {
  label: string;
  value: string;
  delta?: string;
  good?: boolean;
  tip?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="card stat">
      <span className="label">
        {label}
        {tip ? <InfoTip label={`About ${label}`}>{tip}</InfoTip> : null}
      </span>
      <b>{value}</b>
      {delta ? <span className={`delta ${good ? 'good' : 'bad'}`}>{delta}</span> : null}
      {children}
    </div>
  );
}

export function PageHead({ crumb, title, sub, children }: { crumb?: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        {crumb ? <span className="crumb">{crumb}</span> : null}
        <h1>{title}</h1>
        {sub ? <p className="muted">{sub}</p> : null}
      </div>
      {children ? <div className="toolbar">{children}</div> : null}
    </header>
  );
}

/** Tiny trend line: 2px stroke, faint area wash, end dot on the latest value. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const W = 120;
  const H = 40;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => [4 + (i / (values.length - 1)) * (W - 8), H - 4 - ((v - min) / (max - min || 1)) * (H - 10)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <path className="area" d={`${d}L${lx},${H}L4,${H}Z`} />
      <path d={d} vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function timeAgo(at: number): string {
  const s = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/* Toast: one short status line at the bottom of the screen. */
const ToastContext = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const say = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 2600);
  }, []);
  return (
    <ToastContext value={say}>
      {children}
      <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
        <span aria-hidden="true">✓</span>
        {msg}
      </div>
    </ToastContext>
  );
}

export const useToast = () => use(ToastContext);
