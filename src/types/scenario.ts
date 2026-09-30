export type Domain =
  | 'expense-review'
  | 'supplier-selection'
  | 'transaction-monitoring'
  | 'customer-operations'
  | 'cyber-triage'
  | 'logistics-exception';

export type Confidence = 0.65 | 0.8 | 0.95;
export type ExplanationMode = 'none' | 'rationale';
export type Difficulty = 1 | 2 | 3;

export type Fact = {
  label: string;
  value: string;
};

export type ActionOption = {
  id: string;
  label: string;
  /** True for the option that defers the decision to gather more evidence. At most one per scenario. */
  investigative: boolean;
  /** What happens in the scenario world if the player picks this action. */
  outcome: string;
};

/** One way the simulated AI can advise on a scenario. The facts never change between variants. */
export type AdviceVariant = {
  actionId: string;
  explanation: string;
  /** Required on the incorrect variant: the traceable flaw in its reasoning. */
  reasoningError?: string;
};

/**
 * Canonical scenario record. Ground truth (correctActionId) lives here, separate from
 * the two advice variants. The UI never derives correctness from recommendation text.
 */
export type ScenarioRecord = {
  id: string;
  domain: Domain;
  title: string;
  brief: string;
  facts: Fact[];
  actions: ActionOption[];
  correctActionId: string;
  advice: {
    correct: AdviceVariant;
    incorrect: AdviceVariant;
  };
  consequence: string;
  learningNote: string;
  difficulty: Difficulty;
};

/**
 * A scenario as presented in one trial: the canonical record resolved against its
 * assigned conditions. Field names follow the brief's Scenario type (section 5.4).
 */
export type Scenario = {
  id: string;
  domain: Domain;
  title: string;
  brief: string;
  facts: Fact[];
  actions: ActionOption[];
  correctActionId: string;
  aiRecommendationActionId: string;
  aiIsCorrect: boolean;
  confidence: Confidence;
  explanationMode: ExplanationMode;
  aiExplanation?: string;
  reasoningError?: string;
  consequence: string;
  learningNote: string;
  difficulty: Difficulty;
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  'expense-review': 'Expense review',
  'supplier-selection': 'Supplier selection',
  'transaction-monitoring': 'Transaction monitoring',
  'customer-operations': 'Customer operations',
  'cyber-triage': 'Cyber incident triage',
  'logistics-exception': 'Logistics exception',
};
