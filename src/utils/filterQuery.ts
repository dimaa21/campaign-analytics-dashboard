import type { DatePreset, Filters, SourceFilter, VerticalFilter } from '../types';
import { isDatePreset, isTrafficSource, isVertical } from '../types';
import { clampRange, isValidDate, rangeForPreset } from './dates';

function todayAtNoon(today: Date): Date {
  const next = new Date(today);
  next.setHours(12, 0, 0, 0);
  return next;
}

export function defaultFilters(today = new Date()): Filters {
  const range = rangeForPreset('7d', todayAtNoon(today));
  return {
    preset: '7d',
    from: range.from,
    to: range.to,
    geos: [],
    offers: [],
    source: 'all',
    vertical: 'all',
  };
}

function readList(value: string | null, pattern: RegExp): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  for (const part of value.split(',')) {
    const item = part.trim();
    if (pattern.test(item)) seen.add(item);
  }
  return [...seen];
}

export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  params.set('preset', filters.preset);
  params.set('from', filters.from);
  params.set('to', filters.to);
  if (filters.geos.length > 0) params.set('geo', filters.geos.join(','));
  if (filters.offers.length > 0) params.set('offer', filters.offers.join(','));
  if (filters.source !== 'all') params.set('source', filters.source);
  if (filters.vertical !== 'all') params.set('vertical', filters.vertical);
  return params.toString();
}

export function parseFilters(search: string, today = new Date()): Filters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const noon = todayAtNoon(today);
  const presetValue = params.get('preset');
  let preset: DatePreset = presetValue && isDatePreset(presetValue) ? presetValue : '7d';
  const fallback = rangeForPreset(preset === 'custom' ? '7d' : preset, noon);
  const fromValue = params.get('from');
  const toValue = params.get('to');
  const from = fromValue && isValidDate(fromValue) ? fromValue : fallback.from;
  const to = toValue && isValidDate(toValue) ? toValue : fallback.to;
  const range = clampRange(from, to);

  if (preset !== 'custom') {
    const expected = rangeForPreset(preset, noon);
    if (expected.from !== range.from || expected.to !== range.to) preset = 'custom';
  }

  const sourceValue = params.get('source');
  const source: SourceFilter = sourceValue && isTrafficSource(sourceValue) ? sourceValue : 'all';
  const verticalValue = params.get('vertical');
  const vertical: VerticalFilter = verticalValue && isVertical(verticalValue) ? verticalValue : 'all';

  return {
    preset,
    from: range.from,
    to: range.to,
    geos: readList(params.get('geo'), /^[A-Z]{2}$/),
    offers: readList(params.get('offer'), /^[a-z0-9-]+$/),
    source,
    vertical,
  };
}

export function canonicalizeSearch(search: string, today = new Date()): string {
  return serializeFilters(parseFilters(search, today));
}
