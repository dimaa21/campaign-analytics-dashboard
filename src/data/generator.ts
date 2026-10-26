import type { Campaign, DailyStat, Dataset } from '../types';
import { addDays, formatISODate, isWeekend } from '../utils/dates';
import { roundMoney } from '../utils/metrics';
import {
  DATA_SEED,
  GEOS,
  GEO_CPC,
  GEO_VOLUME,
  HISTORY_DAYS,
  OFFERS,
  SOURCES,
  SOURCE_PROFILE,
} from './catalog';
import { clamp, mulberry32, shuffle } from './rng';

export interface GenerateOptions {
  seed?: number;
  asOf?: Date;
  days?: number;
}

function cloneCatalog(): Pick<Dataset, 'offers' | 'geos' | 'sources'> {
  return {
    offers: OFFERS.map((offer) => ({ ...offer })),
    geos: GEOS.map((geo) => ({ ...geo })),
    sources: SOURCES.map((source) => ({ ...source })),
  };
}

function buildCampaigns(random: () => number): Campaign[] {
  const campaigns: Campaign[] = [];
  let sequence = 1;

  for (const offer of OFFERS) {
    const geoCount = 2 + Math.floor(random() * 2);
    const sourceCount = 1 + Math.floor(random() * 2);
    const geos = shuffle(GEOS, random).slice(0, geoCount);
    const sources = shuffle(SOURCES, random).slice(0, sourceCount);

    for (const geo of geos) {
      for (const source of sources) {
        campaigns.push({
          id: `cmp-${String(sequence).padStart(3, '0')}`,
          name: `${offer.name} · ${geo.code} · ${source.name}`,
          offerId: offer.id,
          geoCode: geo.code,
          sourceId: source.id,
        });
        sequence += 1;
      }
    }
  }

  return campaigns;
}

export function generateDataset(options: GenerateOptions = {}): Dataset {
  const seed = options.seed ?? DATA_SEED;
  const days = options.days ?? HISTORY_DAYS;
  const asOf = new Date(options.asOf ?? new Date());
  asOf.setHours(12, 0, 0, 0);
  const random = mulberry32(seed);
  const catalog = cloneCatalog();
  const campaigns = buildCampaigns(random);
  const offerById = new Map(catalog.offers.map((offer) => [offer.id, offer]));
  const geoByCode = new Map(catalog.geos.map((geo) => [geo.code, geo]));
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]));
  const daily: DailyStat[] = [];

  for (const campaign of campaigns) {
    const offer = offerById.get(campaign.offerId);
    const geo = geoByCode.get(campaign.geoCode);
    const source = sourceById.get(campaign.sourceId);
    if (!offer || !geo || !source) continue;

    const profile = SOURCE_PROFILE[source.name];
    const volume = GEO_VOLUME[geo.code] ?? 1;
    const geoCpc = GEO_CPC[geo.code] ?? 1;
    const baseClicks = profile.clicks * volume * (0.75 + random() * 0.55);
    const baseCr = 0.01 + random() * 0.07;
    // Wide efficiency spread so the table contains both winning and losing rows.
    const efficiency = 0.32 + random() * 1.25;
    const baseCpc = (profile.cpc * geoCpc) / efficiency;

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = addDays(asOf, -offset);
      const weekend = isWeekend(date);
      const wave = 0.82 + random() * 0.36;
      const clicks = Math.max(8, Math.round(baseClicks * wave * (weekend ? 0.62 : 1)));
      const dailyCr = clamp(baseCr * (0.8 + random() * 0.4), 0.01, 0.08);
      const leads = Math.min(clicks, Math.round(clicks * dailyCr));
      const approval = 0.4 + random() * 0.38;
      const approved = Math.round(leads * approval);
      const unitPayout = offer.payout * geo.payoutMultiplier;
      const revenue = roundMoney(approved * unitPayout);
      const cost = roundMoney(clicks * baseCpc * (0.9 + random() * 0.2) * (weekend ? 0.9 : 1));

      daily.push({
        date: formatISODate(date),
        campaignId: campaign.id,
        clicks,
        leads,
        revenue,
        cost,
      });
    }
  }

  return { ...catalog, campaigns, daily };
}
