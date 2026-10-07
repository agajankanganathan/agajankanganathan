import { useState } from 'react';

import { money } from '@core/logic';

/** Single-series column chart with clean y-ticks and a per-bar hover/focus tooltip. */
export function BarChart({ values, labels, title }: { values: number[]; labels: string[]; title: string }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 240;
  const pad = { top: 12, right: 8, bottom: 28, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const step = niceStep(Math.max(...values) / 4);
  const top = Math.ceil(Math.max(...values) / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  const band = innerW / values.length;
  const barW = Math.min(36, band * 0.6);
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;

  return (
    <div className={`chart${hover !== null ? ' hovering' : ''}`} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${labels.map((l, i) => `${l} ${money(values[i])}`).join(', ')}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} />
            <text className="tick num" x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end">
              {compactMoney(t)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = pad.left + band * i + (band - barW) / 2;
          const h = Math.max(1, y(0) - y(v));
          const r = Math.min(4, h / 2);
          return (
            <g key={labels[i]}>
              <path className={`bar${hover === i ? ' on' : ''}`} d={roundedTop(x, y(v), barW, h, r)} />
              <text className="tick" x={x + barW / 2} y={H - 8} textAnchor="middle">
                {labels[i]}
              </text>
              <rect
                className="hit"
                x={pad.left + band * i}
                y={pad.top}
                width={band}
                height={innerH}
                tabIndex={0}
                role="button"
                aria-label={`${labels[i]}: ${money(v)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div
          className="tooltip"
          style={{
            left: `${((pad.left + band * hover + band / 2) / W) * 100}%`,
            top: `${(y(values[hover]) / H) * 100}%`,
          }}>
          <b className="num">{money(values[hover])}</b>
          {labels[hover]}
        </div>
      ) : null}
    </div>
  );
}

/** Column path with 4px rounded data-end and a square baseline. */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

function compactMoney(v: number) {
  return v >= 1000 ? `$${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k` : `$${v}`;
}
