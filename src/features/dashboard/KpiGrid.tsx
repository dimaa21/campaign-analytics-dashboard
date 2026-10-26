import type { KpiSnapshot, MetricKey } from '../../types';
import { formatRangeLabel, previousRange } from '../../utils/dates';
import { formatInteger, formatMoney, formatPercent } from '../../utils/format';
import { KpiCard } from './KpiCard';

const CARDS: Array<{
  key: MetricKey;
  label: string;
  invert?: boolean;
  format: (kpis: KpiSnapshot) => string;
}> = [
  { key: 'clicks', label: 'Clicks', format: (kpis) => formatInteger(kpis.current.clicks) },
  { key: 'leads', label: 'Leads', format: (kpis) => formatInteger(kpis.current.leads) },
  { key: 'cr', label: 'CR', format: (kpis) => formatPercent(kpis.current.cr, 2) },
  { key: 'epc', label: 'EPC', format: (kpis) => formatMoney(kpis.current.epc, 3) },
  { key: 'revenue', label: 'Revenue', format: (kpis) => formatMoney(kpis.current.revenue) },
  { key: 'cost', label: 'Cost', invert: true, format: (kpis) => formatMoney(kpis.current.cost) },
  { key: 'profit', label: 'Profit', format: (kpis) => formatMoney(kpis.current.profit) },
  { key: 'roi', label: 'ROI', format: (kpis) => formatPercent(kpis.current.roi, 1) },
];

export function KpiGrid({ kpis, from, to }: { kpis: KpiSnapshot; from: string; to: string }) {
  const previous = previousRange(from, to);
  return (
    <section aria-labelledby="kpi-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id="kpi-heading" className="text-sm font-semibold text-ink">
          Key metrics
        </h2>
        <p className="text-xs text-muted">Compared with {formatRangeLabel(previous.from, previous.to)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CARDS.map((card) => (
          <KpiCard
            key={card.key}
            label={card.label}
            value={card.format(kpis)}
            delta={kpis.deltas[card.key]}
            invert={card.invert}
          />
        ))}
      </div>
    </section>
  );
}
