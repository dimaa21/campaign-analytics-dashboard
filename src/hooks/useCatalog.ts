import { useEffect, useState } from 'react';
import type { Catalog } from '../types';
import { getGeos, getOffers, getSources } from '../api/client';

export function useCatalog(): { catalog: Catalog | null; error: string | null } {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOffers(), getGeos(), getSources()])
      .then(([offers, geos, sources]) => {
        if (!cancelled) setCatalog({ offers, geos, sources });
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Failed to load filters.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, error };
}
