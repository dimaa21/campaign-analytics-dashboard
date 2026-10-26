import { generateDataset } from './generator';
import { HISTORY_DAYS } from './catalog';
import type { Dataset } from '../types';

let cached: Dataset | null = null;

export function getDataset(): Dataset {
  if (!cached) {
    const asOf = new Date();
    asOf.setHours(12, 0, 0, 0);
    cached = generateDataset({ asOf, days: HISTORY_DAYS });
  }
  return cached;
}
