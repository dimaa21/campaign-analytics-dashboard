import { describe, expect, it } from 'vitest';
import { getOffers, getStats } from './client';

describe('tracker api', () => {
  it('rejects an inverted date range before waiting on the network delay', async () => {
    await expect(
      getStats({
        from: '2026-10-26',
        to: '2026-10-01',
        geos: [],
        offers: [],
        source: 'all',
        vertical: 'all',
      }),
    ).rejects.toThrow(/invalid/i);
  });

  it('returns the fictional offer catalog', async () => {
    const offers = await getOffers();
    expect(offers.map((offer) => offer.name)).toContain('Northpeak Metabolic');
    expect(offers.every((offer) => offer.payout > 0)).toBe(true);
  });
});
