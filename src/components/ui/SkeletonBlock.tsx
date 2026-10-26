import { cx } from '../../utils/cx';

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cx('rounded-md bg-line/80 motion-safe:animate-pulse', className)} />;
}
