import { describe, expect, it } from 'vitest';
import { buildStats } from './aggregate';
import { GEOS, OFFERS, SOURCES } from './catalog';
import { generateDataset } from './generator';
import { isWeekend } from '../utils/dates';
import { parseISODate } from '../utils/dates';

const asOf = new Date(2026, 9, 26, 12, 0, 0, 0);

describe('generateDataset', () => {
  it('is stable for the same seed', () => {
    const left = generateDataset({ seed: 42, asOf, days: 62 });
    const right = generateDataset({ seed: 42, asOf, days: 62 });
    expect(left).toEqual(right);
    expect(generateDataset({ seed: 99, asOf, days: 62 }).daily).not.toEqual(left.daily);
  });

  it('keeps leads inside clicks and links every row to a known campaign', () => {
    const dataset = generateDataset({ seed: 42, asOf, days: 30 });
    const campaignIds = new Set(dataset.campaigns.map((campaign) => campaign.id));
    const offerIds = new Set(OFFERS.map((offer) => offer.id));
    const geoCodes = new Set(GEOS.map((geo) => geo.code));
    const sourceIds = new Set(SOURCES.map((source) => source.id));

    expect(dataset.campaigns.length).toBeGreaterThan(20);
    expect(dataset.daily).toHaveLength(dataset.campaigns.length * 30);

    let clicks = 0;
    let leads = 0;
    for (const stat of dataset.daily) {
      expect(stat.leads).toBeLessThanOrEqual(stat.clicks);
      expect(stat.revenue).toBeGreaterThanOrEqual(0);
      expect(stat.cost).toBeGreaterThanOrEqual(0);
      expect(campaignIds.has(stat.campaignId)).toBe(true);
      clicks += stat.clicks;
      leads += stat.leads;
    }

    const rate = leads / clicks;
    expect(rate).toBeGreaterThan(0.008);
    expect(rate).toBeLessThan(0.09);

    for (const campaign of dataset.campaigns) {
      expect(offerIds.has(campaign.offerId)).toBe(true);
      expect(geoCodes.has(campaign.geoCode)).toBe(true);
      expect(sourceIds.has(campaign.sourceId)).toBe(true);
    }
  });

  it('sends less click volume on weekends than on weekdays', () => {
    const dataset = generateDataset({ seed: 42, asOf, days: 62 });
    let weekdayClicks = 0;
    let weekdayRows = 0;
    let weekendClicks = 0;
    let weekendRows = 0;

    for (const stat of dataset.daily) {
      if (isWeekend(parseISODate(stat.date))) {
        weekendClicks += stat.clicks;
        weekendRows += 1;
      } else {
        weekdayClicks += stat.clicks;
        weekdayRows += 1;
      }
    }

    expect(weekendClicks / weekendRows).toBeLessThan(weekdayClicks / weekdayRows);
  });

  it('contains both profitable and unprofitable campaigns', () => {
    const dataset = generateDataset({ seed: 42, asOf, days: 30 });
    const dates = dataset.daily.map((stat) => stat.date).sort();
    const from = dates[0];
    const to = dates[dates.length - 1];
    expect(from).toBeDefined();
    expect(to).toBeDefined();
    if (!from || !to) return;

    const stats = buildStats(dataset, [], {
      from,
      to,
      geos: [],
      offers: [],
      source: 'all',
      vertical: 'all',
    });

    expect(stats.rows.some((row) => row.roi > 0)).toBe(true);
    expect(stats.rows.some((row) => row.roi < 0)).toBe(true);
    expect(GEOS.find((geo) => geo.code === 'US')?.payoutMultiplier).toBeGreaterThan(
      GEOS.find((geo) => geo.code === 'IN')?.payoutMultiplier ?? 0,
    );
  });
});
