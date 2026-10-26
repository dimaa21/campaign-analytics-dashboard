import type { MetricDeltas, MetricKey, Metrics } from '../types';

/** CR = leads / clicks. Zero clicks yield 0 so the UI never shows NaN. */
export function cr(leads: number, clicks: number): number {
  if (!Number.isFinite(leads) || !Number.isFinite(clicks) || clicks <= 0) return 0;
  return leads / clicks;
}

/** EPC = revenue / clicks. */
export function epc(revenue: number, clicks: number): number {
  if (!Number.isFinite(revenue) || !Number.isFinite(clicks) || clicks <= 0) return 0;
  return revenue / clicks;
}

/** Profit = revenue - cost. */
export function profit(revenue: number, cost: number): number {
  if (!Number.isFinite(revenue) || !Number.isFinite(cost)) return 0;
  return revenue - cost;
}

/** ROI = (revenue - cost) / cost. Zero spend yields 0 instead of Infinity. */
export function roi(revenue: number, cost: number): number {
  if (!Number.isFinite(revenue) || !Number.isFinite(cost) || cost <= 0) return 0;
  return (revenue - cost) / cost;
}

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function toMetrics(input: {
  clicks: number;
  leads: number;
  revenue: number;
  cost: number;
}): Metrics {
  return {
    clicks: input.clicks,
    leads: input.leads,
    cr: cr(input.leads, input.clicks),
    epc: epc(input.revenue, input.clicks),
    revenue: roundMoney(input.revenue),
    cost: roundMoney(input.cost),
    profit: roundMoney(profit(input.revenue, input.cost)),
    roi: roi(input.revenue, input.cost),
  };
}

/**
 * Relative change versus the previous period.
 * A zero baseline becomes 0 when nothing changed and 1 (100%) when the current value is non-zero.
 * The denominator is the absolute previous value so a swing from -20 to -10 reads as an improvement.
 */
export function relativeDelta(current: number, previous: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return 0;
  if (previous === 0) return current === 0 ? 0 : 1;
  return (current - previous) / Math.abs(previous);
}

const METRIC_KEYS: MetricKey[] = [
  'clicks',
  'leads',
  'cr',
  'epc',
  'revenue',
  'cost',
  'profit',
  'roi',
];

export function metricDeltas(current: Metrics, previous: Metrics): MetricDeltas {
  return METRIC_KEYS.reduce<MetricDeltas>((deltas, key) => {
    deltas[key] = relativeDelta(current[key], previous[key]);
    return deltas;
  }, {} as MetricDeltas);
}
