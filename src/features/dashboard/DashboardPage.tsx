import { useMemo } from 'react';
import type { StatsQuery } from '../../types';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { SkeletonBlock } from '../../components/ui/SkeletonBlock';
import { useCatalog } from '../../hooks/useCatalog';
import { useStats } from '../../hooks/useStats';
import { useFilterStore } from '../../store/filters';
import { CampaignTable } from './CampaignTable';
import { FilterBar } from './FilterBar';
import { GeoProfitChart } from './GeoProfitChart';
import { KpiGrid } from './KpiGrid';
import { LiveFeed } from './LiveFeed';
import { TimeSeriesChart } from './TimeSeriesChart';
import { VerticalShareChart } from './VerticalShareChart';

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonBlock key={index} className="h-24" />
        ))}
      </div>
      <SkeletonBlock className="h-80" />
    </div>
  );
}

export function DashboardPage() {
  const from = useFilterStore((state) => state.from);
  const to = useFilterStore((state) => state.to);
  const geos = useFilterStore((state) => state.geos);
  const offers = useFilterStore((state) => state.offers);
  const source = useFilterStore((state) => state.source);
  const vertical = useFilterStore((state) => state.vertical);
  const query = useMemo<StatsQuery>(
    () => ({ from, to, geos, offers, source, vertical }),
    [from, to, geos, offers, source, vertical],
  );
  const { data, loading, error, retry } = useStats(query);
  const { catalog, error: catalogError } = useCatalog();

  return (
    <div className="space-y-4" aria-busy={loading}>
      <div>
        <h1 className="text-lg font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-muted">Performance across offers, GEOs and traffic sources.</p>
      </div>
      <FilterBar catalog={catalog} />
      {loading && data ? (
        <p className="text-xs text-muted" role="status">
          Updating report…
        </p>
      ) : null}
      {catalogError ? <ErrorBanner message={catalogError} /> : null}
      {error ? <ErrorBanner message={error} onRetry={retry} /> : null}
      {loading && !data ? <DashboardSkeleton /> : null}
      {data ? (
        <>
          <KpiGrid kpis={data.kpis} from={from} to={to} />
          <div className="grid items-start gap-4 xl:grid-cols-3">
            <div className="order-2 min-w-0 xl:order-1 xl:col-span-2">
              <TimeSeriesChart data={data.series} />
            </div>
            <div className="order-1 min-w-0 xl:order-2">
              <LiveFeed />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <GeoProfitChart data={data.profitByGeo} />
            <VerticalShareChart data={data.revenueByVertical} />
          </div>
          <CampaignTable rows={data.rows} />
        </>
      ) : null}
    </div>
  );
}
