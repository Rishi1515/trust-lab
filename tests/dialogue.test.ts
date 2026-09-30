import { describe, expect, it } from 'vitest';
import { CAL_LINES, chooseReaction, feedbackTrigger, resultsTrigger, selectCalLine, type CalTrigger } from '../src/content/calDialogue';
import type { Summary } from '../src/experiment/scoring';
import { decision } from './fixtures';

const TRIGGERS: CalTrigger[] = [
  'intro', 'briefing', 'briefing-returning', 'warmup', 'warmup-wrong', 'appropriate-accept', 'correct-override', 'override-other',
  'overreliance', 'overreliance-rationale', 'underreliance', 'underreliance-investigate', 'midpoint', 'results-perfect',
  'results-strong', 'results-middle', 'results-middle-trusting', 'results-middle-doubting', 'results-low', 'results-low-doubting',
];

describe('Cal dialogue content', () => {
  it('has at least one line for every trigger, and at least two for every post-decision trigger', () => {
    for (const t of TRIGGERS) expect(CAL_LINES.filter((l) => l.trigger === t).length).toBeGreaterThan(0);
    for (const t of ['appropriate-accept', 'correct-override', 'override-other', 'overreliance', 'underreliance'] as const) {
      expect(CAL_LINES.filter((l) => l.trigger === t).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps lines concise and ids unique', () => {
    expect(new Set(CAL_LINES.map((l) => l.id)).size).toBe(CAL_LINES.length);
    for (const l of CAL_LINES) expect(l.text.length).toBeLessThanOrEqual(110);
  });

  it('never uses em dashes or meme-style emphasis', () => {
    for (const l of CAL_LINES) {
      expect(l.text).not.toMatch(/—|!!|lol|\bbro\b/i);
    }
  });
});

describe('Cal line selection', () => {
  it('is deterministic for the same seed and history', () => {
    expect(selectCalLine('overreliance', ['a'], 's1')).toEqual(selectCalLine('overreliance', ['a'], 's1'));
  });

  it('prefers the highest-priority line first', () => {
    expect(selectCalLine('correct-override', [], 'x').id).toBe('override-1');
  });

  it('does not repeat a line while it is cooling down', () => {
    const history: string[] = [];
    for (let i = 0; i < 4; i++) history.push(selectCalLine('appropriate-accept', history, 'seed').id);
    expect(new Set(history).size).toBe(4);
  });

  it('falls back to the general trigger when the specific pool is exhausted', () => {
    const history: string[] = [];
    for (let i = 0; i < 4; i++) history.push(selectCalLine('overreliance-rationale', history, 'seed').id);
    expect(history[3].startsWith('over-')).toBe(true);
    expect(new Set(history).size).toBe(4);
  });

  it('maps feedback patterns to triggers', () => {
    expect(feedbackTrigger('overreliance', true, false)).toBe('overreliance-rationale');
    expect(feedbackTrigger('overreliance', false, false)).toBe('overreliance');
    expect(feedbackTrigger('underreliance', false, true)).toBe('underreliance-investigate');
    expect(feedbackTrigger('correct-override', true, false)).toBe('correct-override');
  });
});

describe('sprite reactions', () => {
  const strike = { ...decision(1, 'A', 'x'), reaction: 'attack' as const };
  const collapse = { ...decision(1, 'A', 'x'), reaction: 'die' as const };

  it('plays the audit strike only on correct overrides of high-confidence advice, at most twice', () => {
    expect(chooseReaction('correct-override', 0.95, [])).toBe('attack');
    expect(chooseReaction('correct-override', 0.65, [])).toBe('idle');
    expect(chooseReaction('correct-override', 0.95, [strike, strike])).toBe('idle');
  });

  it('plays the collapse only on accepting high-confidence wrong advice, at most once', () => {
    expect(chooseReaction('overreliance', 0.95, [])).toBe('die');
    expect(chooseReaction('overreliance', 0.95, [collapse])).toBe('idle');
    expect(chooseReaction('appropriate-accept', 0.95, [])).toBe('idle');
  });
});

describe('results lines', () => {
  const summary = (appropriate: number, over: number, under: number) =>
    ({ trials: 12, appropriateReliance: { count: appropriate }, overreliance: { count: over }, underreliance: { count: under } }) as unknown as Summary;

  it('picks the results line from the score and which way the mistakes leaned', () => {
    expect(resultsTrigger(summary(12, 0, 0), 'strong')).toBe('results-perfect');
    expect(resultsTrigger(summary(10, 1, 1), 'strong')).toBe('results-strong');
    expect(resultsTrigger(summary(8, 3, 1), 'middle')).toBe('results-middle-trusting');
    expect(resultsTrigger(summary(8, 1, 3), 'middle')).toBe('results-middle-doubting');
    expect(resultsTrigger(summary(8, 2, 2), 'middle')).toBe('results-middle');
    expect(resultsTrigger(summary(5, 1, 6), 'low')).toBe('results-low-doubting');
    expect(resultsTrigger(summary(5, 6, 1), 'low')).toBe('results-low');
  });
});
