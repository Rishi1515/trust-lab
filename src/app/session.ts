import { feedbackTrigger, chooseReaction, selectCalLine } from '../content/calDialogue';
import { SCENARIO_BANK_VERSION, SCENARIOS, WARMUP, findScenario } from '../data/scenarios';
import { MIDPOINT_AFTER, SCORED_TRIALS, WARMUP_CONFIDENCE, assignRun, presentScenario } from '../experiment/assignment';
import { isValidSeed } from '../experiment/rng';
import { evaluateDecision } from '../experiment/scoring';
import type { Scenario } from '../types/scenario';
import type { Decision, Session, Step } from '../types/session';

export const STORAGE_KEY = 'trustlab.session.v1';

export function createSession(seed: string, step: Step = { kind: 'intro' }): Session {
  return {
    seed,
    scenarioBankVersion: SCENARIO_BANK_VERSION,
    plan: assignRun(seed, SCENARIOS),
    warmup: null,
    decisions: [],
    step,
    calHistory: [],
  };
}

export type SessionAction =
  | { type: 'open-briefing' }
  | { type: 'start-warmup' }
  | { type: 'submit'; trial: number | 'warmup'; chosenActionId: string; evidenceMs: number; decisionMs: number }
  | { type: 'continue' }
  | { type: 'restart'; seed: string };

/** The scenario exactly as the player sees it on a given trial. */
export function presentTrial(session: Session, trial: number | 'warmup'): Scenario {
  if (trial === 'warmup') {
    return presentScenario(WARMUP, { aiIsCorrect: true, confidence: WARMUP_CONFIDENCE, explanationMode: 'rationale' });
  }
  const plan = session.plan[trial - 1];
  return presentScenario(findScenario(plan.scenarioId)!, plan);
}

export function decisionFor(session: Session, trial: number | 'warmup'): Decision | undefined {
  return trial === 'warmup' ? session.warmup ?? undefined : session.decisions.find((d) => d.trial === trial);
}

function submit(state: Session, action: Extract<SessionAction, { type: 'submit' }>): Session {
  const { step } = state;
  if (step.kind !== 'scenario' || step.trial !== action.trial || decisionFor(state, action.trial)) return state;
  const scenario = presentTrial(state, action.trial);
  if (!scenario.actions.some((a) => a.id === action.chosenActionId)) return state;

  const result = evaluateDecision(scenario, action.chosenActionId);
  const trigger = action.trial === 'warmup'
    ? 'warmup'
    : feedbackTrigger(result.pattern, scenario.explanationMode === 'rationale', result.investigated);
  const line = selectCalLine(trigger, state.calHistory, state.seed);
  const decision: Decision = {
    trial: action.trial,
    scenarioId: scenario.id,
    chosenActionId: action.chosenActionId,
    evidenceMs: Math.max(0, action.evidenceMs),
    decisionMs: Math.max(0, action.decisionMs),
    calLineId: line.id,
    reaction: action.trial === 'warmup' ? 'idle' : chooseReaction(result.pattern, scenario.confidence, state.decisions),
  };
  return {
    ...state,
    warmup: action.trial === 'warmup' ? decision : state.warmup,
    decisions: action.trial === 'warmup' ? state.decisions : [...state.decisions, decision],
    calHistory: [...state.calHistory, line.id],
    step: { kind: 'feedback', trial: action.trial },
  };
}

function next(state: Session): Session {
  const { step } = state;
  if (step.kind === 'feedback') {
    if (step.trial === 'warmup') return { ...state, step: { kind: 'scenario', trial: 1 } };
    if (step.trial === SCORED_TRIALS) return { ...state, step: { kind: 'results' } };
    if (step.trial === MIDPOINT_AFTER) return { ...state, step: { kind: 'midpoint' } };
    return { ...state, step: { kind: 'scenario', trial: step.trial + 1 } };
  }
  if (step.kind === 'midpoint') return { ...state, step: { kind: 'scenario', trial: MIDPOINT_AFTER + 1 } };
  return state;
}

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'open-briefing':
      return state.step.kind === 'intro' ? { ...state, step: { kind: 'briefing' } } : state;
    case 'start-warmup':
      return state.step.kind === 'briefing' ? { ...state, step: { kind: 'scenario', trial: 'warmup' } } : state;
    case 'submit':
      return submit(state, action);
    case 'continue':
      return next(state);
    case 'restart':
      // A fresh session: nothing from the previous run carries into the next run's scores.
      return createSession(action.seed, { kind: 'briefing' });
  }
}

export function canonicalPath(step: Step): string {
  switch (step.kind) {
    case 'intro':
      return '/';
    case 'briefing':
      return '/briefing';
    case 'scenario':
      return `/scenario/${step.trial}`;
    case 'feedback':
      return `/feedback/${step.trial}`;
    case 'midpoint':
      return '/midpoint';
    case 'results':
      return '/results';
  }
}

const isTrial = (t: unknown): t is number | 'warmup' =>
  t === 'warmup' || (typeof t === 'number' && Number.isInteger(t) && t >= 1 && t <= SCORED_TRIALS);

/** The recorded decisions must be exactly the ones the current step implies. */
function isConsistent(s: Session): boolean {
  const { step } = s;
  if ((step.kind === 'scenario' || step.kind === 'feedback') && !isTrial(step.trial)) return false;
  const expected = ((): number => {
    switch (step.kind) {
      case 'intro':
      case 'briefing':
        return 0;
      case 'scenario':
        return step.trial === 'warmup' ? 0 : step.trial - 1;
      case 'feedback':
        return step.trial === 'warmup' ? 0 : step.trial;
      case 'midpoint':
        return MIDPOINT_AFTER;
      case 'results':
        return SCORED_TRIALS;
    }
  })();
  const warmupDone = !(step.kind === 'intro' || step.kind === 'briefing' || (step.kind === 'scenario' && step.trial === 'warmup'));
  if (Boolean(s.warmup) !== warmupDone) return false;
  if (s.decisions.length !== expected) return false;
  return s.decisions.every((d, i) => d.trial === i + 1 && d.scenarioId === s.plan[i].scenarioId);
}

/** Restore a session from sessionStorage, discarding anything stale or inconsistent. */
export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s || typeof s.seed !== 'string' || !isValidSeed(s.seed)) return null;
    if (s.scenarioBankVersion !== SCENARIO_BANK_VERSION) return null;
    if (JSON.stringify(s.plan) !== JSON.stringify(assignRun(s.seed, SCENARIOS))) return null;
    if (!Array.isArray(s.decisions) || !Array.isArray(s.calHistory) || !s.step?.kind) return null;
    return isConsistent(s) ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (private mode, blocked). The run still works; it just will not survive a refresh.
  }
}
