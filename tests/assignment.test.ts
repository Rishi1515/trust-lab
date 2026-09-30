import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../src/data/scenarios';
import { assignRun, HIGH_CONFIDENCE, MIDPOINT_AFTER, MODERATE_CONFIDENCE, presentScenario } from '../src/experiment/assignment';
import { createRng, shuffle } from '../src/experiment/rng';
import type { TrialPlan } from '../src/types/session';

const SEEDS = Array.from({ length: 400 }, (_, i) => `seed-${i}`);
const count = (plan: TrialPlan[], keep: (p: TrialPlan) => boolean) => plan.filter(keep).length;
const domainOf = new Map(SCENARIOS.map((s) => [s.id, s.domain]));
const difficultyOf = new Map(SCENARIOS.map((s) => [s.id, s.difficulty]));

describe('seeded RNG', () => {
  it('is deterministic for a seed and differs across seeds', () => {
    const a = createRng('abc');
    const b = createRng('abc');
    const c = createRng('abd');
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
  });

  it('shuffle returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, createRng('x'));
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual(input);
  });
});

describe('balanced condition assignment', () => {
  it('produces the same order and conditions for the same seed', () => {
    expect(assignRun('replay-me', SCENARIOS)).toEqual(assignRun('replay-me', SCENARIOS));
  });

  it('produces different runs for different seeds', () => {
    const orders = new Set(SEEDS.slice(0, 50).map((s) => assignRun(s, SCENARIOS).map((p) => p.scenarioId).join()));
    expect(orders.size).toBeGreaterThan(45);
  });

  it.each(SEEDS)('seed %s satisfies every balance and ordering constraint', (seed) => {
    const plan = assignRun(seed, SCENARIOS);
    expect(plan).toHaveLength(12);
    expect(new Set(plan.map((p) => p.scenarioId)).size).toBe(12);
    expect(plan.map((p) => p.trial)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    // Correctness 6/6, and within each correctness group confidence 3/3 and explanation 3/3.
    for (const aiIsCorrect of [true, false]) {
      const group = plan.filter((p) => p.aiIsCorrect === aiIsCorrect);
      expect(group).toHaveLength(6);
      expect(count(group, (p) => p.confidence === HIGH_CONFIDENCE)).toBe(3);
      expect(count(group, (p) => p.confidence === MODERATE_CONFIDENCE)).toBe(3);
      expect(count(group, (p) => p.explanationMode === 'rationale')).toBe(3);
    }
    // Every confidence x explanation cell appears exactly 3 times across the run.
    for (const confidence of [HIGH_CONFIDENCE, MODERATE_CONFIDENCE]) {
      for (const mode of ['rationale', 'none'] as const) {
        expect(count(plan, (p) => p.confidence === confidence && p.explanationMode === mode)).toBe(3);
      }
    }
    // Each domain has one correct-advice and one incorrect-advice scenario.
    for (const domain of new Set(domainOf.values())) {
      const inDomain = plan.filter((p) => domainOf.get(p.scenarioId) === domain);
      expect(inDomain.map((p) => p.aiIsCorrect).sort()).toEqual([false, true]);
    }
    // Difficulty totals of the two groups differ by at most 1.
    const diff = (flag: boolean) => plan.filter((p) => p.aiIsCorrect === flag).reduce((t, p) => t + difficultyOf.get(p.scenarioId)!, 0);
    expect(Math.abs(diff(true) - diff(false))).toBeLessThanOrEqual(1);
    // Ordering: each half has 3 correct-advice trials, no adjacent domains, no run longer than 3.
    expect(count(plan.slice(0, MIDPOINT_AFTER), (p) => p.aiIsCorrect)).toBe(3);
    for (let i = 1; i < plan.length; i++) {
      expect(domainOf.get(plan[i].scenarioId)).not.toBe(domainOf.get(plan[i - 1].scenarioId));
    }
    let run = 1;
    for (let i = 1; i < plan.length; i++) {
      run = plan[i].aiIsCorrect === plan[i - 1].aiIsCorrect ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(3);
    }
  });

  it('agrees with the canonical records when presented', () => {
    const byId = new Map(SCENARIOS.map((s) => [s.id, s]));
    for (const p of assignRun('present', SCENARIOS)) {
      const scenario = presentScenario(byId.get(p.scenarioId)!, p);
      expect(scenario.aiIsCorrect).toBe(p.aiIsCorrect);
      expect(scenario.confidence).toBe(p.confidence);
      expect(scenario.explanationMode).toBe(p.explanationMode);
    }
  });

  it('rejects a bank of the wrong size', () => {
    expect(() => assignRun('x', SCENARIOS.slice(0, 10))).toThrow();
  });
});
