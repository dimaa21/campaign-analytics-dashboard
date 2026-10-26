import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { GeoProfitPoint } from '../../types';
import { formatCompact, formatMoney } from '../../utils/format';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Panel } from '../../components/ui/Panel';
import { ChartTooltip, formatProfitValue } from './ChartTooltip';
import { useChartColors } from './palette';

export function GeoProfitChart({ data }: { data: GeoProfitPoint[] }) {
  const colors = useChartColors();
  const reduceMotion = usePrefersReducedMotion();
  const summary = data.map((point) => `${point.code} ${formatMoney(point.profit)}`).join(', ');

  return (
    <Panel title="Profit by GEO" description="Profit is revenue minus cost for the selected range.">
      {data.length === 0 ? (
        <p className="text-sm text-muted">No GEO breakdown for these filters.</p>
      ) : (
        <div className="h-80 w-full min-w-0" role="img" aria-label={`Profit by GEO. ${summary}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="code"
                tick={{ fill: colors.ink, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: colors.grid }}
                content={(props) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    label={typeof props.label === 'string' ? props.label : undefined}
                    formatValue={formatProfitValue}
                  />
                )}
              />
              <Bar dataKey="profit" name="Profit" radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion}>
                {data.map((point) => (
                  <Cell key={point.code} fill={point.profit < 0 ? colors.bad : colors.good} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
