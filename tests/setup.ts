import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
  window.location.hash = '';
});

// jsdom does not implement scrolling. Current Chrome's scrollTo returns a Promise, so the
// stub does too: an effect that leaks that value as a "cleanup" would crash navigation here.
window.scrollTo = (() => Promise.resolve()) as unknown as typeof window.scrollTo;
