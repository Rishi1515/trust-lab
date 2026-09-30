import type { ReactNode } from 'react';
import { isInfoPath } from '../app/router';
import { APP_VERSION, SCENARIO_BANK_VERSION } from '../app/version';

type Props = {
  children: ReactNode;
  experimentHref: string;
  current: string;
};

export function Layout({ children, experimentHref, current }: Props) {
  const link = (href: string, label: string, active: boolean) => (
    <a href={`#${href}`} aria-current={active ? 'page' : undefined}>
      {label}
    </a>
  );
  const inFlow = !isInfoPath(current);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          // Move focus without changing the hash, which the router uses for pages.
          event.preventDefault();
          document.getElementById('page-title')?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand mono" href={`#${experimentHref}`}>
          TrustLab
        </a>
        <nav aria-label="Site">
          {link(experimentHref, 'Play', inFlow)}
          {link('/why', 'Why', current === '/why')}
          {link('/method', 'How it works', current === '/method')}
          {link('/credits', 'Credits', current === '/credits')}
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <p>The AI advice here is pretend and written in advance. Your answers stay in this browser.</p>
        <p className="mono">
          v{APP_VERSION} · cases {SCENARIO_BANK_VERSION}
        </p>
      </footer>
    </>
  );
}
