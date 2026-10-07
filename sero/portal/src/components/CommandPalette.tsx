import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { MEMBERS, REVIEWS } from '../lib/sample';
import { useStore } from '../state/store';
import { Icon, type IconName } from './icons';

type Cmd = { group: string; label: string; hint?: string; icon: IconName; run: () => void };

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const all = useMemo<Cmd[]>(() => {
    const go = (to: string) => () => navigate(to);
    return [
      { group: 'Pages', label: 'Overview', icon: 'overview', run: go('/') },
      { group: 'Pages', label: 'Customer insights', icon: 'insights', run: go('/insights') },
      { group: 'Pages', label: 'Promotions', icon: 'promos', run: go('/promotions') },
      { group: 'Pages', label: 'Loyalty & members', icon: 'loyalty', run: go('/loyalty') },
      { group: 'Pages', label: 'Menu', icon: 'menu', run: go('/menu') },
      { group: 'Pages', label: 'Reviews', icon: 'reviews', run: go('/reviews') },
      { group: 'Pages', label: 'Help & guides', icon: 'help', run: go('/help') },
      { group: 'Pages', label: 'Settings', icon: 'settings', run: go('/settings') },
      { group: 'Actions', label: 'Create a promotion', icon: 'promos', run: go('/promotions?new=1') },
      { group: 'Actions', label: 'Add a menu item', icon: 'menu', run: go('/menu?add=1') },
      { group: 'Actions', label: 'Reply to reviews', icon: 'reviews', run: go('/reviews?filter=open') },
      { group: 'Actions', label: 'See regulars at risk', icon: 'gift', run: go('/loyalty?filter=risk') },
      { group: 'Actions', label: 'Replay the product tour', icon: 'play', run: () => dispatch({ type: 'restartTour' }) },
      {
        group: 'Actions',
        label: 'Switch light / dark mode',
        icon: 'settings',
        run: () => {
          const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
          dispatch({ type: 'setTheme', theme: dark ? 'light' : 'dark' });
        },
      },
      ...state.menu.map<Cmd>((m) => ({ group: 'Menu items', label: m.name, hint: `$${m.price.toFixed(2)}`, icon: 'menu', run: go(`/menu?q=${encodeURIComponent(m.name)}`) })),
      ...MEMBERS.map<Cmd>((m) => ({ group: 'Members', label: m.name, hint: m.favourite, icon: 'user', run: go(`/loyalty?member=${m.id}`) })),
      ...REVIEWS.map<Cmd>((r) => ({ group: 'Reviews', label: `${r.author} · ${r.stars}★`, hint: r.source, icon: 'reviews', run: go(`/reviews?id=${r.id}`) })),
    ];
  }, [state.menu, navigate, dispatch]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return all.filter((c) => c.group === 'Pages' || c.group === 'Actions');
    return all.filter((c) => `${c.label} ${c.hint ?? ''} ${c.group}`.toLowerCase().includes(t)).slice(0, 12);
  }, [q, all]);

  useEffect(() => input.current?.focus(), []);

  const run = (c: Cmd | undefined) => {
    if (!c) return;
    onClose();
    c.run();
  };

  return (
    <div className="palette-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette glass" role="dialog" aria-modal="true" aria-label="Search">
        <input
          ref={input}
          value={q}
          placeholder="Search pages, actions, menu items, members…"
          aria-label="Search"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[sel] ? `cmd-${sel}` : undefined}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === 'Enter') {
              run(results[sel]);
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        <ul id="palette-list" role="listbox" aria-label="Results">
          {results.length === 0 ? <li className="empty">No matches for “{q}”</li> : null}
          {results.map((c, n) => (
            <li key={`${c.group}-${c.label}-${n}`} role="presentation">
              {n === 0 || results[n - 1].group !== c.group ? <div className="group">{c.group}</div> : null}
              <button
                type="button"
                id={`cmd-${n}`}
                role="option"
                aria-selected={n === sel}
                onMouseEnter={() => setSel(n)}
                onClick={() => run(c)}>
                <Icon name={c.icon} size={18} />
                <span style={{ flex: 1 }}>{c.label}</span>
                {c.hint ? <span className="faint small">{c.hint}</span> : null}
              </button>
            </li>
          ))}
        </ul>
        <footer>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </footer>
      </div>
    </div>
  );
}
