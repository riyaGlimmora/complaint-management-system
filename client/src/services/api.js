// src/services/api.js
// Single Axios instance shared by every service module.
// Request interceptor: attaches the JWT from localStorage automatically.
// Response interceptor: on 401, clears auth and sends the user to /login
// so every service module stays free of auth-handling code.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every outgoing request.
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('cms_auth');
    const token = raw ? JSON.parse(raw).token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // malformed storage entry; carry on without the header
  }
  return config;
});

// On 401 clear local auth and redirect. We import logout lazily to avoid a
// circular dependency (AuthContext -> api -> AuthContext).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cms_auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
