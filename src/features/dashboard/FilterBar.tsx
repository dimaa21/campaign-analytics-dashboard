import type { KeyboardEvent } from 'react';
import type { Catalog, DatePreset, SourceFilter, VerticalFilter } from '../../types';
import { TRAFFIC_SOURCES, VERTICALS, isTrafficSource, isVertical } from '../../types';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { useFilterStore } from '../../store/filters';
import { addDays, formatISODate, formatRangeLabel } from '../../utils/dates';
import { cx, fieldClass } from '../../utils/cx';

const PRESETS: Array<{ id: DatePreset; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: 'custom', label: 'Custom' },
];

export function FilterBar({ catalog }: { catalog: Catalog | null }) {
  const preset = useFilterStore((state) => state.preset);
  const from = useFilterStore((state) => state.from);
  const to = useFilterStore((state) => state.to);
  const geos = useFilterStore((state) => state.geos);
  const offers = useFilterStore((state) => state.offers);
  const source = useFilterStore((state) => state.source);
  const vertical = useFilterStore((state) => state.vertical);
  const setPreset = useFilterStore((state) => state.setPreset);
  const setFrom = useFilterStore((state) => state.setFrom);
  const setTo = useFilterStore((state) => state.setTo);
  const toggleGeo = useFilterStore((state) => state.toggleGeo);
  const toggleOffer = useFilterStore((state) => state.toggleOffer);
  const clearGeos = useFilterStore((state) => state.clearGeos);
  const clearOffers = useFilterStore((state) => state.clearOffers);
  const setSource = useFilterStore((state) => state.setSource);
  const setVertical = useFilterStore((state) => state.setVertical);

  const today = formatISODate(new Date());
  const earliest = formatISODate(addDays(new Date(), -61));

  const onPresetKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = PRESETS.findIndex((item) => item.id === preset);
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = PRESETS[(current + direction + PRESETS.length) % PRESETS.length];
    if (next) setPreset(next.id);
  };

  return (
    <section aria-label="Report filters" className="rounded-xl border border-line bg-panel p-3 shadow-[var(--shadow)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div>
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Range</span>
          <div
            role="radiogroup"
            aria-label="Date range"
            className="flex flex-wrap rounded-md border border-line bg-canvas p-0.5"
            onKeyDown={onPresetKeyDown}
          >
            {PRESETS.map((item) => {
              const selected = preset === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPreset(item.id)}
                  className={cx(
                    'rounded px-2.5 py-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-accent',
                    selected ? 'bg-ink text-canvas' : 'text-muted hover:text-ink',
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">From</span>
          <input
            type="date"
            className={fieldClass}
            value={from}
            min={earliest}
            max={to}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">To</span>
          <input
            type="date"
            className={fieldClass}
            value={to}
            min={from}
            max={today}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <p className="pb-2 text-xs text-muted lg:ml-auto">{formatRangeLabel(from, to)}</p>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <MultiSelect
          label="GEO"
          placeholder="All GEOs"
          options={(catalog?.geos ?? []).map((geo) => ({ value: geo.code, label: `${geo.code} · ${geo.name}` }))}
          selected={geos}
          onToggle={toggleGeo}
          onClear={clearGeos}
          disabled={!catalog}
        />
        <MultiSelect
          label="Offers"
          placeholder="All offers"
          options={(catalog?.offers ?? []).map((offer) => ({ value: offer.id, label: offer.name }))}
          selected={offers}
          onToggle={toggleOffer}
          onClear={clearOffers}
          disabled={!catalog}
        />
        <label className="min-w-[10.5rem] flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Source</span>
          <select
            className={cx(fieldClass, 'w-full')}
            value={source}
            disabled={!catalog}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all' || isTrafficSource(value)) setSource(value as SourceFilter);
            }}
          >
            <option value="all">All sources</option>
            {(catalog?.sources ?? TRAFFIC_SOURCES.map((name) => ({ id: name, name }))).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[10.5rem] flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Vertical</span>
          <select
            className={cx(fieldClass, 'w-full')}
            value={vertical}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all' || isVertical(value)) setVertical(value as VerticalFilter);
            }}
          >
            <option value="all">All verticals</option>
            {VERTICALS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-muted">Mock history covers the last 62 days. An empty GEO or offer selection means all.</p>
    </section>
  );
}
