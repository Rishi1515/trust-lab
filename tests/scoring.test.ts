import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../src/data/scenarios';
import { assignRun, presentScenario } from '../src/experiment/assignment';
import { buildTrialResults, classify, formatPoints, formatRate, resultBand, summarise } from '../src/experiment/scoring';
import { decision, fixtureScenario, planRow } from './fixtures';

const bank = ['F1', 'F2', 'F3', 'F4'].map(fixtureScenario);

describe('classification', () => {
  it('maps every combination to one reliance pattern', () => {
    expect(classify(true, true, true)).toBe('appropriate-accept');
    expect(classify(true, false, false)).toBe('underreliance');
    expect(classify(false, true, false)).toBe('overreliance');
    expect(classify(false, false, true)).toBe('correct-override');
    expect(classify(false, false, false)).toBe('override-other');
  });
});

describe('scoring fixtures', () => {
  // 1: correct advice, high, rationale, accepted        -> appropriate accept, correct
  // 2: correct advice, moderate, none, investigated     -> underreliance via investigation
  // 3: incorrect advice, high, rationale, accepted      -> overreliance
  // 4: incorrect advice, moderate, none, investigated   -> rejected bad advice, chose another wrong action
  const plan = [
    planRow(1, 'F1', true, 0.95, true),
    planRow(2, 'F2', true, 0.65, false),
    planRow(3, 'F3', false, 0.95, true),
    planRow(4, 'F4', false, 0.65, false),
  ];
  const decisions = [decision(1, 'F1', 'right', 2000), decision(2, 'F2', 'look', 4000), decision(3, 'F3', 'wrong', 6000), decision(4, 'F4', 'look', 8000)];
  const results = buildTrialResults(plan, decisions, bank);
  const s = summarise(results);

  it('produces known accuracy and reliance counts', () => {
    expect(results.map((r) => r.pattern)).toEqual(['appropriate-accept', 'underreliance', 'overreliance', 'override-other']);
    expect(s.accuracy).toEqual({ count: 1, total: 4, rate: 0.25 });
    expect(s.appropriateReliance.count).toBe(2);
    expect(s.appropriateReliance.acceptedCorrectAdvice).toBe(1);
    expect(s.appropriateReliance.rejectedIncorrectAdvice).toBe(1);
    expect(s.appropriateReliance.rejectedIncorrectButChoseOther).toBe(1);
    expect(s.overreliance).toEqual({ count: 1, total: 2, rate: 0.5 });
    expect(s.underreliance.count).toBe(1);
    expect(s.underreliance.total).toBe(2);
    expect(s.underreliance.viaInvestigation).toBe(1);
    expect(s.investigation.count).toBe(2);
    expect(s.investigation.documentedCorrect).toBe(0);
  });

  it('produces known condition comparisons', () => {
    expect(s.acceptance.highConfidence).toEqual({ count: 2, total: 2, rate: 1 });
    expect(s.acceptance.moderateConfidence).toEqual({ count: 0, total: 2, rate: 0 });
    expect(s.confidenceSusceptibility).toBe(100);
    expect(s.explanationEffect).toBe(100);
    expect(s.discrimination).toBe(0);
    expect(s.decisionTime.medianMs).toBe(5000);
    expect(s.decisionTime.totalMs).toBe(20000);
  });

  it('skips unanswered trials rather than scoring them', () => {
    expect(buildTrialResults(plan, decisions.slice(0, 2), bank)).toHaveLength(2);
  });
});

describe('strategy fixtures on the real bank', () => {
  const plan = assignRun('fixture-strategies', SCENARIOS);
  const byId = new Map(SCENARIOS.map((s) => [s.id, s]));

  it('always accepting the AI gives 6/12 accuracy and 6/6 overreliance', () => {
    const decisions = plan.map((p) => decision(p.trial, p.scenarioId, presentScenario(byId.get(p.scenarioId)!, p).aiRecommendationActionId));
    const s = summarise(buildTrialResults(plan, decisions, SCENARIOS));
    expect(s.accuracy.count).toBe(6);
    expect(s.appropriateReliance.count).toBe(6);
    expect(s.overreliance).toEqual({ count: 6, total: 6, rate: 1 });
    expect(s.underreliance.count).toBe(0);
    expect(s.confidenceSusceptibility).toBe(0);
    expect(s.explanationEffect).toBe(0);
    expect(s.discrimination).toBe(0);
  });

  it('always choosing the documented action gives 12/12 and full discrimination', () => {
    const decisions = plan.map((p) => decision(p.trial, p.scenarioId, byId.get(p.scenarioId)!.correctActionId));
    const s = summarise(buildTrialResults(plan, decisions, SCENARIOS));
    expect(s.accuracy.count).toBe(12);
    expect(s.appropriateReliance.count).toBe(12);
    expect(s.overreliance.count).toBe(0);
    expect(s.underreliance.count).toBe(0);
    expect(s.discrimination).toBe(100);
    expect(s.confidenceSusceptibility).toBe(0);
    expect(s.investigation.count).toBe(s.investigation.documentedCorrect);
    expect(resultBand(s)).toBe('strong');
  });
});

describe('zero counts', () => {
  it('returns null rates and differences instead of dividing by zero', () => {
    const s = summarise([]);
    expect(s.accuracy.rate).toBeNull();
    expect(s.overreliance.rate).toBeNull();
    expect(s.confidenceSusceptibility).toBeNull();
    expect(s.explanationEffect).toBeNull();
    expect(s.decisionTime.medianMs).toBeNull();
    expect(formatRate(s.accuracy)).toBe('n/a');
    expect(formatPoints(s.confidenceSusceptibility)).toBe('n/a');
  });

  it('handles a run with no incorrect advice', () => {
    const plan = [planRow(1, 'F1', true, 0.95, true)];
    const s = summarise(buildTrialResults(plan, [decision(1, 'F1', 'right')], bank));
    expect(s.overreliance).toEqual({ count: 0, total: 0, rate: null });
    expect(s.acceptance.moderateConfidence.rate).toBeNull();
    expect(s.confidenceSusceptibility).toBeNull();
  });
});
