import type { Geo, Offer, StatsQuery, StatsResponse, TrafficSource } from '../types';
import { assertQuery, buildStats } from '../data/aggregate';
import { getDataset } from '../data/dataset';
import { getLiveExtras } from '../data/live';
import { delay } from './delay';

const STATS_DELAY_MS = 240;
const LIST_DELAY_MS = 140;

function copyOffers(offers: readonly Offer[]): Offer[] {
  return offers.map((offer) => ({ ...offer }));
}

function copyGeos(geos: readonly Geo[]): Geo[] {
  return geos.map((geo) => ({ ...geo }));
}

function copySources(sources: readonly TrafficSource[]): TrafficSource[] {
  return sources.map((source) => ({ ...source }));
}

/** Synchronous read used after a live postback so the dashboard does not flash a loading state. */
export function readStats(query: StatsQuery): StatsResponse {
  return buildStats(getDataset(), getLiveExtras(), query);
}

export async function getStats(query: StatsQuery): Promise<StatsResponse> {
  assertQuery(query);
  await delay(STATS_DELAY_MS);
  return readStats(query);
}

export async function getOffers(): Promise<Offer[]> {
  await delay(LIST_DELAY_MS);
  return copyOffers(getDataset().offers);
}

export async function getGeos(): Promise<Geo[]> {
  await delay(LIST_DELAY_MS);
  return copyGeos(getDataset().geos);
}

export async function getSources(): Promise<TrafficSource[]> {
  await delay(LIST_DELAY_MS);
  return copySources(getDataset().sources);
}

export const trackerApi = {
  getStats,
  getOffers,
  getGeos,
  getSources,
};
