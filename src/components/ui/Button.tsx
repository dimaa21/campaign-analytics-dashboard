import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

type Variant = 'solid' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-ink text-canvas hover:opacity-90',
  ghost: 'border border-line bg-panel text-ink hover:border-accent',
};

export function Button({ variant = 'ghost', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
