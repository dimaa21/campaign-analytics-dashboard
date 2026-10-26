import type { ConversionStatus } from '../../types';
import { cx } from '../../utils/cx';

const TONE: Record<ConversionStatus, string> = {
  approved: 'bg-good/15 text-good',
  lead: 'bg-accent/15 text-accent',
  rejected: 'bg-bad/15 text-bad',
};

export function StatusBadge({ status }: { status: ConversionStatus }) {
  return (
    <span className={cx('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', TONE[status])}>
      {status}
    </span>
  );
}
