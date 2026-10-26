export const VERTICALS = ['Nutra', 'Crypto', 'Dating', 'Gambling'] as const;
export type Vertical = (typeof VERTICALS)[number];

export const TRAFFIC_SOURCES = ['Facebook', 'TikTok', 'Google', 'Push'] as const;
export type TrafficSourceName = (typeof TRAFFIC_SOURCES)[number];

export const CONVERSION_STATUSES = ['lead', 'approved', 'rejected'] as const;
export type ConversionStatus = (typeof CONVERSION_STATUSES)[number];

export const DATE_PRESETS = ['today', '7d', '30d', 'custom'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export interface Offer {
  id: string;
  name: string;
  vertical: Vertical;
  payout: number;
}

export interface Geo {
  code: string;
  name: string;
  payoutMultiplier: number;
}

export interface TrafficSource {
  id: string;
  name: TrafficSourceName;
}

export interface Campaign {
  id: string;
  name: string;
  offerId: string;
  geoCode: string;
  sourceId: string;
}

export interface DailyStat {
  date: string;
  campaignId: string;
  clicks: number;
  leads: number;
  revenue: number;
  cost: number;
}

export interface Dataset {
  offers: Offer[];
  geos: Geo[];
  sources: TrafficSource[];
  campaigns: Campaign[];
  daily: DailyStat[];
}

export interface Metrics {
  clicks: number;
  leads: number;
  cr: number;
  epc: number;
  revenue: number;
  cost: number;
  profit: number;
  roi: number;
}

export type MetricKey = keyof Metrics;
export type MetricDeltas = Record<MetricKey, number>;

export type SourceFilter = TrafficSourceName | 'all';
export type VerticalFilter = Vertical | 'all';

export interface Filters {
  preset: DatePreset;
  from: string;
  to: string;
  geos: string[];
  offers: string[];
  source: SourceFilter;
  vertical: VerticalFilter;
}

export interface StatsQuery {
  from: string;
  to: string;
  geos: string[];
  offers: string[];
  source: SourceFilter;
  vertical: VerticalFilter;
}

export interface KpiSnapshot {
  current: Metrics;
  previous: Metrics;
  deltas: MetricDeltas;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
  leads: number;
  revenue: number;
}

export interface GeoProfitPoint {
  code: string;
  geo: string;
  profit: number;
}

export interface VerticalSharePoint {
  vertical: Vertical;
  revenue: number;
}

export interface CampaignRow extends Metrics {
  campaignId: string;
  offer: string;
  offerId: string;
  geo: string;
  geoCode: string;
  source: TrafficSourceName;
  vertical: Vertical;
}

export interface StatsResponse {
  kpis: KpiSnapshot;
  series: TimeSeriesPoint[];
  profitByGeo: GeoProfitPoint[];
  revenueByVertical: VerticalSharePoint[];
  rows: CampaignRow[];
}

export interface LiveConversion {
  id: string;
  time: string;
  date: string;
  offerId: string;
  offerName: string;
  geoCode: string;
  geoName: string;
  source: TrafficSourceName;
  payout: number;
  status: ConversionStatus;
  campaignId: string;
}

export interface Catalog {
  offers: Offer[];
  geos: Geo[];
  sources: TrafficSource[];
}

export function isVertical(value: string): value is Vertical {
  return VERTICALS.some((vertical) => vertical === value);
}

export function isTrafficSource(value: string): value is TrafficSourceName {
  return TRAFFIC_SOURCES.some((source) => source === value);
}

export function isDatePreset(value: string): value is DatePreset {
  return DATE_PRESETS.some((preset) => preset === value);
}
