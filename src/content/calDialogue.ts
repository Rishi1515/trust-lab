import type { Confidence } from '../types/scenario';
import type { Decision, ReliancePattern, Reaction } from '../types/session';
import { createRng } from '../experiment/rng';
import type { Summary } from '../experiment/scoring';

/**
 * Cal's lines. Cal never speaks while a scored decision is open: every trigger below fires
 * on a screen before the first scenario, after a decision, at the midpoint or on the results.
 * Priority: higher is preferred; equal priorities are picked by the run's seed, so different
 * runs hear different lines. Cooldown: how many later Cal lines must pass before a line repeats.
 */
export type CalTrigger =
  | 'intro'
  | 'briefing'
  | 'briefing-returning'
  | 'warmup'
  | 'warmup-wrong'
  | ReliancePattern
  | 'overreliance-rationale'
  | 'underreliance-investigate'
  | 'midpoint'
  | 'results-perfect'
  | 'results-strong'
  | 'results-middle'
  | 'results-middle-trusting'
  | 'results-middle-doubting'
  | 'results-low'
  | 'results-low-doubting';

export type CalLine = {
  id: string;
  trigger: CalTrigger;
  text: string;
  priority: number;
  cooldown: number;
};

const REPEAT_GUARD = 6;
const line = (id: string, trigger: CalTrigger, text: string, priority = 1): CalLine => ({
  id,
  trigger,
  text,
  priority,
  cooldown: REPEAT_GUARD,
});

export const CAL_LINES: CalLine[] = [
  line('intro-1', 'intro', "I'm Cal. Short for calibration. Long story about the skeleton thing."),
  line('intro-2', 'intro', "I'm Cal. I check AI advice for a living. Well, not living. Checking, anyway."),
  line('intro-3', 'intro', "I'm Cal. I've met a lot of confident machines. Most of them were wrong with excellent posture."),

  line('brief-1', 'briefing', 'Some of this advice is wrong on purpose. That is not a bug. That is the experiment.'),
  line('brief-2', 'briefing', 'Read the facts before the machine tells you what to think. It will try.'),
  line('brief-3', 'briefing', 'The AI will sound very sure of itself. So did every bad idea I ever signed off.'),

  line('return-1', 'briefing-returning', "Back again? The machine hasn't learned anything. Let's see if you have."),
  line('return-2', 'briefing-returning', 'Round two. Same rules, new order. The AI is still very confident about everything.'),

  line('warm-1', 'warmup', 'The model was 80% confident. Confidence remains free.'),
  line('warm-2', 'warmup', 'Practice done. The next twelve count. No pressure. Some pressure.'),
  line('warmwrong-1', 'warmup-wrong', "It was practice. I've already forgotten it. I forget most things. No brain."),
  line('warmwrong-2', 'warmup-wrong', 'Practice exists for exactly this. The next twelve are the real thing.'),

  line('accept-1', 'appropriate-accept', 'Good advice, accepted. Reliance working as intended.', 2),
  line('accept-2', 'appropriate-accept', 'Right call. The model was right too, which helps.'),
  line('accept-3', 'appropriate-accept', 'Accepted, correctly. I have nothing sarcastic prepared for this.'),
  line('accept-4', 'appropriate-accept', 'You checked it, it held up, you moved on. Efficient.'),
  line('accept-5', 'appropriate-accept', 'Trusting good advice is also a skill. Nobody puts it on a certificate.'),

  line('override-1', 'correct-override', 'You questioned the machine. Disturbingly responsible.', 3),
  line('override-2', 'correct-override', 'Overruled, correctly. Somewhere a dashboard is still showing green.', 2),
  line('override-3', 'correct-override', 'The model was wrong and you noticed. Put that in the audit file.'),
  line('override-4', 'correct-override', 'Rejected, rightly. The recommendation remains very sure of itself.'),
  line('override-5', 'correct-override', 'Caught it. The machine will not be apologising. It never does.'),

  line('other-1', 'override-other', 'Right to doubt the advice. The alternative needed the same scrutiny.', 2),
  line('other-2', 'override-other', 'The advice was wrong. So was the exit taken instead.'),
  line('other-3', 'override-other', 'Half an audit. Good rejection, different miss.'),

  line('over-1', 'overreliance', 'Excellent. You automated the decision and the accountability.', 3),
  line('over-2', 'overreliance', 'The model sounded sure. The facts did not agree with it.', 2),
  line('over-3', 'overreliance', 'In fairness, the interface made agreeing the easiest button.'),
  line('over-4', 'overreliance', 'Accepted as recommended. The recommendation was the problem.'),
  line('over-5', 'overreliance', 'The machine said jump. The facts said otherwise. The machine is louder.'),

  line('overx-1', 'overreliance-rationale', 'The AI provided an explanation. It even contained nouns.', 3),
  line('overx-2', 'overreliance-rationale', 'A fluent explanation is not the same as a correct one.', 2),
  line('overx-3', 'overreliance-rationale', 'The reasoning read well. It was also wrong. Both can be true.'),

  line('under-1', 'underreliance', 'The advice was right this time. Doubt is useful. It is not free.', 2),
  line('under-2', 'underreliance', 'Correct advice, overruled. Scepticism needs evidence too.'),
  line('under-3', 'underreliance', 'Even a confident model is right sometimes. Annoying, I know.'),
  line('under-4', 'underreliance', 'Not every recommendation is a trap. This one was just correct.'),

  line('underx-1', 'underreliance-investigate', 'Checking felt safe. The facts on screen were already enough.', 2),
  line('underx-2', 'underreliance-investigate', 'Reasonable instinct. The evidence was sufficient, and delay has a cost.'),

  line('mid-1', 'midpoint', 'Halfway. No scores yet. Scores change behaviour, and behaviour is what we measure.'),
  line('mid-2', 'midpoint', "Six down. Take a breath. I'd join you, but, lungs."),
  line('mid-3', 'midpoint', 'Halfway there. The machine is still confident. Stay suspicious.'),

  line('res-perfect', 'results-perfect', "Twelve for twelve. I'd give you a standing ovation, but my knees are decorative."),
  line('res-strong-1', 'results-strong', 'Good news: your critical thinking still has a pulse. Unlike mine.'),
  line('res-strong-2', 'results-strong', 'You trusted it when it earned it and doubted it when it did not. That is the whole job.'),
  line('res-mid-1', 'results-middle', 'Mixed results. Which is also what most models ship with.'),
  line('res-midt-1', 'results-middle-trusting', 'Mostly good. The machine talked you into a couple. It does that.'),
  line('res-midd-1', 'results-middle-doubting', 'Solid, but you doubted some good advice too. Scepticism is a tool, not a personality.'),
  line('res-low-1', 'results-low', 'The advice did a lot of the deciding today. That is exactly the habit this lab exists to show.'),
  line('res-lowd-1', 'results-low-doubting', 'You doubted nearly everything, even the good advice. Healthy in a skeleton. Expensive in an office.'),
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

  const usedWithin = (l: CalLine) => history.slice(-l.cooldown).includes(l.id);
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
  const lastUse = (l: CalLine) => history.lastIndexOf(l.id);
  return [...candidates].sort((a, b) => lastUse(a) - lastUse(b))[0];
}

export function feedbackTrigger(pattern: ReliancePattern, rationaleShown: boolean, investigated: boolean): CalTrigger {
  if (pattern === 'overreliance' && rationaleShown) return 'overreliance-rationale';
  if (pattern === 'underreliance' && investigated) return 'underreliance-investigate';
  return pattern;
}

/** Which way the player's mistakes leaned: trusting bad advice, or doubting good advice. */
export function mistakeLean(summary: Summary): 'trusting' | 'doubting' | 'even' {
  const over = summary.overreliance.count;
  const under = summary.underreliance.count;
  if (over > under) return 'trusting';
  if (under > over) return 'doubting';
  return 'even';
}

export function resultsTrigger(summary: Summary, band: 'strong' | 'middle' | 'low'): CalTrigger {
  const lean = mistakeLean(summary);
  if (summary.trials > 0 && summary.appropriateReliance.count === summary.trials) return 'results-perfect';
  if (band === 'strong') return 'results-strong';
  if (band === 'middle') return lean === 'trusting' ? 'results-middle-trusting' : lean === 'doubting' ? 'results-middle-doubting' : 'results-middle';
  return lean === 'doubting' ? 'results-low-doubting' : 'results-low';
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
