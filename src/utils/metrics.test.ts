import { describe, expect, it } from 'vitest';
import { cr, epc, metricDeltas, profit, relativeDelta, roi, toMetrics } from './metrics';

describe('metric formulas', () => {
  it('computes CR, EPC, profit and ROI', () => {
    expect(cr(4, 100)).toBeCloseTo(0.04);
    expect(epc(40, 100)).toBeCloseTo(0.4);
    expect(profit(80, 50)).toBe(30);
    expect(roi(80, 50)).toBeCloseTo(0.6);
  });

  it('returns 0 when the denominator is zero', () => {
    expect(cr(3, 0)).toBe(0);
    expect(epc(10, 0)).toBe(0);
    expect(roi(10, 0)).toBe(0);
    expect(toMetrics({ clicks: 0, leads: 0, revenue: 25, cost: 0 }).roi).toBe(0);
  });

  it('measures relative change, including a zero or negative baseline', () => {
    expect(relativeDelta(0, 0)).toBe(0);
    expect(relativeDelta(10, 0)).toBe(1);
    expect(relativeDelta(50, 100)).toBeCloseTo(-0.5);
    expect(relativeDelta(-10, -20)).toBeCloseTo(0.5);
  });

  it('builds a full delta map from two metric snapshots', () => {
    const current = toMetrics({ clicks: 200, leads: 10, revenue: 80, cost: 50 });
    const previous = toMetrics({ clicks: 100, leads: 4, revenue: 40, cost: 20 });
    const deltas = metricDeltas(current, previous);

    expect(deltas.clicks).toBeCloseTo(1);
    expect(deltas.roi).toBeCloseTo(-0.4);
    expect(deltas.epc).toBeCloseTo(0);
  });
});
