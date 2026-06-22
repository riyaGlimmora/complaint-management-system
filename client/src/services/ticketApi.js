// src/services/ticketApi.js
import api from './api';

export const searchTickets  = (params) => api.get('/tickets/search', { params }).then((r) => r.data.data);
export const getTicket      = (id)     => api.get(`/tickets/${id}`).then((r) => r.data.data);
export const createTicket   = (data)   => api.post('/tickets', data).then((r) => r.data.data);
export const changeStatus   = (id, data) => api.patch(`/tickets/${id}/status`, data).then((r) => r.data.data);
export const assignTicket   = (id, data) => api.patch(`/tickets/${id}/assign`, data).then((r) => r.data.data);
export const addComment     = (id, data) => api.post(`/tickets/${id}/comments`, data).then((r) => r.data.data);
