// src/hooks/useFetch.js
// Generic hook: runs `fetchFn` whenever `deps` change.
// Identical pattern to what the handbook teaches in section 3.3 on useEffect.
// Every resource-specific hook builds on top of this one.

import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  // Track the latest fetch so a stale response from an earlier call
  // doesn't overwrite a newer one (e.g. filters changing quickly).
  const latestRef = useRef(0);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    const id = ++latestRef.current;
    try {
      const result = await fetchFn();
      if (id === latestRef.current) setData(result);
    } catch (err) {
      if (id === latestRef.current) {
        setError(err.response?.data?.error?.message || err.message || 'Something went wrong');
      }
    } finally {
      if (id === latestRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
