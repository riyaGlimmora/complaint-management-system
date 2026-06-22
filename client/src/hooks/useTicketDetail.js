// src/hooks/useTicketDetail.js
import { useCallback } from 'react';
import { useFetch } from './useFetch';
import { getTicket, changeStatus, assignTicket, addComment } from '../services/ticketApi';

export function useTicketDetail(ticketId) {
  const { data, loading, error, refetch } = useFetch(
    () => getTicket(ticketId),
    [ticketId]
  );

  const doChangeStatus = useCallback(
    async (status, note = '') => {
      await changeStatus(ticketId, { status, note });
      await refetch();
    },
    [ticketId, refetch]
  );

  const doAssign = useCallback(
    async (staffId, note = '') => {
      await assignTicket(ticketId, { staffId, note });
      await refetch();
    },
    [ticketId, refetch]
  );

  const doAddComment = useCallback(
    async (commentText, isInternal = false) => {
      await addComment(ticketId, { commentText, isInternal });
      await refetch();
    },
    [ticketId, refetch]
  );

  return {
    ticket:   data?.ticket   ?? null,
    history:  data?.history  ?? [],
    comments: data?.comments ?? [],
    loading,
    error,
    refetch,
    doChangeStatus,
    doAssign,
    doAddComment,
  };
}
