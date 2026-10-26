import { useId, type ReactNode } from 'react';

export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 rounded-xl border border-line bg-panel p-4 shadow-[var(--shadow)]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-sm font-semibold text-ink">
            {title}
          </h2>
          {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
