import React, { useState } from 'react';
import { auth } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      editor: { email: 'editor@newsroom.com', password: 'password123' },
      reporter: { email: 'reporter@newsroom.com', password: 'password123' },
      admin: { email: 'admin@newsroom.com', password: 'password123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
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
            <button onClick={() => quickLogin('editor')}>Editor</button>
            <button onClick={() => quickLogin('reporter')}>Reporter</button>
            <button onClick={() => quickLogin('admin')}>Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
