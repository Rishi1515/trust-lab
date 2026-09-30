import type { Confidence, ExplanationMode } from './scenario';

/** The assigned presentation conditions for one scored trial. */
export type TrialPlan = {
  trial: number; // 1-based position in the run
  scenarioId: string;
  aiIsCorrect: boolean;
  confidence: Confidence;
  explanationMode: ExplanationMode;
  /** Display order of the three action ids, shuffled per trial so position cannot cue the answer. */
  actionOrder: string[];
};

export type Reaction = 'idle' | 'attack' | 'die';

/** What the player did on one trial. Everything else is derived by scoring. */
export type Decision = {
  trial: number | 'warmup';
  scenarioId: string;
  chosenActionId: string;
  /** Milliseconds from scenario shown to AI advice revealed. Descriptive only. */
  evidenceMs: number;
  /** Milliseconds from AI advice revealed to decision submitted. Descriptive only. */
  decisionMs: number;
  calLineId: string;
  reaction: Reaction;
};

export type Step =
  | { kind: 'intro' }
  | { kind: 'briefing' }
  | { kind: 'scenario'; trial: number | 'warmup' }
  | { kind: 'feedback'; trial: number | 'warmup' }
  | { kind: 'midpoint' }
  | { kind: 'results' };

export type Session = {
  seed: string;
  scenarioBankVersion: string;
  plan: TrialPlan[];
  warmup: Decision | null;
  decisions: Decision[];
  step: Step;
  /** Ids of Cal lines already spoken, oldest first. Drives cooldowns. */
  calHistory: string[];
  /** True when this run was started from a previous run's results ("play again"). */
  returning?: boolean;
};

export type ReliancePattern =
  | 'appropriate-accept' // AI correct, player accepted
  | 'underreliance' // AI correct, player chose something else
  | 'overreliance' // AI incorrect, player accepted
  | 'correct-override' // AI incorrect, player rejected and chose the documented action
  | 'override-other'; // AI incorrect, player rejected but chose another non-documented action
