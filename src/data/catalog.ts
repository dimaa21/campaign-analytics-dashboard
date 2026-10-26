import type { Geo, Offer, TrafficSource, TrafficSourceName } from '../types';

export const OFFERS: readonly Offer[] = [
  { id: 'off-northpeak', name: 'Northpeak Metabolic', vertical: 'Nutra', payout: 36 },
  { id: 'off-clearpath', name: 'Clearpath Glucose', vertical: 'Nutra', payout: 44 },
  { id: 'off-harborline', name: 'Harborline Slim', vertical: 'Nutra', payout: 31 },
  { id: 'off-lumenwell', name: 'Lumenwell Focus', vertical: 'Nutra', payout: 27 },
  { id: 'off-paper-lantern', name: 'Paper Lantern Signals', vertical: 'Crypto', payout: 58 },
  { id: 'off-driftline', name: 'Driftline Wallet Guide', vertical: 'Crypto', payout: 49 },
  { id: 'off-cobalt', name: 'Cobalt Index Alerts', vertical: 'Crypto', payout: 66 },
  { id: 'off-marlowe', name: 'Marlowe Circle', vertical: 'Dating', payout: 16 },
  { id: 'off-kindred', name: 'Kindred Avenue', vertical: 'Dating', payout: 21 },
  { id: 'off-velvet', name: 'Velvet Lantern', vertical: 'Dating', payout: 13 },
  { id: 'off-copperline', name: 'Copperline Casino', vertical: 'Gambling', payout: 74 },
  { id: 'off-westferry', name: 'Westferry Spins', vertical: 'Gambling', payout: 69 },
  { id: 'off-amberwheel', name: 'Amberwheel Club', vertical: 'Gambling', payout: 92 },
];

export const GEOS: readonly Geo[] = [
  { code: 'US', name: 'United States', payoutMultiplier: 1.35 },
  { code: 'GB', name: 'United Kingdom', payoutMultiplier: 1.2 },
  { code: 'DE', name: 'Germany', payoutMultiplier: 1.15 },
  { code: 'CA', name: 'Canada', payoutMultiplier: 1.18 },
  { code: 'AU', name: 'Australia', payoutMultiplier: 1.28 },
  { code: 'BR', name: 'Brazil', payoutMultiplier: 0.62 },
  { code: 'MX', name: 'Mexico', payoutMultiplier: 0.55 },
  { code: 'IN', name: 'India', payoutMultiplier: 0.4 },
  { code: 'PL', name: 'Poland', payoutMultiplier: 0.72 },
  { code: 'ES', name: 'Spain', payoutMultiplier: 0.88 },
];

export const SOURCES: readonly TrafficSource[] = [
  { id: 'src-fb', name: 'Facebook' },
  { id: 'src-tt', name: 'TikTok' },
  { id: 'src-gg', name: 'Google' },
  { id: 'src-ps', name: 'Push' },
];

export const SOURCE_PROFILE: Record<TrafficSourceName, { clicks: number; cpc: number }> = {
  Facebook: { clicks: 280, cpc: 0.62 },
  TikTok: { clicks: 240, cpc: 0.36 },
  Google: { clicks: 150, cpc: 1.05 },
  Push: { clicks: 420, cpc: 0.09 },
};

export const GEO_VOLUME: Record<string, number> = {
  US: 1.15,
  GB: 0.72,
  DE: 0.8,
  CA: 0.55,
  AU: 0.48,
  BR: 1.05,
  MX: 0.7,
  IN: 1.35,
  PL: 0.5,
  ES: 0.58,
};

export const GEO_CPC: Record<string, number> = {
  US: 1.35,
  GB: 1.2,
  DE: 1.1,
  CA: 1.15,
  AU: 1.25,
  BR: 0.55,
  MX: 0.5,
  IN: 0.32,
  PL: 0.6,
  ES: 0.75,
};

export const HISTORY_DAYS = 62;
export const DATA_SEED = 0x5a17e;
