// src/hooks/useTeams.js
import { useFetch } from './useFetch';
import { getTeams, getTeamStaff } from '../services/teamApi';

export function useTeams() {
  return useFetch(getTeams, []);
}

export function useTeamStaff(teamId) {
  return useFetch(
    () => (teamId ? getTeamStaff(teamId) : Promise.resolve([])),
    [teamId]
  );
}
