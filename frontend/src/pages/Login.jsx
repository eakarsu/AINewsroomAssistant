import React, { useRef, useState } from 'react';
import { auth } from '../services/api';

const demoEnabled = import.meta.env.VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true';
const demoEmail = demoEnabled ? import.meta.env.VITE_DEMO_EMAIL || 'editor@newsroom.com' : '';
const demoPassword = demoEnabled ? import.meta.env.VITE_DEMO_PASSWORD || '' : '';

export default function Login({ onLogin }) {
  const demoLoginLock = useRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(demoLoginCredentials?.email ?? email, demoLoginCredentials?.password ?? password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      editor: { email: demoEmail, password: demoPassword },
      reporter: { email: 'reporter@newsroom.com', password: demoPassword },
      admin: { email: 'admin@newsroom.com', password: demoPassword },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
    return creds[role];
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AI Newsroom</h1>
        <p className="login-subtitle">
          <span>Intelligence Platform</span> &mdash; Sign in to continue
        </p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="quick-login">
          <p>Quick Login</p>
          <div className="quick-login-btns">
            <button
              type="button"
              disabled={!demoEmail || !demoPassword || loading || demoLoginBusy}
              onClick={async (event) => {
                if (!demoPassword || demoLoginLock.current) return;
                demoLoginLock.current = true;
                setDemoLoginBusy(true);
                try {
                  await handleSubmit(event, quickLogin('editor'));
                } finally {
                  demoLoginLock.current = false;
                  setDemoLoginBusy(false);
                }
              }}
            >
              {demoLoginBusy ? 'Logging in…' : 'Log In as Demo'}
            </button>
            <button type="button" disabled={!demoPassword || loading || demoLoginBusy} onClick={() => quickLogin('reporter')}>Reporter</button>
            <button type="button" disabled={!demoPassword || loading || demoLoginBusy} onClick={() => quickLogin('admin')}>Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
