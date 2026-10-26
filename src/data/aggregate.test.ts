import { describe, expect, it } from 'vitest';
import type { Dataset, StatsQuery } from '../types';
import { buildStats } from './aggregate';
import { getLiveExtras, recordConversion, resetLiveExtras } from './live';

const dataset: Dataset = {
  offers: [{ id: 'o1', name: 'Northpeak Metabolic', vertical: 'Nutra', payout: 40 }],
  geos: [{ code: 'US', name: 'United States', payoutMultiplier: 1 }],
  sources: [{ id: 's1', name: 'Facebook' }],
  campaigns: [
    { id: 'c1', name: 'Northpeak · US · Facebook', offerId: 'o1', geoCode: 'US', sourceId: 's1' },
  ],
  daily: [
    { date: '2026-10-25', campaignId: 'c1', clicks: 100, leads: 4, revenue: 40, cost: 20 },
    { date: '2026-10-26', campaignId: 'c1', clicks: 200, leads: 10, revenue: 80, cost: 50 },
  ],
};

const today: StatsQuery = {
  from: '2026-10-26',
  to: '2026-10-26',
  geos: [],
  offers: [],
  source: 'all',
  vertical: 'all',
};

describe('buildStats', () => {
  it('rolls daily rows into metrics and a previous-period delta', () => {
    const stats = buildStats(dataset, [], today);

    expect(stats.kpis.current).toMatchObject({
      clicks: 200,
      leads: 10,
      revenue: 80,
      cost: 50,
      profit: 30,
    });
    expect(stats.kpis.current.cr).toBeCloseTo(0.05);
    expect(stats.kpis.current.epc).toBeCloseTo(0.4);
    expect(stats.kpis.current.roi).toBeCloseTo(0.6);
    expect(stats.kpis.deltas.clicks).toBeCloseTo(1);
    expect(stats.kpis.deltas.roi).toBeCloseTo(-0.4);
    expect(stats.rows).toHaveLength(1);
    expect(stats.rows[0]?.clicks).toBe(stats.kpis.current.clicks);
    expect(stats.profitByGeo[0]).toEqual({ code: 'US', geo: 'United States', profit: 30 });
    expect(stats.revenueByVertical).toEqual([{ vertical: 'Nutra', revenue: 80 }]);
    expect(stats.series).toEqual([{ date: '2026-10-26', clicks: 200, leads: 10, revenue: 80 }]);
  });

  it('credits revenue only for an approved live postback', () => {
    resetLiveExtras();
    recordConversion({
      id: 'evt-1',
      time: '2026-10-26T12:00:00.000Z',
      date: '2026-10-26',
      offerId: 'o1',
      offerName: 'Northpeak Metabolic',
      geoCode: 'US',
      geoName: 'United States',
      source: 'Facebook',
      payout: 10,
      status: 'approved',
      campaignId: 'c1',
    });
    recordConversion({
      id: 'evt-2',
      time: '2026-10-26T12:00:02.000Z',
      date: '2026-10-26',
      offerId: 'o1',
      offerName: 'Northpeak Metabolic',
      geoCode: 'US',
      geoName: 'United States',
      source: 'Facebook',
      payout: 0,
      status: 'rejected',
      campaignId: 'c1',
    });

    const stats = buildStats(dataset, getLiveExtras(), today);

    expect(stats.kpis.current.leads).toBe(12);
    expect(stats.kpis.current.revenue).toBe(90);
    expect(stats.kpis.current.profit).toBe(40);
    resetLiveExtras();
  });
});
