import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router';

import { useAttention, useStore } from '../state/store';
import { CommandPalette } from './CommandPalette';
import { Icon, type IconName } from './icons';
import { Tour } from './Tour';

const TRIAL_DAYS = 14;
const TRIAL_LEFT = 11;

export function Shell() {
  const { state, dispatch } = useStore();
  const { atRisk, toAnswer } = useAttention();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [pop, setPop] = useState<'bell' | 'account' | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  // Close the mobile menu and popovers after navigating.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
    setPop(null);
  }

  useEffect(() => {
    dispatch({ type: 'visit', page: location.pathname });
  }, [location.pathname, dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      } else if (e.key === 'Escape') {
        setOpen(false);
        setPop(null);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setPop(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, []);

  if (!state.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const groups: { label?: string; links: { to: string; label: string; icon: IconName; badge?: number }[] }[] = [
    { links: [{ to: '/', label: 'Overview', icon: 'overview' }] },
    {
      label: 'Grow',
      links: [
        { to: '/insights', label: 'Customer insights', icon: 'insights' },
        { to: '/promotions', label: 'Promotions', icon: 'promos' },
        { to: '/loyalty', label: 'Loyalty & members', icon: 'loyalty', badge: atRisk },
      ],
    },
    {
      label: 'Run',
      links: [
        { to: '/menu', label: 'Menu', icon: 'menu' },
        { to: '/reviews', label: 'Reviews', icon: 'reviews', badge: toAnswer },
      ],
    },
  ];

  const notifications: { to: string; icon: IconName; title: string; sub: string }[] = [
    ...(toAnswer ? [{ to: '/reviews?filter=open', icon: 'reviews' as const, title: `${toAnswer} reviews need a reply`, sub: 'Replying within a day keeps your rating up' }] : []),
    ...(atRisk ? [{ to: '/loyalty?filter=risk', icon: 'gift' as const, title: `${atRisk} regulars are drifting away`, sub: 'A free drink often brings them back' }] : []),
    { to: '/insights', icon: 'insights', title: 'Morning waits are up 20% this week', sub: 'Top reason guests don’t come back' },
  ];

  const initial = state.user.name.charAt(0).toUpperCase();

  return (
    <div className="shell">
      <aside className={`side glass${open ? ' open' : ''}`} id="sidebar" aria-label="Sidebar">
        <Link to="/" className="brand" aria-label="Sero home">
          <span className="mark" aria-hidden="true" />
          Sero
        </Link>
        <div className="cafe">
          <span className="cafe-badge" aria-hidden="true">
            {state.cafe.name.charAt(0)}
          </span>
          <div style={{ minWidth: 0 }}>
            <b>{state.cafe.name}</b>
            <span>{state.cafe.address}</span>
          </div>
        </div>
        <nav aria-label="Main" data-tour="nav" className="stack" style={{ gap: 14 }}>
          {groups.map((g, n) => (
            <div key={n} className="nav">
              {g.label ? <span className="nav-label">{g.label}</span> : null}
              {g.links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                  <Icon name={l.icon} />
                  {l.label}
                  {l.badge ? (
                    <span className="badge" aria-label={`${l.badge} need attention`}>
                      {l.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="nav">
            <span className="nav-label">Account</span>
            <NavLink to="/help">
              <Icon name="help" />
              Help & guides
            </NavLink>
            <NavLink to="/settings">
              <Icon name="settings" />
              Settings
            </NavLink>
          </div>
        </nav>
        <div className="plan-card">
          <b>Growth plan · free trial</b>
          <p>{TRIAL_LEFT} days left</p>
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${((TRIAL_DAYS - TRIAL_LEFT) / TRIAL_DAYS) * 100}%` }} />
          </div>
          <Link to="/settings#billing">View plans →</Link>
        </div>
      </aside>
      {open ? <div className="scrim" onClick={() => setOpen(false)} /> : null}

      <div className="main">
        <div className="topbar glass" ref={bar}>
          <button type="button" className="icon-btn menu-toggle" aria-label="Open menu" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link to="/" className="brand" aria-label="Sero home">
            <span className="mark" aria-hidden="true" />
            Sero
          </Link>
          <button type="button" className="search-trigger" data-tour="search" onClick={() => setPalette(true)}>
            <Icon name="search" />
            Search or jump to…
            <kbd>⌘K</kbd>
          </button>
          <div className="topbar-right">
            <span className="demo-pill" title="This workspace uses sample data. Changes stay in this browser.">
              Demo data
            </span>
            <button type="button" className="icon-btn mobile-only" aria-label="Search" onClick={() => setPalette(true)}>
              <Icon name="search" />
            </button>
            <Link to="/help" className="icon-btn" aria-label="Help & guides" data-tour="help">
              <Icon name="help" />
            </Link>
            <div className="anchor">
              <button
                type="button"
                className="icon-btn"
                aria-label={`Notifications (${notifications.length})`}
                aria-expanded={pop === 'bell'}
                onClick={() => setPop(pop === 'bell' ? null : 'bell')}>
                <Icon name="bell" />
                {notifications.length ? <span className="dot" /> : null}
              </button>
              {pop === 'bell' ? (
                <div className="pop glass" role="dialog" aria-label="Notifications">
                  <div className="pop-head row between">
                    <h2>Notifications</h2>
                    <span className="faint small">{notifications.length} new</span>
                  </div>
                  {notifications.map((n) => (
                    <Link key={n.title} to={n.to}>
                      <span className="ico">
                        <Icon name={n.icon} />
                      </span>
                      <span>
                        <b style={{ display: 'block', fontSize: 14 }}>{n.title}</b>
                        <span className="muted small">{n.sub}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="anchor">
              <button
                type="button"
                className="icon-btn"
                style={{ borderRadius: '50%', padding: 0, border: 0, width: 34, height: 34 }}
                aria-label="Account menu"
                aria-expanded={pop === 'account'}
                onClick={() => setPop(pop === 'account' ? null : 'account')}>
                <span className="avatar">{initial}</span>
              </button>
              {pop === 'account' ? (
                <div className="pop glass" role="dialog" aria-label="Account" style={{ width: 260 }}>
                  <div className="pop-head">
                    <b style={{ display: 'block' }}>{state.user.name}</b>
                    <span className="muted small">{state.user.email}</span>
                  </div>
                  <hr className="divider-line" />
                  <Link to="/settings">
                    <Icon name="settings" size={18} /> Settings
                  </Link>
                  <Link to="/settings#billing">
                    <Icon name="card" size={18} /> Plan & billing
                  </Link>
                  <button type="button" className="item" onClick={() => dispatch({ type: 'restartTour' })}>
                    <Icon name="play" size={18} /> Replay product tour
                  </button>
                  <button type="button" className="item" onClick={() => dispatch({ type: 'signOut' })}>
                    <Icon name="logout" size={18} /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <main className="page" id="main" key={location.pathname}>
          <Outlet />
        </main>
      </div>

      {palette ? <CommandPalette onClose={() => setPalette(false)} /> : null}
      {!state.tourDone ? <Tour onDone={() => dispatch({ type: 'finishTour' })} /> : null}
    </div>
  );
}
