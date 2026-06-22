// src/hooks/useTickets.js
import { useState, useMemo } from 'react';
import { useFetch } from './useFetch';
import { searchTickets } from '../services/ticketApi';

export function useTickets(initialFilters = {}) {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20, ...initialFilters });

  const { data, loading, error, refetch } = useFetch(
    () => searchTickets(filters),
    [JSON.stringify(filters)]
  );

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const setPage = (page) => setFilters((prev) => ({ ...prev, page }));

  return {
    tickets: data?.items ?? [],
    total:   data?.total  ?? 0,
    page:    data?.page   ?? 1,
    pageSize: data?.pageSize ?? 20,
    filters,
    updateFilter,
    setPage,
    loading,
    error,
    refetch,
  };
}
