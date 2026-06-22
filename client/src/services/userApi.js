// src/services/userApi.js
import api from './api';

export const getUsers    = (params) => api.get('/users', { params }).then((r) => r.data.data);
export const createUser  = (data)   => api.post('/users', data).then((r) => r.data.data);
