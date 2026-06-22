// src/hooks/useDashboard.js
import { useFetch } from './useFetch';
import { getStaffPerformance, getTeamPerformance, getProductAnalysis } from '../services/dashboardApi';

export function useStaffDashboard(staffId) {
  return useFetch(() => getStaffPerformance(staffId), [staffId]);
}

export function useTeamDashboard(teamId) {
  return useFetch(() => getTeamPerformance(teamId), [teamId]);
}

export function useProductDashboard() {
  return useFetch(getProductAnalysis, []);
}
