import { describe, expect, it } from 'vitest';
import { SCENARIOS, WARMUP } from '../src/data/scenarios';
import { validateBank, validateScenario } from '../src/experiment/validate';
import { presentScenario } from '../src/experiment/assignment';

const all = [WARMUP, ...SCENARIOS];

describe('scenario bank integrity', () => {
  it('passes the startup validator', () => {
    expect(validateBank(SCENARIOS, WARMUP)).toEqual([]);
  });

  it.each(all.map((s) => [s.id, s] as const))('%s has exactly three unique actions and one valid correct action', (_id, s) => {
    const ids = s.actions.map((a) => a.id);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    expect(ids.filter((id) => id === s.correctActionId)).toHaveLength(1);
  });

  it.each(all.map((s) => [s.id, s] as const))('%s: AI correctness always equals "recommended action is the correct action"', (_id, s) => {
    for (const aiIsCorrect of [true, false]) {
      const p = presentScenario(s, { aiIsCorrect, confidence: 0.95, explanationMode: 'rationale' });
      expect(p.aiIsCorrect).toBe(p.aiRecommendationActionId === p.correctActionId);
      expect(p.aiIsCorrect).toBe(aiIsCorrect);
    }
  });

  it('keeps facts identical across presentation variants', () => {
    for (const s of SCENARIOS) {
      const a = presentScenario(s, { aiIsCorrect: true, confidence: 0.95, explanationMode: 'rationale' });
      const b = presentScenario(s, { aiIsCorrect: false, confidence: 0.65, explanationMode: 'none' });
      expect(b.facts).toEqual(a.facts);
      expect(b.actions).toEqual(a.actions);
      expect(b.correctActionId).toBe(a.correctActionId);
    }
  });

  it('withholds the explanation text when the condition is "none"', () => {
    const p = presentScenario(SCENARIOS[0], { aiIsCorrect: false, confidence: 0.65, explanationMode: 'none' });
    expect(p.aiExplanation).toBeUndefined();
  });

  it('has 12 scored scenarios across six domains, two per domain', () => {
    expect(SCENARIOS).toHaveLength(12);
    const counts = new Map<string, number>();
    for (const s of SCENARIOS) counts.set(s.domain, (counts.get(s.domain) ?? 0) + 1);
    expect([...counts.values()]).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it('includes scenarios where investigating is correct and where it is not', () => {
    const investigativeCorrect = SCENARIOS.filter((s) => s.actions.find((a) => a.id === s.correctActionId)?.investigative);
    expect(investigativeCorrect.length).toBeGreaterThan(0);
    expect(investigativeCorrect.length).toBeLessThan(SCENARIOS.length / 2);
  });

  it('reports problems for a broken record', () => {
    const broken = { ...SCENARIOS[0], correctActionId: 'nope', actions: SCENARIOS[0].actions.slice(0, 2) };
    expect(validateScenario(broken).length).toBeGreaterThanOrEqual(2);
  });
});
