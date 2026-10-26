import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LiveConversion } from '../types';
import { createIntervalTransport, type PostbackTransport } from '../data/feed';
import { resetLiveExtras } from '../data/live';
import { FeedProvider, usePostbackFeed } from './usePostbackFeed';

const sample: LiveConversion = {
  id: 'evt-test',
  time: '2026-10-26T18:00:00.000Z',
  date: '2026-10-26',
  offerId: 'off-northpeak',
  offerName: 'Northpeak Metabolic',
  geoCode: 'US',
  geoName: 'United States',
  source: 'Facebook',
  payout: 48.6,
  status: 'approved',
  campaignId: 'cmp-001',
};

function Probe() {
  const feed = usePostbackFeed();
  return (
    <div>
      <p>count:{feed.events.length}</p>
      <p>paused:{String(feed.paused)}</p>
      <button type="button" onClick={feed.toggle}>
        toggle
      </button>
    </div>
  );
}

afterEach(() => {
  resetLiveExtras();
  vi.useRealTimers();
});

describe('usePostbackFeed', () => {
  it('records events from the injected transport and pauses the stream', () => {
    let emit: (event: LiveConversion) => void = () => undefined;
    const stop = vi.fn();
    const transport: PostbackTransport = {
      connect(onEvent) {
        emit = onEvent;
        return stop;
      },
    };

    render(
      <FeedProvider transport={transport}>
        <Probe />
      </FeedProvider>,
    );

    act(() => {
      emit(sample);
    });
    expect(screen.getByText('count:1')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'toggle' }).click();
    });
    expect(stop).toHaveBeenCalledOnce();
    expect(screen.getByText('paused:true')).toBeInTheDocument();
  });

  it('emits on a 2 second interval when the random delay is zero', () => {
    vi.useFakeTimers();
    const events: LiveConversion[] = [];
    const stop = createIntervalTransport(() => 0).connect((event) => events.push(event));

    vi.advanceTimersByTime(2000);
    expect(events).toHaveLength(1);
    vi.advanceTimersByTime(2000);
    expect(events).toHaveLength(2);
    stop();
    vi.advanceTimersByTime(5000);
    expect(events).toHaveLength(2);
  });
});
