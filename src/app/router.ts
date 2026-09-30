import { useEffect, useState } from 'react';

/**
 * Minimal hash routing. GitHub Pages serves one index.html, so "#/scenario/3" survives a
 * refresh without any server-side redirect. The query part (#/?seed=abc) is kept separate.
 */
export function readHash(): { path: string; query: URLSearchParams } {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return { path: path.startsWith('/') ? path : `/${path}`, query: new URLSearchParams(search) };
}

export function useHashPath(): string {
  const [path, setPath] = useState(() => readHash().path);
  useEffect(() => {
    const onChange = () => setPath(readHash().path);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export function navigate(path: string): void {
  if (readHash().path !== path) window.location.hash = path;
}

/** Correct the address bar without adding a history entry, then tell listeners. */
export function replacePath(path: string): void {
  if (readHash().path === path) return;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${path}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export const INFO_PATHS = ['/method', '/credits'] as const;
export function isInfoPath(path: string): boolean {
  return (INFO_PATHS as readonly string[]).includes(path);
}
