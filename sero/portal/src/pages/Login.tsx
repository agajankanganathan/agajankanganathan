import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { useStore } from '../state/store';

export default function Login() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (state.user) return <Navigate to={from} replace />;

  const enter = (name: string, mail: string) => {
    dispatch({ type: 'signIn', name, email: mail });
    navigate(from, { replace: true });
  };

  // Demo only: any email and password are accepted. Real authentication comes with the backend.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 1) return setError('Enter your password.');
    const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    enter(name, email);
  };

  return (
    <div className="login">
      <section className="login-art">
        <span className="brand">
          <span className="mark" aria-hidden="true" />
          Sero
        </span>
        <h1>
          Find why your café customers leave and <em>win</em> them back.
        </h1>
        <div className="login-points">
          <div>✦ See exactly why guests stop coming back</div>
          <div>🎁 Win them back with targeted offers and rewards</div>
          <div>💬 Reply to every review in seconds</div>
        </div>
        <p style={{ opacity: 0.75 }}>AI customer intelligence for independent cafés.</p>
      </section>
      <section className="login-form">
        <form className="glass" onSubmit={submit} noValidate>
          <div>
            <h1 style={{ fontSize: 28 }}>Welcome back</h1>
            <p className="muted">Sign in to your café’s dashboard</p>
          </div>
          <label className="field">
            Email
            <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="field">
            Password
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? (
            <p className="bad small" role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn" type="submit">
            Sign in
          </button>
          <div className="divider">or</div>
          <button className="btn accent" type="button" onClick={() => enter('Alex', 'alex@cornercafe.com')}>
            Explore the demo café →
          </button>
          <p className="muted small">This is a demo. Any email and password will work, and no data leaves your browser.</p>
        </form>
      </section>
    </div>
  );
}
