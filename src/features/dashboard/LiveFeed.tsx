import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePostbackFeed } from '../../hooks/usePostbackFeed';
import { formatClock } from '../../utils/dates';
import { formatMoney } from '../../utils/format';

export function LiveFeed() {
  const { events, paused, toggle } = usePostbackFeed();
  const latest = events[0];

  return (
    <Panel
      title="Live conversions"
      description="A new postback arrives every few seconds."
      action={
        <Button onClick={toggle} aria-pressed={paused}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
      }
    >
      <p className="sr-only" aria-live="polite">
        {latest
          ? `New conversion. ${latest.offerName}, ${latest.geoCode}, ${formatMoney(latest.payout)}, ${latest.status}.`
          : 'Waiting for conversions.'}
      </p>
      <div tabIndex={0} className="max-h-72 overflow-auto rounded-md" aria-label="Recent conversions">
        {events.length === 0 ? (
          <p className="px-1 py-6 text-sm text-muted">Waiting for the next postback…</p>
        ) : (
          <ol className="divide-y divide-line">
            {events.map((event) => (
              <li key={event.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 py-2 text-sm">
                <time dateTime={event.time} className="font-mono text-xs text-muted">
                  {formatClock(event.time)}
                </time>
                <div className="min-w-0">
                  <p className="truncate font-medium">{event.offerName}</p>
                  <p className="text-xs text-muted">
                    {event.geoCode} · {event.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs tabular-nums">{formatMoney(event.payout)}</p>
                  <StatusBadge status={event.status} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Panel>
  );
}
