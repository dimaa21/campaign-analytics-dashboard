import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LiveConversion } from '../types';
import { intervalTransport, type PostbackTransport } from '../data/feed';
import { recordConversion } from '../data/live';

export interface PostbackFeed {
  events: LiveConversion[];
  paused: boolean;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
}

const FeedContext = createContext<PostbackFeed | null>(null);

export function FeedProvider({
  children,
  transport = intervalTransport,
}: {
  children: ReactNode;
  transport?: PostbackTransport;
}) {
  const [paused, setPaused] = useState(false);
  const [events, setEvents] = useState<LiveConversion[]>([]);

  useEffect(() => {
    if (paused) return undefined;
    return transport.connect((event) => {
      recordConversion(event);
      setEvents((current) => [event, ...current].slice(0, 24));
    });
  }, [paused, transport]);

  const value = useMemo<PostbackFeed>(
    () => ({
      events,
      paused,
      pause: () => setPaused(true),
      resume: () => setPaused(false),
      toggle: () => setPaused((current) => !current),
    }),
    [events, paused],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function usePostbackFeed(): PostbackFeed {
  const feed = useContext(FeedContext);
  if (!feed) throw new Error('usePostbackFeed must be used within FeedProvider');
  return feed;
}
