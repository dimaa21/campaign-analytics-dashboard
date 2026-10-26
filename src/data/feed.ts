import type { ConversionStatus, LiveConversion } from '../types';
import { formatISODate } from '../utils/dates';
import { roundMoney } from '../utils/metrics';
import { getDataset } from './dataset';

let sequence = 0;

export function createLiveConversion(random: () => number = Math.random, now = new Date()): LiveConversion {
  const dataset = getDataset();
  const index = Math.floor(random() * dataset.campaigns.length);
  const campaign = dataset.campaigns[index];
  if (!campaign) throw new Error('Campaign catalog is empty.');

  const offer = dataset.offers.find((item) => item.id === campaign.offerId);
  const geo = dataset.geos.find((item) => item.code === campaign.geoCode);
  const source = dataset.sources.find((item) => item.id === campaign.sourceId);
  if (!offer || !geo || !source) throw new Error('Campaign is missing catalog data.');

  const roll = random();
  const status: ConversionStatus = roll < 0.68 ? 'approved' : roll < 0.88 ? 'lead' : 'rejected';
  const payout =
    status === 'approved' ? roundMoney(offer.payout * geo.payoutMultiplier * (0.92 + random() * 0.16)) : 0;

  sequence += 1;
  return {
    id: `evt-${now.getTime()}-${sequence}`,
    time: now.toISOString(),
    date: formatISODate(now),
    offerId: offer.id,
    offerName: offer.name,
    geoCode: geo.code,
    geoName: geo.name,
    source: source.name,
    payout,
    status,
    campaignId: campaign.id,
  };
}

export interface PostbackTransport {
  connect(onEvent: (event: LiveConversion) => void): () => void;
}

/**
 * Interval transport for the demo feed.
 * Swap this for a WebSocket client that calls `onEvent` with the same payload.
 */
export function createIntervalTransport(random: () => number = Math.random): PostbackTransport {
  return {
    connect(onEvent) {
      let intervalId = 0;
      const arm = () => {
        const delay = 2000 + Math.floor(random() * 3001);
        intervalId = window.setInterval(() => {
          onEvent(createLiveConversion(random));
          window.clearInterval(intervalId);
          arm();
        }, delay);
      };
      arm();
      return () => window.clearInterval(intervalId);
    },
  };
}

export const intervalTransport = createIntervalTransport();
