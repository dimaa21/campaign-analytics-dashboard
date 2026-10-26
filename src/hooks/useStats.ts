import { useEffect, useRef, useState } from 'react';
import type { StatsQuery, StatsResponse } from '../types';
import { getStats, readStats } from '../api/client';
import { subscribeLive } from '../data/live';

function queryKey(query: StatsQuery): string {
  return JSON.stringify([query.from, query.to, query.geos, query.offers, query.source, query.vertical]);
}

export function useStats(query: StatsQuery): {
  data: StatsResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
} {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const queryRef = useRef(query);
  queryRef.current = query;
  const key = queryKey(query);

  useEffect(() => {
    const current = queryRef.current;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getStats(current)
      .then(() => {
        if (!cancelled) setData(readStats(queryRef.current));
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(reason instanceof Error ? reason.message : 'Failed to load statistics.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  useEffect(() => {
    return subscribeLive(() => {
      try {
        setData(readStats(queryRef.current));
        setError(null);
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : 'Failed to load statistics.');
      }
    });
  }, [key]);

  return {
    data,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
