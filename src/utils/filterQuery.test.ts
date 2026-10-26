import { describe, expect, it } from 'vitest';
import { parseFilters, serializeFilters } from './filterQuery';
import { previousRange, rangeForPreset } from './dates';
import type { Filters } from '../types';

const today = new Date(2026, 9, 26, 15, 0, 0, 0);

describe('filter query', () => {
  it('round-trips a custom selection', () => {
    const filters: Filters = {
      preset: 'custom',
      from: '2026-10-01',
      to: '2026-10-20',
      geos: ['US', 'DE'],
      offers: ['off-northpeak'],
      source: 'TikTok',
      vertical: 'Nutra',
    };

    expect(parseFilters(serializeFilters(filters), today)).toEqual(filters);
  });

  it('keeps a 7 day preset when the dates still match today', () => {
    const range = rangeForPreset('7d', new Date(2026, 9, 26, 12, 0, 0, 0));
    const filters: Filters = {
      preset: '7d',
      ...range,
      geos: [],
      offers: [],
      source: 'all',
      vertical: 'all',
    };

    expect(parseFilters(`?${serializeFilters(filters)}`, today)).toEqual(filters);
    expect(range).toEqual({ from: '2026-10-20', to: '2026-10-26' });
  });

  it('places the comparison window immediately before the selected range', () => {
    expect(previousRange('2026-10-20', '2026-10-26')).toEqual({
      from: '2026-10-13',
      to: '2026-10-19',
    });
    expect(previousRange('2026-10-26', '2026-10-26')).toEqual({
      from: '2026-10-25',
      to: '2026-10-25',
    });
  });
});
