import { act, render, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { createSession, STORAGE_KEY } from '../src/app/session';
import { ResultsView } from '../src/components/ResultsView';

/** Press Tab until the element has focus, proving it is reachable by keyboard. */
async function tabTo(user: UserEvent, element: HTMLElement, max = 60) {
  for (let i = 0; i < max && document.activeElement !== element; i++) await user.tab();
  expect(document.activeElement).toBe(element);
}

async function pressButton(user: UserEvent, name: RegExp) {
  await tabTo(user, screen.getByRole('button', { name }));
  await user.keyboard('{Enter}');
}

/** Reveal advice, pick an option with Space, submit with Enter. Keyboard only. */
async function decide(user: UserEvent, optionIndex = 0) {
  expect(document.querySelector('.bubble')).toBeNull(); // Cal says nothing before the decision
  await pressButton(user, /show the ai's advice/i);
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: /ai advice/i }));
  const radios = screen.getAllByRole('radio');
  expect(radios).toHaveLength(3);
  await tabTo(user, radios[0]);
  if (optionIndex > 0) for (let i = 0; i < optionIndex; i++) await user.keyboard('{ArrowDown}');
  else await user.keyboard(' ');
  expect(radios.some((r) => (r as HTMLInputElement).checked)).toBe(true);
  await pressButton(user, /lock in my decision/i);
}

describe('keyboard-only decision flow', () => {
  it('runs from the opening screen through the practice round, with focus moving to feedback', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'TrustLab' })).toBeInTheDocument();
    expect(screen.getByText(/the ai is pretend/i)).toBeInTheDocument();

    await pressButton(user, /^start$/i);
    expect(window.location.hash).toBe('#/briefing');
    await pressButton(user, /start the practice round/i);
    expect(window.location.hash).toBe('#/scenario/warmup');

    await decide(user);
    const feedbackTitle = screen.getByRole('heading', { level: 1 });
    expect(document.activeElement).toBe(feedbackTitle);
    expect(window.location.hash).toBe('#/feedback/warmup');
    expect(screen.getByText(/practice round\. it doesn't count/i)).toBeInTheDocument();
    expect(document.querySelector('.bubble')).not.toBeNull();
  });

  it('completes all 12 scored scenarios, the midpoint and the results by keyboard', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pressButton(user, /^start$/i);
    await pressButton(user, /start the practice round/i);
    await decide(user);
    await pressButton(user, /start the real game/i);

    for (let trial = 1; trial <= 12; trial++) {
      expect(screen.getByText(`Decision ${trial} of 12`)).toBeInTheDocument();
      await decide(user, trial % 3);
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
      if (trial === 6) {
        await pressButton(user, /^continue$/i);
        expect(screen.getByRole('heading', { level: 1, name: /6 of 12 done/i })).toBeInTheDocument();
        expect(screen.queryByText(/trusted bad advice/i)).toBeNull(); // no scores at the midpoint
        await pressButton(user, /keep going/i);
      } else if (trial < 12) {
        await pressButton(user, /next decision/i);
      } else {
        await pressButton(user, /see my score/i);
      }
    }

    expect(window.location.hash).toBe('#/results');
    expect(screen.getByRole('heading', { level: 1, name: /calibrated|needs recalibration/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /trust score: \d+ out of 12/i })).toBeInTheDocument();
    const counts = screen.getByRole('table', { name: /your numbers/i });
    expect(within(counts).getByText('Trusted bad advice')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN|undefined|Infinity/);
    expect(screen.getByText('Character art and sprites by P. Tejas Varma.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download csv/i })).toBeInTheDocument();
  });
});

describe('integrity guards', () => {
  it('restores the session after a refresh and corrects a hand-edited address', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await pressButton(user, /^start$/i);
    await pressButton(user, /start the practice round/i);
    unmount();

    window.location.hash = '#/results';
    render(<App />);
    expect(window.location.hash).toBe('#/scenario/warmup');
    expect(screen.getByRole('heading', { name: 'Stationery reimbursement' })).toBeInTheDocument();
  });

  it('replays the seed given in the address', () => {
    window.location.hash = '#/?seed=replay42';
    render(<App />);
    expect(screen.getByText(/game code replay42/)).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).seed).toBe('replay42');
  });

  it('keeps the method and credits pages reachable mid-run, with the exact credit line', async () => {
    render(<App />);
    await act(async () => {
      window.location.hash = '#/credits';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(
      screen.getByText('Designed and developed by Vegesna Rishi Varma. Original character artwork and sprite animations contributed by P. Tejas Varma.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /cal, trustlab's skeletal risk officer/i })).toBeInTheDocument();
    const cited = screen.getByRole('heading', { name: 'Works Cited' }).nextElementSibling!;
    expect(within(cited as HTMLElement).getAllByRole('listitem').length).toBeGreaterThanOrEqual(9);
    expect(within(cited as HTMLElement).getAllByRole('link').every((a) => a.getAttribute('href')!.startsWith('https://'))).toBe(true);
    expect(screen.getByRole('link', { name: 'nubzoro.itch.io' })).toHaveAttribute('href', 'https://nubzoro.itch.io/');
  });
});

describe('results with zero counts', () => {
  it('renders without division errors or misleading percentages', () => {
    const session = { ...createSession('empty'), step: { kind: 'results' as const } };
    render(<ResultsView session={session} onReplay={() => {}} onNewRun={() => {}} />);
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/NaN|Infinity|undefined/);
    expect(text).toContain('n/a');
    expect(text).not.toMatch(/\b0%/);
  });
});

describe('navigation guards', () => {
  it('cannot reopen a submitted decision by editing the address', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pressButton(user, /^start$/i);
    await pressButton(user, /start the practice round/i);
    await decide(user);
    expect(window.location.hash).toBe('#/feedback/warmup');
    await act(async () => {
      window.location.hash = '#/scenario/warmup';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(window.location.hash).toBe('#/feedback/warmup');
    expect(screen.queryByRole('button', { name: /lock in my decision/i })).toBeNull();
  });

  it('discards a stored session whose step does not match its decisions', () => {
    const broken = { ...createSession('broken1'), step: { kind: 'feedback', trial: 4 } };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(broken));
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'TrustLab' })).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).seed).not.toBe('broken1');
  });

  it('skip link moves focus to the page title without changing the page', async () => {
    const user = userEvent.setup();
    render(<App />);
    await act(async () => {
      window.location.hash = '#/credits';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await user.click(screen.getByRole('link', { name: /skip to content/i }));
    expect(window.location.hash).toBe('#/credits');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'Credits' }));
  });
});

describe('why page', () => {
  it('explains the motivation with citations that point to the Works Cited list', async () => {
    render(<App />);
    await act(async () => {
      window.location.hash = '#/why';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(screen.getByRole('heading', { level: 1, name: 'Why TrustLab exists' })).toBeInTheDocument();
    expect(document.querySelector('.bubble')).not.toBeNull();
    const cites = [...document.querySelectorAll('a.cite')];
    expect(cites.length).toBeGreaterThanOrEqual(4);
    expect(cites.every((a) => a.getAttribute('href') === '#/credits')).toBe(true);
  });
});
