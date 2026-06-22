// src/services/teamApi.js
import api from './api';

export const getTeams     = ()       => api.get('/teams').then((r) => r.data.data);
export const createTeam   = (data)   => api.post('/teams', data).then((r) => r.data.data);
export const getTeamStaff = (teamId) => api.get(`/teams/${teamId}/staff`).then((r) => r.data.data);
