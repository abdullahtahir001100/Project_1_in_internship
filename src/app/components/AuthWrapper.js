'use client';

import React, { useState, useEffect } from 'react';
import Login from './Login';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getCookie('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="login-overlay">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
