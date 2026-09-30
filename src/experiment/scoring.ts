import type { Scenario, ScenarioRecord } from '../types/scenario';
import type { Decision, ReliancePattern, TrialPlan } from '../types/session';
import { HIGH_CONFIDENCE, MODERATE_CONFIDENCE, presentScenario } from './assignment';

export type Ratio = {
  count: number;
  total: number;
  /** null when total is 0, so the UI can say "not applicable" instead of showing 0% or NaN. */
  rate: number | null;
};

export type TrialResult = {
  trial: number;
  scenario: Scenario;
  decision: Decision;
  accepted: boolean;
  correct: boolean;
  investigated: boolean;
  pattern: ReliancePattern;
};

export type Summary = {
  trials: number;
  accuracy: Ratio;
  appropriateReliance: Ratio & {
    acceptedCorrectAdvice: number;
    rejectedIncorrectAdvice: number;
    rejectedIncorrectButChoseOther: number;
  };
  overreliance: Ratio;
  underreliance: Ratio & { viaInvestigation: number };
  investigation: Ratio & { documentedCorrect: number };
  acceptance: {
    highConfidence: Ratio;
    moderateConfidence: Ratio;
    rationale: Ratio;
    noRationale: Ratio;
    aiCorrect: Ratio;
    aiIncorrect: Ratio;
  };
  /** Percentage-point difference in acceptance, high minus moderate confidence. */
  confidenceSusceptibility: number | null;
  /** Percentage-point difference in acceptance, rationale shown minus withheld. */
  explanationEffect: number | null;
  /** Percentage-point difference in acceptance, correct advice minus incorrect advice. */
  discrimination: number | null;
  decisionTime: { medianMs: number | null };
};

export function ratio(count: number, total: number): Ratio {
  return { count, total, rate: total === 0 ? null : count / total };
}

export function classify(aiIsCorrect: boolean, accepted: boolean, correct: boolean): ReliancePattern {
  if (aiIsCorrect) return accepted ? 'appropriate-accept' : 'underreliance';
  if (accepted) return 'overreliance';
  return correct ? 'correct-override' : 'override-other';
}

export function isAppropriate(pattern: ReliancePattern): boolean {
  return pattern === 'appropriate-accept' || pattern === 'correct-override' || pattern === 'override-other';
}

export function evaluateDecision(scenario: Scenario, chosenActionId: string) {
  const accepted = chosenActionId === scenario.aiRecommendationActionId;
  const correct = chosenActionId === scenario.correctActionId;
  const investigated = scenario.actions.some((a) => a.id === chosenActionId && a.investigative);
  return { accepted, correct, investigated, pattern: classify(scenario.aiIsCorrect, accepted, correct) };
}

/** Join the plan, the recorded decisions and the bank into per-trial results. Unanswered trials are skipped. */
export function buildTrialResults(
  plan: readonly TrialPlan[],
  decisions: readonly Decision[],
  bank: readonly ScenarioRecord[],
): TrialResult[] {
  const byId = new Map(bank.map((s) => [s.id, s]));
  const results: TrialResult[] = [];
  for (const p of plan) {
    const decision = decisions.find((d) => d.trial === p.trial);
    const record = byId.get(p.scenarioId);
    if (!decision || !record) continue;
    const scenario = presentScenario(record, p);
    results.push({ trial: p.trial, scenario, decision, ...evaluateDecision(scenario, decision.chosenActionId) });
  }
  return results;
}

function difference(a: Ratio, b: Ratio): number | null {
  if (a.rate === null || b.rate === null) return null;
  return Math.round((a.rate - b.rate) * 100);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function acceptanceWhere(results: TrialResult[], keep: (r: TrialResult) => boolean): Ratio {
  const subset = results.filter(keep);
  return ratio(subset.filter((r) => r.accepted).length, subset.length);
}

export function summarise(results: readonly TrialResult[]): Summary {
  const all = [...results];
  const count = (keep: (r: TrialResult) => boolean) => all.filter(keep).length;
  const correctAdvice = count((r) => r.scenario.aiIsCorrect);
  const incorrectAdvice = all.length - correctAdvice;

  const acceptance = {
    highConfidence: acceptanceWhere(all, (r) => r.scenario.confidence === HIGH_CONFIDENCE),
    moderateConfidence: acceptanceWhere(all, (r) => r.scenario.confidence === MODERATE_CONFIDENCE),
    rationale: acceptanceWhere(all, (r) => r.scenario.explanationMode === 'rationale'),
    noRationale: acceptanceWhere(all, (r) => r.scenario.explanationMode === 'none'),
    aiCorrect: acceptanceWhere(all, (r) => r.scenario.aiIsCorrect),
    aiIncorrect: acceptanceWhere(all, (r) => !r.scenario.aiIsCorrect),
  };

  const times = all.map((r) => r.decision.evidenceMs + r.decision.decisionMs);

  return {
    trials: all.length,
    accuracy: ratio(count((r) => r.correct), all.length),
    appropriateReliance: {
      ...ratio(count((r) => isAppropriate(r.pattern)), all.length),
      acceptedCorrectAdvice: count((r) => r.pattern === 'appropriate-accept'),
      rejectedIncorrectAdvice: count((r) => r.pattern === 'correct-override' || r.pattern === 'override-other'),
      rejectedIncorrectButChoseOther: count((r) => r.pattern === 'override-other'),
    },
    overreliance: ratio(count((r) => r.pattern === 'overreliance'), incorrectAdvice),
    underreliance: {
      ...ratio(count((r) => r.pattern === 'underreliance'), correctAdvice),
      viaInvestigation: count((r) => r.pattern === 'underreliance' && r.investigated),
    },
    investigation: {
      ...ratio(count((r) => r.investigated), all.length),
      documentedCorrect: count((r) => r.investigated && r.correct),
    },
    acceptance,
    confidenceSusceptibility: difference(acceptance.highConfidence, acceptance.moderateConfidence),
    explanationEffect: difference(acceptance.rationale, acceptance.noRationale),
    discrimination: difference(acceptance.aiCorrect, acceptance.aiIncorrect),
    decisionTime: { medianMs: median(times) },
  };
}

export function formatRate(r: Ratio): string {
  return r.rate === null ? 'n/a' : `${Math.round(r.rate * 100)}%`;
}

export function formatPoints(points: number | null): string {
  if (points === null) return 'n/a';
  if (points === 0) return '0 pts';
  return `${points > 0 ? '+' : '−'}${Math.abs(points)} pts`;
}

export function formatSeconds(ms: number | null): string {
  return ms === null ? 'n/a' : `${(ms / 1000).toFixed(1)} s`;
}

export type ResultBand = 'strong' | 'middle' | 'low';

/** Bands for the playful results title. Thresholds are documented in docs/methodology.md. */
export function resultBand(summary: Summary): ResultBand {
  const n = summary.appropriateReliance.count;
  const total = summary.appropriateReliance.total;
  if (total === 0) return 'middle';
  if (n >= Math.ceil(total * (10 / 12))) return 'strong';
  if (n >= Math.ceil(total * (7 / 12))) return 'middle';
  return 'low';
}
