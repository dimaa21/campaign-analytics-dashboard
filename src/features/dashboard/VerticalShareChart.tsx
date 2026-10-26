import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Vertical, VerticalSharePoint } from '../../types';
import { formatMoney, formatPercent } from '../../utils/format';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Panel } from '../../components/ui/Panel';
import { useChartColors } from './palette';
import { ChartTooltip, formatProfitValue } from './ChartTooltip';

export function VerticalShareChart({ data }: { data: VerticalSharePoint[] }) {
  const colors = useChartColors();
  const reduceMotion = usePrefersReducedMotion();
  const total = data.reduce((sum, point) => sum + point.revenue, 0);
  const colorFor: Record<Vertical, string> = {
    Nutra: colors.nutra,
    Crypto: colors.crypto,
    Dating: colors.dating,
    Gambling: colors.gambling,
  };
  const summary = data
    .map((point) => `${point.vertical} ${formatPercent(total > 0 ? point.revenue / total : 0, 1)}`)
    .join(', ');

  return (
    <Panel title="Revenue by vertical" description="Share of credited revenue across offer verticals.">
      {data.length === 0 ? (
        <p className="text-sm text-muted">No revenue for these filters.</p>
      ) : (
        <div className="h-80 w-full min-w-0" role="img" aria-label={`Revenue share by vertical. ${summary}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="revenue"
                nameKey="vertical"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                stroke={colors.panel}
                isAnimationActive={!reduceMotion}
              >
                {data.map((point) => (
                  <Cell key={point.vertical} fill={colorFor[point.vertical]} />
                ))}
              </Pie>
              <Tooltip
                content={(props) => (
                  <ChartTooltip active={props.active} payload={props.payload} formatValue={formatProfitValue} />
                )}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="sr-only">{formatMoney(total)} total revenue.</p>
        </div>
      )}
    </Panel>
  );
}
