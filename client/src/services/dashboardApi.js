// src/services/dashboardApi.js
import api from './api';

export const getStaffPerformance  = (staffId)  => api.get(`/dashboard/staff/${staffId}`).then((r) => r.data.data);
export const getTeamPerformance   = (teamId)   => api.get(`/dashboard/team/${teamId}`).then((r) => r.data.data);
export const getProductAnalysis   = ()          => api.get('/dashboard/products').then((r) => r.data.data);
