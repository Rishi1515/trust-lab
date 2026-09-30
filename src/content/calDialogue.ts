import type { Confidence } from '../types/scenario';
import type { Decision, ReliancePattern, Reaction } from '../types/session';
import { createRng } from '../experiment/rng';

/**
 * Cal's lines. Cal never speaks while a scored decision is open: every trigger below fires
 * on a screen before the first scenario, after a decision, at the midpoint or on the results.
 * Priority: higher is preferred. Cooldown: how many later Cal lines must pass before this
 * line may be used again.
 */
export type CalTrigger =
  | 'intro'
  | 'briefing'
  | 'warmup'
  | ReliancePattern
  | 'overreliance-rationale'
  | 'underreliance-investigate'
  | 'midpoint'
  | 'results-strong'
  | 'results-middle'
  | 'results-low';

export type CalLine = {
  id: string;
  trigger: CalTrigger;
  text: string;
  priority: number;
  cooldown: number;
};

const REPEAT_GUARD = 6;

export const CAL_LINES: CalLine[] = [
  { id: 'intro-1', trigger: 'intro', priority: 3, cooldown: REPEAT_GUARD, text: "I'm Cal. Short for calibration. Long story about the skeleton thing." },
  { id: 'brief-1', trigger: 'briefing', priority: 3, cooldown: REPEAT_GUARD, text: 'Some of this advice is wrong on purpose. That is not a bug. That is the experiment.' },
  { id: 'warm-1', trigger: 'warmup', priority: 3, cooldown: REPEAT_GUARD, text: 'The model was 80% confident. Confidence remains free.' },

  { id: 'accept-1', trigger: 'appropriate-accept', priority: 2, cooldown: REPEAT_GUARD, text: 'Good advice, accepted. Reliance working as intended.' },
  { id: 'accept-2', trigger: 'appropriate-accept', priority: 1, cooldown: REPEAT_GUARD, text: 'Right call. The model was right too, which helps.' },
  { id: 'accept-3', trigger: 'appropriate-accept', priority: 1, cooldown: REPEAT_GUARD, text: 'Accepted, correctly. I have nothing sarcastic prepared for this.' },
  { id: 'accept-4', trigger: 'appropriate-accept', priority: 1, cooldown: REPEAT_GUARD, text: 'You checked it, it held up, you moved on. Efficient.' },

  { id: 'override-1', trigger: 'correct-override', priority: 3, cooldown: REPEAT_GUARD, text: 'You questioned the machine. Disturbingly responsible.' },
  { id: 'override-2', trigger: 'correct-override', priority: 2, cooldown: REPEAT_GUARD, text: 'Overruled, correctly. Somewhere a dashboard is still showing green.' },
  { id: 'override-3', trigger: 'correct-override', priority: 1, cooldown: REPEAT_GUARD, text: 'The model was wrong and you noticed. Put that in the audit file.' },
  { id: 'override-4', trigger: 'correct-override', priority: 1, cooldown: REPEAT_GUARD, text: 'Rejected, rightly. The recommendation remains very sure of itself.' },

  { id: 'other-1', trigger: 'override-other', priority: 2, cooldown: REPEAT_GUARD, text: 'Right to doubt the advice. The alternative needed the same scrutiny.' },
  { id: 'other-2', trigger: 'override-other', priority: 1, cooldown: REPEAT_GUARD, text: 'The advice was wrong. So was the exit taken instead.' },
  { id: 'other-3', trigger: 'override-other', priority: 1, cooldown: REPEAT_GUARD, text: 'Half an audit. Good rejection, different miss.' },

  { id: 'over-1', trigger: 'overreliance', priority: 3, cooldown: REPEAT_GUARD, text: 'Excellent. You automated the decision and the accountability.' },
  { id: 'over-2', trigger: 'overreliance', priority: 2, cooldown: REPEAT_GUARD, text: 'The model sounded sure. The facts did not agree with it.' },
  { id: 'over-3', trigger: 'overreliance', priority: 1, cooldown: REPEAT_GUARD, text: 'In fairness, the interface made agreeing the easiest button.' },
  { id: 'over-4', trigger: 'overreliance', priority: 1, cooldown: REPEAT_GUARD, text: 'Accepted as recommended. The recommendation was the problem.' },

  { id: 'overx-1', trigger: 'overreliance-rationale', priority: 3, cooldown: REPEAT_GUARD, text: 'The AI provided an explanation. It even contained nouns.' },
  { id: 'overx-2', trigger: 'overreliance-rationale', priority: 2, cooldown: REPEAT_GUARD, text: 'A fluent explanation is not the same as a correct one.' },
  { id: 'overx-3', trigger: 'overreliance-rationale', priority: 1, cooldown: REPEAT_GUARD, text: 'The reasoning read well. It was also wrong. Both can be true.' },

  { id: 'under-1', trigger: 'underreliance', priority: 2, cooldown: REPEAT_GUARD, text: 'The advice was right this time. Doubt is useful. It is not free.' },
  { id: 'under-2', trigger: 'underreliance', priority: 1, cooldown: REPEAT_GUARD, text: 'Correct advice, overruled. Scepticism needs evidence too.' },
  { id: 'under-3', trigger: 'underreliance', priority: 1, cooldown: REPEAT_GUARD, text: 'Even a confident model is right sometimes. Annoying, I know.' },

  { id: 'underx-1', trigger: 'underreliance-investigate', priority: 2, cooldown: REPEAT_GUARD, text: 'Investigating felt safe. The facts on screen were already enough.' },
  { id: 'underx-2', trigger: 'underreliance-investigate', priority: 1, cooldown: REPEAT_GUARD, text: 'Reasonable instinct. The evidence was sufficient, and delay has a cost.' },

  { id: 'mid-1', trigger: 'midpoint', priority: 3, cooldown: REPEAT_GUARD, text: 'Halfway. No scores yet. Scores change behaviour, and behaviour is what we measure.' },

  { id: 'res-strong', trigger: 'results-strong', priority: 3, cooldown: REPEAT_GUARD, text: 'Good news: your critical thinking still has a pulse. Unlike mine.' },
  { id: 'res-middle', trigger: 'results-middle', priority: 3, cooldown: REPEAT_GUARD, text: 'Mixed results. Which is also what most models ship with.' },
  { id: 'res-low', trigger: 'results-low', priority: 3, cooldown: REPEAT_GUARD, text: 'The advice did a lot of the deciding today. That is the pattern this lab exists to show.' },
];

/** When a specific trigger's lines are all cooling down, fall back to the general one. */
const FALLBACK: Partial<Record<CalTrigger, CalTrigger>> = {
  'overreliance-rationale': 'overreliance',
  'underreliance-investigate': 'underreliance',
};

function tieBreak(seed: string, position: number, id: string): number {
  return createRng(`${seed}:${position}:${id}`)();
}

/**
 * Deterministic line choice: the highest-priority line for the trigger that is not cooling
 * down, ties broken by the seed. If every line is cooling down, the least recently used wins.
 */
export function selectCalLine(trigger: CalTrigger, history: readonly string[], seed: string): CalLine {
  const candidates = CAL_LINES.filter((l) => l.trigger === trigger);
  if (candidates.length === 0) throw new Error(`No Cal lines for trigger "${trigger}".`);

  const usedWithin = (line: CalLine) => history.slice(-line.cooldown).includes(line.id);
  const eligible = candidates.filter((l) => !usedWithin(l));
  if (eligible.length === 0 && FALLBACK[trigger]) {
    const fallback = selectCalLine(FALLBACK[trigger]!, history, seed);
    if (!usedWithin(fallback)) return fallback;
  }
  if (eligible.length > 0) {
    return [...eligible].sort(
      (a, b) => b.priority - a.priority || tieBreak(seed, history.length, a.id) - tieBreak(seed, history.length, b.id),
    )[0];
  }
  const lastUse = (line: CalLine) => history.lastIndexOf(line.id);
  return [...candidates].sort((a, b) => lastUse(a) - lastUse(b))[0];
}

export function feedbackTrigger(pattern: ReliancePattern, rationaleShown: boolean, investigated: boolean): CalTrigger {
  if (pattern === 'overreliance' && rationaleShown) return 'overreliance-rationale';
  if (pattern === 'underreliance' && investigated) return 'underreliance-investigate';
  return pattern;
}

export const MAX_AUDIT_STRIKES = 2;
export const MAX_COLLAPSES = 1;

/**
 * Sprite reactions stay rare. The audit strike plays only when the player overrules
 * high-confidence wrong advice and lands on the documented action (at most twice per run).
 * The collapse plays only on accepting high-confidence wrong advice (at most once per run).
 */
export function chooseReaction(pattern: ReliancePattern, confidence: Confidence, previous: readonly Decision[]): Reaction {
  const strikes = previous.filter((d) => d.reaction === 'attack').length;
  const collapses = previous.filter((d) => d.reaction === 'die').length;
  if (pattern === 'correct-override' && confidence === 0.95 && strikes < MAX_AUDIT_STRIKES) return 'attack';
  if (pattern === 'overreliance' && confidence === 0.95 && collapses < MAX_COLLAPSES) return 'die';
  return 'idle';
}
