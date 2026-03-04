'use client';

import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'pak123') {
        const token = btoa(`${username}:${Date.now()}`);
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `auth_token=${token}; path=/; expires=${expires}`;
        onLogin();
      } else {
        setError('Invalid username or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">ACR</div>
          <h2 className="login-logo-text">Employee <span>System</span></h2>
        </div>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="login-input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="login-input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
