import { cx } from '../../utils/cx';
import { formatSignedPercent } from '../../utils/format';

function DeltaArrow({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'flat') {
    return (
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
        <path d="M2 6h8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  const up = direction === 'up';
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
      <path
        d={up ? 'M6 2.5 10 8H2L6 2.5Z' : 'M6 9.5 2 4h8L6 9.5Z'}
        fill="currentColor"
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  invert = false,
}: {
  label: string;
  value: string;
  delta: number;
  invert?: boolean;
}) {
  const up = delta > 0.0005;
  const down = delta < -0.0005;
  const positive = invert ? down : up;
  const negative = invert ? up : down;
  const tone = positive ? 'text-good' : negative ? 'text-bad' : 'text-muted';

  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-3 shadow-[var(--shadow)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-mono text-lg font-medium tracking-tight text-ink tabular-nums">{value}</p>
      <p className={cx('mt-2 flex items-center gap-1 font-mono text-xs tabular-nums', tone)}>
        <DeltaArrow direction={up ? 'up' : down ? 'down' : 'flat'} />
        <span>{formatSignedPercent(delta)}</span>
        <span className="font-sans text-muted">vs prev</span>
      </p>
    </div>
  );
}
