import { Button } from './Button';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bad/40 bg-panel px-4 py-3 text-sm text-ink"
    >
      <p>{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} className="h-8">
          Retry
        </Button>
      ) : null}
    </div>
  );
}
