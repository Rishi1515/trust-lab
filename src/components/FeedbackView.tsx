import { CAL_LINES } from '../content/calDialogue';
import { findScenario } from '../data/scenarios';
import { evaluateDecision } from '../experiment/scoring';
import type { Scenario } from '../types/scenario';
import type { Decision } from '../types/session';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';
import { Progress } from './Progress';
import { PATTERN_LABEL } from './patternText';
import { Sprite } from './Sprite';

type Props = {
  trial: number | 'warmup';
  scenario: Scenario;
  decision: Decision;
  continueLabel: string;
  onContinue: () => void;
};

export function FeedbackView({ trial, scenario, decision, continueLabel, onContinue }: Props) {
  const result = evaluateDecision(scenario, decision.chosenActionId);
  const chosen = scenario.actions.find((a) => a.id === decision.chosenActionId)!;
  const documented = scenario.actions.find((a) => a.id === scenario.correctActionId)!;
  const recommended = scenario.actions.find((a) => a.id === scenario.aiRecommendationActionId)!;
  const line = CAL_LINES.find((l) => l.id === decision.calLineId)?.text;
  const record = findScenario(scenario.id);
  const withheld = record ? (scenario.aiIsCorrect ? record.advice.correct : record.advice.incorrect).explanation : '';

  return (
    <div className="layout-with-cal">
      <div className="content">
        <Progress trial={trial} />
        <p className="mono eyebrow">Feedback · {scenario.title}</p>
        <PageTitle className={result.correct ? 'result-good' : 'result-bad'}>
          <span aria-hidden="true" className="result-symbol">
            {result.correct ? '✓' : '✗'}
          </span>{' '}
          {result.correct ? 'You chose the documented action' : 'Not the documented action'}
        </PageTitle>
        {trial === 'warmup' && <p className="note">This was the practice round. It is not scored.</p>}

        <dl className="summary panel">
          <div>
            <dt>Your decision</dt>
            <dd>{chosen.label}</dd>
          </div>
          <div>
            <dt>Documented action</dt>
            <dd>{documented.label}</dd>
          </div>
          <div>
            <dt>AI recommended</dt>
            <dd>
              {recommended.label}{' '}
              <span className={scenario.aiIsCorrect ? 'verdict good' : 'verdict bad'}>
                ({scenario.aiIsCorrect ? 'right' : 'wrong'}, stated {Math.round(scenario.confidence * 100)}%)
              </span>
            </dd>
          </div>
          <div>
            <dt>Reliance</dt>
            <dd>
              {result.pattern === 'overreliance' && <Sprite name="skull" className="sprite-inline risk-mark" />}{' '}
              {PATTERN_LABEL[result.pattern]}
            </dd>
          </div>
        </dl>

        <section className="panel" aria-labelledby="happened-heading">
          <h2 id="happened-heading">What happened</h2>
          <p>{chosen.outcome}</p>
          {!result.correct && (
            <p>
              <strong>With the documented action ({documented.label.toLowerCase()}):</strong> {documented.outcome}
            </p>
          )}
          <p>{scenario.consequence}</p>
        </section>

        {!scenario.aiIsCorrect && (
          <section className="panel" aria-labelledby="error-heading">
            <h2 id="error-heading">Where the AI went wrong</h2>
            {scenario.explanationMode === 'none' && (
              <p className="muted">
                Its reasoning was withheld during your decision. It would have said: “{withheld}”
              </p>
            )}
            <p>{scenario.reasoningError}</p>
          </section>
        )}

        <p className="learning">
          <span className="mono label">Takeaway</span> {scenario.learningNote}
        </p>

        <div className="actions-row">
          <button type="button" className="button primary" onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      </div>
      <CalPanel line={line} reaction={decision.reaction} />
    </div>
  );
}
