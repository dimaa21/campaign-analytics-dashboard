import type { DatePreset, Filters, SourceFilter, VerticalFilter } from '../types';
import { clampRange, isValidDate, rangeForPreset } from '../utils/dates';
import { canonicalizeSearch, parseFilters, serializeFilters } from '../utils/filterQuery';
import { create } from 'zustand';

interface FilterStore extends Filters {
  search: string;
  setPreset: (preset: DatePreset) => void;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  toggleGeo: (code: string) => void;
  toggleOffer: (id: string) => void;
  clearGeos: () => void;
  clearOffers: () => void;
  setSource: (source: SourceFilter) => void;
  setVertical: (vertical: VerticalFilter) => void;
  hydrate: (search: string) => void;
}

function snapshot(state: FilterStore): Filters {
  return {
    preset: state.preset,
    from: state.from,
    to: state.to,
    geos: state.geos,
    offers: state.offers,
    source: state.source,
    vertical: state.vertical,
  };
}

function withSearch(filters: Filters): Filters & { search: string } {
  return { ...filters, search: serializeFilters(filters) };
}

function noonToday(): Date {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

const initial = parseFilters(typeof window === 'undefined' ? '' : window.location.search);

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...withSearch(initial),
  setPreset: (preset) => {
    const current = snapshot(get());
    if (preset === 'custom') {
      set(withSearch({ ...current, preset: 'custom' }));
      return;
    }
    const range = rangeForPreset(preset, noonToday());
    set(withSearch({ ...current, preset, from: range.from, to: range.to }));
  },
  setFrom: (from) => {
    if (!isValidDate(from)) return;
    const current = snapshot(get());
    set(withSearch({ ...current, preset: 'custom', ...clampRange(from, current.to) }));
  },
  setTo: (to) => {
    if (!isValidDate(to)) return;
    const current = snapshot(get());
    set(withSearch({ ...current, preset: 'custom', ...clampRange(current.from, to) }));
  },
  toggleGeo: (code) => {
    const current = snapshot(get());
    const geos = current.geos.includes(code)
      ? current.geos.filter((item) => item !== code)
      : [...current.geos, code];
    set(withSearch({ ...current, geos }));
  },
  toggleOffer: (id) => {
    const current = snapshot(get());
    const offers = current.offers.includes(id)
      ? current.offers.filter((item) => item !== id)
      : [...current.offers, id];
    set(withSearch({ ...current, offers }));
  },
  clearGeos: () => set(withSearch({ ...snapshot(get()), geos: [] })),
  clearOffers: () => set(withSearch({ ...snapshot(get()), offers: [] })),
  setSource: (source) => set(withSearch({ ...snapshot(get()), source })),
  setVertical: (vertical) => set(withSearch({ ...snapshot(get()), vertical })),
  hydrate: (search) => {
    const next = withSearch(parseFilters(search));
    if (next.search === get().search) return;
    set(next);
  },
}));

/** Keeps the filter store and the query string aligned, including browser Back. */
export function bindFilterHistory(): () => void {
  let applyingHistory = false;

  const writeUrl = (search: string, mode: 'push' | 'replace') => {
    const actual = window.location.search.replace(/^\?/, '');
    if (actual === search || (actual.length > 0 && canonicalizeSearch(actual) === search)) return;
    const url = `${window.location.pathname}?${search}${window.location.hash}`;
    if (mode === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  };

  writeUrl(useFilterStore.getState().search, 'replace');

  const unsubscribe = useFilterStore.subscribe((state, previous) => {
    if (state.search === previous.search) return;
    writeUrl(state.search, applyingHistory ? 'replace' : 'push');
  });

  const onPop = () => {
    applyingHistory = true;
    useFilterStore.getState().hydrate(window.location.search);
    applyingHistory = false;
  };

  window.addEventListener('popstate', onPop);
  return () => {
    unsubscribe();
    window.removeEventListener('popstate', onPop);
  };
}
