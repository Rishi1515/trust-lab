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
  const best = scenario.actions.find((a) => a.id === scenario.correctActionId)!;
  const recommended = scenario.actions.find((a) => a.id === scenario.aiRecommendationActionId)!;
  const line = CAL_LINES.find((l) => l.id === decision.calLineId)?.text;
  const record = findScenario(scenario.id);
  const withheld = record ? (scenario.aiIsCorrect ? record.advice.correct : record.advice.incorrect).explanation : '';

  return (
    <div className="layout-with-cal">
      <div className="content">
        <Progress trial={trial} />
        <p className="mono eyebrow">Result · {scenario.title}</p>
        <PageTitle className={result.correct ? 'result-good' : 'result-bad'}>
          <span aria-hidden="true" className="result-symbol">
            {result.correct ? '✓' : '✗'}
          </span>{' '}
          {result.correct ? 'Right call' : 'Not the best choice'}
        </PageTitle>
        {trial === 'warmup' && <p className="note">That was the practice round. It doesn't count.</p>}

        <dl className="summary panel">
          <div>
            <dt>You chose</dt>
            <dd>{chosen.label}</dd>
          </div>
          <div>
            <dt>Best choice</dt>
            <dd>{best.label}</dd>
          </div>
          <div>
            <dt>The AI said</dt>
            <dd>
              {recommended.label}{' '}
              <span className={scenario.aiIsCorrect ? 'verdict good' : 'verdict bad'}>
                ({scenario.aiIsCorrect ? 'it was right' : 'it was wrong'}, claimed {Math.round(scenario.confidence * 100)}% sure)
              </span>
            </dd>
          </div>
          <div>
            <dt>How you treated the AI</dt>
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
              <strong>If you had picked "{best.label}":</strong> {best.outcome}
            </p>
          )}
          <p>{scenario.consequence}</p>
        </section>

        {!scenario.aiIsCorrect && (
          <section className="panel" aria-labelledby="error-heading">
            <h2 id="error-heading">Where the AI went wrong</h2>
            {scenario.explanationMode === 'none' && (
              <p className="muted">You didn't see its reasoning. It would have said: “{withheld}”</p>
            )}
            <p>{scenario.reasoningError}</p>
          </section>
        )}

        <p className="learning">
          <span className="mono label">Lesson</span> {scenario.learningNote}
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
