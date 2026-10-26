import type { DailyStat, LiveConversion } from '../types';

const extras: DailyStat[] = [];
const listeners = new Set<() => void>();

export function getLiveExtras(): readonly DailyStat[] {
  return extras;
}

export function subscribeLive(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetLiveExtras(): void {
  extras.length = 0;
}

/** Applies one postback to today's in-memory stats. Revenue is credited only when the status is approved. */
export function recordConversion(event: LiveConversion): void {
  extras.push({
    date: event.date,
    campaignId: event.campaignId,
    clicks: 0,
    leads: 1,
    revenue: event.status === 'approved' ? event.payout : 0,
    cost: 0,
  });
  listeners.forEach((listener) => listener());
}
