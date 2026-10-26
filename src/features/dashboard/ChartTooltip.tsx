import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatMoney, formatInteger } from '../../utils/format';

type PointTooltip = TooltipProps<ValueType, NameType>;

interface TooltipRow {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function readRows(payload: PointTooltip['payload']): TooltipRow[] {
  if (!payload) return [];
  return payload.flatMap((item) => {
    const raw = item.value;
    const value = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(value)) return [];
    return [
      {
        name: String(item.name ?? item.dataKey ?? 'Value'),
        value,
        color: item.color ?? 'currentColor',
        dataKey: String(item.dataKey ?? ''),
      },
    ];
  });
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: PointTooltip['payload'];
  label?: string | number;
  formatValue: (row: TooltipRow) => string;
}) {
  const rows = readRows(payload);
  if (!active || rows.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-medium text-ink">{label}</p> : null}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.dataKey || row.name} className="flex items-center justify-between gap-4 font-mono">
            <span style={{ color: row.color }}>{row.name}</span>
            <span className="text-ink">{formatValue(row)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function formatSeriesValue(row: TooltipRow): string {
  if (row.dataKey === 'revenue') return formatMoney(row.value);
  return formatInteger(row.value);
}

export function formatProfitValue(row: TooltipRow): string {
  return formatMoney(row.value);
}
