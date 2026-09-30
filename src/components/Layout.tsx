import type { ReactNode } from 'react';
import { APP_VERSION, SCENARIO_BANK_VERSION } from '../app/version';

type Props = {
  children: ReactNode;
  experimentHref: string;
  current: string;
  motion: 'on' | 'off';
  onToggleMotion: () => void;
};

export function Layout({ children, experimentHref, current, motion, onToggleMotion }: Props) {
  const link = (href: string, label: string, active: boolean) => (
    <a href={`#${href}`} aria-current={active ? 'page' : undefined}>
      {label}
    </a>
  );
  const inFlow = current !== '/method' && current !== '/credits';
  return (
    <>
      <a className="skip-link" href="#page-title">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand mono" href={`#${experimentHref}`}>
          TrustLab
        </a>
        <nav aria-label="Site">
          {link(experimentHref, 'Experiment', inFlow)}
          {link('/method', 'Method', current === '/method')}
          {link('/credits', 'Credits', current === '/credits')}
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <p>Simulated AI advice from a fixed scenario bank. Your results stay in this browser.</p>
        <p className="footer-row">
          <button type="button" className="link-button" aria-pressed={motion === 'off'} onClick={onToggleMotion}>
            {motion === 'off' ? 'Animations off' : 'Animations on'}
          </button>
          <span className="mono">
            v{APP_VERSION} · bank {SCENARIO_BANK_VERSION}
          </span>
        </p>
      </footer>
    </>
  );
}
