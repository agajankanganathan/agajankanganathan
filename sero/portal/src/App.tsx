import { BrowserRouter, Link, Route, Routes } from 'react-router';

import { Shell } from './components/Shell';
import { ToastProvider } from './components/ui';
import Help from './pages/Help';
import Ingredients from './pages/Ingredients';
import Insights from './pages/Insights';
import Login from './pages/Login';
import Loyalty from './pages/Loyalty';
import Menu from './pages/Menu';
import Overview from './pages/Overview';
import Promotions from './pages/Promotions';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import { StoreProvider } from './state/store';

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Shell />}>
              <Route index element={<Overview />} />
              <Route path="insights" element={<Insights />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="loyalty" element={<Loyalty />} />
              <Route path="menu" element={<Menu />} />
              <Route path="ingredients" element={<Ingredients />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}

function NotFound() {
  return (
    <div className="card stack" style={{ justifyItems: 'start' }}>
      <h1>Page not found</h1>
      <p className="muted">That page doesn’t exist.</p>
      <Link className="btn" style={{ justifySelf: 'start' }} to="/">
        Back to overview
      </Link>
    </div>
  );
}
