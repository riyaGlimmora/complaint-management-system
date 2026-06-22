// src/services/authApi.js
import api from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data.data);
export const login    = (data) => api.post('/auth/login',    data).then((r) => r.data.data);
