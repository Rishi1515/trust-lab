import type { ScenarioRecord } from '../src/types/scenario';
import type { Decision, TrialPlan } from '../src/types/session';

/** Synthetic scenario used only by scoring fixtures, so scoring tests do not depend on content edits. */
export function fixtureScenario(id: string): ScenarioRecord {
  return {
    id,
    domain: 'expense-review',
    title: `Fixture ${id}`,
    brief: 'Fixture',
    facts: [
      { label: 'A', value: '1' },
      { label: 'B', value: '2' },
      { label: 'C', value: '3' },
    ],
    actions: [
      { id: 'right', label: 'Right', investigative: false, outcome: 'ok' },
      { id: 'wrong', label: 'Wrong', investigative: false, outcome: 'bad' },
      { id: 'look', label: 'Look closer', investigative: true, outcome: 'slow' },
    ],
    correctActionId: 'right',
    advice: {
      correct: { actionId: 'right', explanation: 'Because.' },
      incorrect: { actionId: 'wrong', explanation: 'Because, wrongly.', reasoningError: 'A flaw.' },
    },
    consequence: 'c',
    learningNote: 'l',
    difficulty: 1,
  };
}

export function decision(trial: number, scenarioId: string, chosenActionId: string, ms = 1000): Decision {
  return { trial, scenarioId, chosenActionId, evidenceMs: ms / 2, decisionMs: ms / 2, calLineId: 'x', reaction: 'idle' };
}

export function planRow(trial: number, scenarioId: string, aiIsCorrect: boolean, confidence: 0.65 | 0.95, rationale: boolean): TrialPlan {
  return { trial, scenarioId, aiIsCorrect, confidence, explanationMode: rationale ? 'rationale' : 'none' };
}
