import type { Summary, TrialResult } from './scoring';

export const EXPORT_SCHEMA_VERSION = '1';

export type ExportMeta = {
  seed: string;
  scenarioBankVersion: string;
  appVersion: string;
  buildSha: string;
};

/** Documented per-trial columns. docs/data_dictionary.md must list exactly these, in this order. */
export const TRIAL_FIELDS = [
  'seed',
  'scenario_bank_version',
  'app_version',
  'build_sha',
  'trial',
  'scenario_id',
  'domain',
  'difficulty',
  'ai_is_correct',
  'confidence',
  'explanation_mode',
  'ai_recommendation',
  'correct_action',
  'chosen_action',
  'accepted',
  'correct',
  'investigated',
  'pattern',
  'evidence_ms',
  'decision_ms',
] as const;

export type TrialRow = Record<(typeof TRIAL_FIELDS)[number], string | number | boolean>;

export function toTrialRows(results: readonly TrialResult[], meta: ExportMeta): TrialRow[] {
  return results.map((r) => ({
    seed: meta.seed,
    scenario_bank_version: meta.scenarioBankVersion,
    app_version: meta.appVersion,
    build_sha: meta.buildSha,
    trial: r.trial,
    scenario_id: r.scenario.id,
    domain: r.scenario.domain,
    difficulty: r.scenario.difficulty,
    ai_is_correct: r.scenario.aiIsCorrect,
    confidence: r.scenario.confidence,
    explanation_mode: r.scenario.explanationMode,
    ai_recommendation: r.scenario.aiRecommendationActionId,
    correct_action: r.scenario.correctActionId,
    chosen_action: r.decision.chosenActionId,
    accepted: r.accepted,
    correct: r.correct,
    investigated: r.investigated,
    pattern: r.pattern,
    evidence_ms: Math.round(r.decision.evidenceMs),
    decision_ms: Math.round(r.decision.decisionMs),
  }));
}

export function toJson(results: readonly TrialResult[], summary: Summary, meta: ExportMeta): string {
  const payload = {
    export_schema_version: EXPORT_SCHEMA_VERSION,
    app: 'TrustLab',
    note: 'Simulated AI advice from a fixed scenario bank. No personal identifiers are collected.',
    seed: meta.seed,
    scenario_bank_version: meta.scenarioBankVersion,
    app_version: meta.appVersion,
    build_sha: meta.buildSha,
    trials: toTrialRows(results, meta),
    summary: {
      trials: summary.trials,
      correct_decisions: summary.accuracy.count,
      appropriate_reliance: summary.appropriateReliance.count,
      accepted_correct_advice: summary.appropriateReliance.acceptedCorrectAdvice,
      rejected_incorrect_advice: summary.appropriateReliance.rejectedIncorrectAdvice,
      rejected_incorrect_but_chose_other: summary.appropriateReliance.rejectedIncorrectButChoseOther,
      overreliance: summary.overreliance.count,
      incorrect_advice_trials: summary.overreliance.total,
      underreliance: summary.underreliance.count,
      underreliance_via_investigation: summary.underreliance.viaInvestigation,
      correct_advice_trials: summary.underreliance.total,
      investigations: summary.investigation.count,
      investigations_documented_correct: summary.investigation.documentedCorrect,
      confidence_susceptibility_pts: summary.confidenceSusceptibility,
      explanation_effect_pts: summary.explanationEffect,
      discrimination_pts: summary.discrimination,
      median_trial_ms: summary.decisionTime.medianMs,
    },
  };
  return JSON.stringify(payload, null, 2);
}

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(results: readonly TrialResult[], meta: ExportMeta): string {
  const rows = toTrialRows(results, meta);
  const lines = [TRIAL_FIELDS.join(',')];
  for (const row of rows) lines.push(TRIAL_FIELDS.map((f) => csvCell(row[f])).join(','));
  return `${lines.join('\n')}\n`;
}

export function exportFileName(meta: ExportMeta, extension: 'json' | 'csv'): string {
  return `trustlab-${meta.seed}-v${meta.scenarioBankVersion}.${extension}`;
}

/** Browser-only: hands the file to the user. Nothing is uploaded. */
export function downloadText(fileName: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
