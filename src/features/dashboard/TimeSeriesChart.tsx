import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesPoint } from '../../types';
import { formatShortDate } from '../../utils/dates';
import { formatCompact, formatInteger, formatMoney } from '../../utils/format';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Panel } from '../../components/ui/Panel';
import { useChartColors } from './palette';
import { ChartTooltip, formatSeriesValue } from './ChartTooltip';

export function TimeSeriesChart({ data }: { data: TimeSeriesPoint[] }) {
  const colors = useChartColors();
  const reduceMotion = usePrefersReducedMotion();
  const clicks = data.reduce((sum, point) => sum + point.clicks, 0);
  const summary = `${data.length} days, ${formatInteger(clicks)} clicks and ${formatMoney(
    data.reduce((sum, point) => sum + point.revenue, 0),
  )} revenue. Clicks and leads use the left axis. Revenue uses the right axis.`;

  return (
    <Panel
      title="Clicks, leads and revenue"
      description="Clicks and leads use the left axis. Revenue uses the right axis."
    >
      {data.length === 0 ? (
        <p className="text-sm text-muted">No data for this range.</p>
      ) : (
        <div className="h-72 w-full min-w-0" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                yAxisId="volume"
                tickFormatter={formatCompact}
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <YAxis
                yAxisId="money"
                orientation="right"
                tickFormatter={formatCompact}
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    label={typeof props.label === 'string' ? formatShortDate(props.label) : undefined}
                    formatValue={formatSeriesValue}
                  />
                )}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
              <Area
                yAxisId="volume"
                type="monotone"
                dataKey="clicks"
                name="Clicks"
                stroke={colors.clicks}
                fill={colors.clicks}
                fillOpacity={0.16}
                strokeWidth={2}
                isAnimationActive={!reduceMotion}
              />
              <Line
                yAxisId="volume"
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke={colors.leads}
                strokeWidth={2}
                dot={false}
                isAnimationActive={!reduceMotion}
              />
              <Line
                yAxisId="money"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={colors.revenue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={!reduceMotion}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
