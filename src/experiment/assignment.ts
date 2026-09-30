import type { Confidence, Domain, ExplanationMode, Scenario, ScenarioRecord } from '../types/scenario';
import type { TrialPlan } from '../types/session';
import { createRng, randomInt, shuffle, type Rng } from './rng';

export const HIGH_CONFIDENCE: Confidence = 0.95;
export const MODERATE_CONFIDENCE: Confidence = 0.65;
/** Used only by the unscored warm-up, so it never enters a condition comparison. */
export const WARMUP_CONFIDENCE: Confidence = 0.8;

export const SCORED_TRIALS = 12;
export const MIDPOINT_AFTER = 6;
const MAX_RUN_OF_SAME_CORRECTNESS = 3;
const MAX_ORDER_ATTEMPTS = 20000;

type Cell = { confidence: Confidence; explanationMode: ExplanationMode };
const HR: Cell = { confidence: HIGH_CONFIDENCE, explanationMode: 'rationale' };
const HN: Cell = { confidence: HIGH_CONFIDENCE, explanationMode: 'none' };
const MR: Cell = { confidence: MODERATE_CONFIDENCE, explanationMode: 'rationale' };
const MN: Cell = { confidence: MODERATE_CONFIDENCE, explanationMode: 'none' };

/**
 * Six trials per correctness group cannot fill a 2x2 (confidence x explanation) grid evenly,
 * so the two groups get complementary patterns. Within each group: 3 high / 3 moderate and
 * 3 rationale / 3 none. Across the run: every confidence x explanation cell appears 3 times.
 */
const PATTERN_A: Cell[] = [HR, HR, HN, MR, MN, MN];
const PATTERN_B: Cell[] = [HR, HN, HN, MR, MR, MN];

type Split = { correct: ScenarioRecord[]; incorrect: ScenarioRecord[] };

/**
 * Each domain contributes one correct-advice and one incorrect-advice scenario, and the two
 * groups' total difficulty differs by at most 1. All splits meeting that rule are listed and
 * one is picked by the seed.
 */
function chooseSplit(bank: readonly ScenarioRecord[], rng: Rng): Split {
  const byDomain = new Map<Domain, ScenarioRecord[]>();
  for (const s of bank) byDomain.set(s.domain, [...(byDomain.get(s.domain) ?? []), s]);
  const pairs = [...byDomain.keys()].sort().map((d) => byDomain.get(d)!);

  const valid: Split[] = [];
  for (let mask = 0; mask < 1 << pairs.length; mask++) {
    const correct: ScenarioRecord[] = [];
    const incorrect: ScenarioRecord[] = [];
    pairs.forEach(([a, b], i) => {
      const flip = (mask >> i) & 1;
      correct.push(flip ? b : a);
      incorrect.push(flip ? a : b);
    });
    const diff = sumDifficulty(correct) - sumDifficulty(incorrect);
    if (Math.abs(diff) <= 1) valid.push({ correct, incorrect });
  }
  if (valid.length === 0) throw new Error('No difficulty-balanced split exists for this scenario bank.');
  return valid[randomInt(rng, valid.length)];
}

function sumDifficulty(items: ScenarioRecord[]): number {
  return items.reduce((total, s) => total + s.difficulty, 0);
}

function orderIsAcceptable(plan: Pick<TrialPlan, 'scenarioId' | 'aiIsCorrect'>[], domainOf: Map<string, Domain>): boolean {
  for (let i = 1; i < plan.length; i++) {
    if (domainOf.get(plan[i].scenarioId) === domainOf.get(plan[i - 1].scenarioId)) return false;
  }
  const firstHalfCorrect = plan.slice(0, MIDPOINT_AFTER).filter((p) => p.aiIsCorrect).length;
  if (firstHalfCorrect !== MIDPOINT_AFTER / 2) return false;
  let run = 1;
  for (let i = 1; i < plan.length; i++) {
    run = plan[i].aiIsCorrect === plan[i - 1].aiIsCorrect ? run + 1 : 1;
    if (run > MAX_RUN_OF_SAME_CORRECTNESS) return false;
  }
  return true;
}

/** Build the full, reproducible run plan for a seed. Same seed and bank give the same plan. */
export function assignRun(seed: string, bank: readonly ScenarioRecord[]): TrialPlan[] {
  if (bank.length !== SCORED_TRIALS) {
    throw new Error(`Expected ${SCORED_TRIALS} scored scenarios, received ${bank.length}.`);
  }
  const rng = createRng(`trustlab:${seed}`);
  const split = chooseSplit(bank, rng);
  const [correctPattern, incorrectPattern] = rng() < 0.5 ? [PATTERN_A, PATTERN_B] : [PATTERN_B, PATTERN_A];

  const unordered: Omit<TrialPlan, 'trial' | 'actionOrder'>[] = [
    ...shuffle(split.correct, rng).map((s, i) => ({ scenarioId: s.id, aiIsCorrect: true, ...correctPattern[i] })),
    ...shuffle(split.incorrect, rng).map((s, i) => ({ scenarioId: s.id, aiIsCorrect: false, ...incorrectPattern[i] })),
  ];

  const domainOf = new Map(bank.map((s) => [s.id, s.domain] as const));
  const actionIdsOf = new Map(bank.map((s) => [s.id, s.actions.map((a) => a.id)] as const));
  for (let attempt = 0; attempt < MAX_ORDER_ATTEMPTS; attempt++) {
    const ordered = shuffle(unordered, rng).map((p, i) => ({ ...p, trial: i + 1 }));
    if (!orderIsAcceptable(ordered, domainOf)) continue;
    // Separate stream, so action order never changes which trial order a seed produces.
    const actionRng = createRng(`trustlab:${seed}:actions`);
    return ordered.map((p) => ({ ...p, actionOrder: shuffle(actionIdsOf.get(p.scenarioId)!, actionRng) }));
  }
  throw new Error(`Could not find an acceptable trial order for seed "${seed}".`);
}

/** Resolve a canonical scenario record against its assigned conditions. */
export function presentScenario(
  record: ScenarioRecord,
  conditions: Pick<TrialPlan, 'aiIsCorrect' | 'confidence' | 'explanationMode'> & { actionOrder?: string[] },
): Scenario {
  const variant = conditions.aiIsCorrect ? record.advice.correct : record.advice.incorrect;
  const order = conditions.actionOrder;
  const actions = order && order.length === record.actions.length
    ? order.map((id) => record.actions.find((a) => a.id === id)!).filter(Boolean)
    : record.actions;
  return {
    id: record.id,
    domain: record.domain,
    title: record.title,
    brief: record.brief,
    facts: record.facts,
    actions,
    correctActionId: record.correctActionId,
    aiRecommendationActionId: variant.actionId,
    aiIsCorrect: variant.actionId === record.correctActionId,
    confidence: conditions.confidence,
    explanationMode: conditions.explanationMode,
    aiExplanation: conditions.explanationMode === 'rationale' ? variant.explanation : undefined,
    reasoningError: variant.reasoningError,
    consequence: record.consequence,
    learningNote: record.learningNote,
    difficulty: record.difficulty,
  };
}
