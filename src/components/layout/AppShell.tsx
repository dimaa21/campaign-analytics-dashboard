import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { usePostbackFeed } from '../../hooks/usePostbackFeed';
import { useTheme } from '../../hooks/useTheme';
import { bindFilterHistory, useFilterStore } from '../../store/filters';
import { cx } from '../../utils/cx';

function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8">
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <path d="M7 22V14h3.2v8H7Zm7.4 0V8h3.2v14h-3.2ZM21.8 22v-5H25v5h-3.2Z" className="fill-accent" />
    </svg>
  );
}

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { paused } = usePostbackFeed();
  const search = useFilterStore((state) => state.search);
  const query = search ? `?${search}` : '';

  useEffect(() => bindFilterHistory(), []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'rounded-md px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      isActive ? 'bg-ink text-canvas' : 'text-muted hover:text-ink',
    );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Affiliate tracker</p>
              <p className="text-sm font-semibold leading-5">Campaign Analytics</p>
            </div>
          </div>
          <nav aria-label="Primary" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            <NavLink to={{ pathname: '/', search: query }} end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to={{ pathname: '/postback', search: query }} className={linkClass}>
              Postback URL
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <p
              role="status"
              className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-xs font-medium"
            >
              <span
                aria-hidden="true"
                className={cx('h-2 w-2 rounded-full', paused ? 'bg-muted' : 'live-dot bg-accent')}
              />
              {paused ? 'Paused' : 'Live'}
            </p>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              className="h-9 rounded-md border border-line px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-4 outline-none sm:px-6 sm:py-6 lg:px-8"
      >
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[1440px] px-4 pb-8 text-xs text-muted sm:px-6 lg:px-8">
        Demo data only. Offers, GEOs and payouts are fictional.
      </footer>
    </div>
  );
}
