import type {
  CampaignRow,
  DailyStat,
  Dataset,
  GeoProfitPoint,
  StatsQuery,
  StatsResponse,
  TimeSeriesPoint,
  Vertical,
  VerticalSharePoint,
} from '../types';
import { VERTICALS } from '../types';
import { addDays, formatISODate, inclusiveDays, parseISODate, previousRange } from '../utils/dates';
import { metricDeltas, roundMoney, toMetrics } from '../utils/metrics';
import { ApiError } from '../api/errors';

interface Bucket {
  clicks: number;
  leads: number;
  revenue: number;
  cost: number;
}

interface MatchedCampaign {
  offerName: string;
  offerId: string;
  vertical: Vertical;
  geoName: string;
  geoCode: string;
  sourceName: CampaignRow['source'];
}

function emptyBucket(): Bucket {
  return { clicks: 0, leads: 0, revenue: 0, cost: 0 };
}

function addBucket(bucket: Bucket, stat: DailyStat): void {
  bucket.clicks += stat.clicks;
  bucket.leads += stat.leads;
  bucket.revenue += stat.revenue;
  bucket.cost += stat.cost;
}

function touch(map: Map<string, Bucket>, key: string): Bucket {
  const existing = map.get(key);
  if (existing) return existing;
  const created = emptyBucket();
  map.set(key, created);
  return created;
}

export function assertQuery(query: StatsQuery): void {
  if (query.from > query.to || !/^\d{4}-\d{2}-\d{2}$/.test(query.from) || !/^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
    throw new ApiError('Date range is invalid.');
  }
  if (inclusiveDays(query.from, query.to) > 120) {
    throw new ApiError('Date range cannot exceed 120 days.');
  }
}

function indexCampaigns(dataset: Dataset): Map<string, MatchedCampaign> {
  const offers = new Map(dataset.offers.map((offer) => [offer.id, offer]));
  const geos = new Map(dataset.geos.map((geo) => [geo.code, geo]));
  const sources = new Map(dataset.sources.map((source) => [source.id, source]));
  const indexed = new Map<string, MatchedCampaign>();

  for (const campaign of dataset.campaigns) {
    const offer = offers.get(campaign.offerId);
    const geo = geos.get(campaign.geoCode);
    const source = sources.get(campaign.sourceId);
    if (!offer || !geo || !source) continue;
    indexed.set(campaign.id, {
      offerName: offer.name,
      offerId: offer.id,
      vertical: offer.vertical,
      geoName: geo.name,
      geoCode: geo.code,
      sourceName: source.name,
    });
  }

  return indexed;
}

function matches(campaign: MatchedCampaign, query: StatsQuery): boolean {
  if (query.geos.length > 0 && !query.geos.includes(campaign.geoCode)) return false;
  if (query.offers.length > 0 && !query.offers.includes(campaign.offerId)) return false;
  if (query.source !== 'all' && campaign.sourceName !== query.source) return false;
  if (query.vertical !== 'all' && campaign.vertical !== query.vertical) return false;
  return true;
}

export function buildStats(
  dataset: Dataset,
  extras: readonly DailyStat[],
  query: StatsQuery,
): StatsResponse {
  assertQuery(query);
  const campaigns = indexCampaigns(dataset);
  const geoNames = new Map(dataset.geos.map((geo) => [geo.code, geo.name]));
  const previous = previousRange(query.from, query.to);
  const currentBucket = emptyBucket();
  const previousBucket = emptyBucket();
  const byDate = new Map<string, Bucket>();
  const byCampaign = new Map<string, Bucket>();
  const byGeo = new Map<string, Bucket>();
  const byVertical = new Map<Vertical, Bucket>();

  let cursor = parseISODate(query.from);
  for (let guard = 0; guard < 121; guard += 1) {
    const key = formatISODate(cursor);
    byDate.set(key, emptyBucket());
    if (key === query.to) break;
    cursor = addDays(cursor, 1);
  }

  for (const stat of [...dataset.daily, ...extras]) {
    const campaign = campaigns.get(stat.campaignId);
    if (!campaign || !matches(campaign, query)) continue;
    const inCurrent = stat.date >= query.from && stat.date <= query.to;
    const inPrevious = stat.date >= previous.from && stat.date <= previous.to;
    if (inCurrent) {
      addBucket(currentBucket, stat);
      const day = byDate.get(stat.date);
      if (day) addBucket(day, stat);
      addBucket(touch(byCampaign, stat.campaignId), stat);
      addBucket(touch(byGeo, campaign.geoCode), stat);
      const verticalBucket = byVertical.get(campaign.vertical) ?? emptyBucket();
      addBucket(verticalBucket, stat);
      byVertical.set(campaign.vertical, verticalBucket);
    } else if (inPrevious) {
      addBucket(previousBucket, stat);
    }
  }

  const current = toMetrics(currentBucket);
  const previousMetrics = toMetrics(previousBucket);
  const series: TimeSeriesPoint[] = [...byDate.entries()].map(([date, bucket]) => ({
    date,
    clicks: bucket.clicks,
    leads: bucket.leads,
    revenue: roundMoney(bucket.revenue),
  }));

  const profitByGeo: GeoProfitPoint[] = [...byGeo.entries()]
    .map(([code, bucket]) => ({
      code,
      geo: geoNames.get(code) ?? code,
      profit: roundMoney(bucket.revenue - bucket.cost),
    }))
    .sort((left, right) => right.profit - left.profit);

  const revenueByVertical: VerticalSharePoint[] = VERTICALS.flatMap((vertical) => {
    const bucket = byVertical.get(vertical);
    if (!bucket || bucket.revenue <= 0) return [];
    return [{ vertical, revenue: roundMoney(bucket.revenue) }];
  });

  const rows: CampaignRow[] = [];
  for (const [campaignId, bucket] of byCampaign) {
    if (bucket.clicks === 0 && bucket.leads === 0 && bucket.revenue === 0 && bucket.cost === 0) continue;
    const campaign = campaigns.get(campaignId);
    if (!campaign) continue;
    rows.push({
      campaignId,
      offer: campaign.offerName,
      offerId: campaign.offerId,
      geo: campaign.geoName,
      geoCode: campaign.geoCode,
      source: campaign.sourceName,
      vertical: campaign.vertical,
      ...toMetrics(bucket),
    });
  }

  return {
    kpis: { current, previous: previousMetrics, deltas: metricDeltas(current, previousMetrics) },
    series,
    profitByGeo,
    revenueByVertical,
    rows,
  };
}
