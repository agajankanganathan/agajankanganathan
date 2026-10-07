import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router';

import { useAttention, useStore } from '../state/store';

const ICONS = {
  overview: <path d="M4 20V11M10 20V5M16 20v-6M21 20H3" />,
  insights: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  promos: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.4" />
    </>
  ),
  loyalty: <path d="M12 20s-7.5-4.8-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.2 12 20 12 20z" />,
  menu: <path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3" />,
  reviews: <path d="M4 5h16v11H9l-5 4z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export function Shell() {
  const { state, dispatch } = useStore();
  const { atRisk, toAnswer } = useAttention();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!state.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const links: { to: string; label: string; icon: keyof typeof ICONS; badge?: number }[] = [
    { to: '/', label: 'Overview', icon: 'overview' },
    { to: '/insights', label: 'Customer insights', icon: 'insights' },
    { to: '/promotions', label: 'Promotions', icon: 'promos' },
    { to: '/loyalty', label: 'Loyalty', icon: 'loyalty', badge: atRisk },
    { to: '/menu', label: 'Menu', icon: 'menu' },
    { to: '/reviews', label: 'Reviews', icon: 'reviews', badge: toAnswer },
  ];

  return (
    <div className="shell">
      <aside className={`side${open ? ' open' : ''}`} id="sidebar">
        <Link to="/" className="brand" aria-label="Sero home">
          <span className="mark" aria-hidden="true" />
          Sero
        </Link>
        <div className="cafe">
          <b>{state.cafe.name}</b>
          <span>{state.cafe.address}</span>
        </div>
        <nav className="nav" aria-label="Main">
          {links.map((l) => (
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
        </nav>
        <div className="side-foot nav">
          <NavLink to="/settings">
            <Icon name="settings" />
            Settings
          </NavLink>
          <div className="user">
            <span className="avatar" aria-hidden="true">
              {state.user.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <b>{state.user.name}</b>
              <span>{state.user.email}</span>
            </div>
          </div>
          <button type="button" className="btn ghost sm" onClick={() => dispatch({ type: 'signOut' })}>
            Sign out
          </button>
        </div>
      </aside>
      {open ? <div className="scrim" onClick={() => setOpen(false)} /> : null}

      <div className="main">
        <div className="demo-banner">
          Demo workspace with sample data. Changes are saved in this browser only.
        </div>
        <div className="topbar">
          <Link to="/" className="brand" aria-label="Sero home">
            <span className="mark" aria-hidden="true" />
            Sero
          </Link>
          <button
            type="button"
            className="btn sm"
            aria-expanded={open}
            aria-controls="sidebar"
            onClick={() => setOpen((o) => !o)}>
            Menu
          </button>
        </div>
        <main className="page" id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
