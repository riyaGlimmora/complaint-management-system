// src/context/AuthContext.jsx
// Holds the logged-in user and JWT token. Persisted to localStorage so a page
// refresh doesn't log the user out. Exposed via useAuth() - never read
// localStorage directly in a component.

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cms_auth';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadFromStorage);

  const login = useCallback((user, token) => {
    const next = { user, token };
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setAuth({ user: null, token: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
