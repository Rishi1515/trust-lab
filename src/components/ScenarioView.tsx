import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Scenario } from '../types/scenario';
import { DOMAIN_LABELS } from '../types/scenario';
import { CalPanel } from './CalPanel';
import { ConfidenceMeter } from './ConfidenceMeter';
import { PageTitle } from './PageTitle';
import { Progress } from './Progress';

type Props = {
  trial: number | 'warmup';
  scenario: Scenario;
  onSubmit: (chosenActionId: string, evidenceMs: number, decisionMs: number) => void;
};

/** Evidence first; the AI advice and the decision form appear only after the player asks for the advice. */
export function ScenarioView({ trial, scenario, onSubmit }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [error, setError] = useState('');
  const shownAt = useRef(0);
  const revealedAt = useRef(0);
  const adviceHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    shownAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (revealed) adviceHeading.current?.focus();
  }, [revealed]);

  const recommended = scenario.actions.find((a) => a.id === scenario.aiRecommendationActionId)!;

  function reveal() {
    revealedAt.current = performance.now();
    setRevealed(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!choice) {
      setError('Choose one of the three actions first.');
      return;
    }
    const now = performance.now();
    onSubmit(choice, revealedAt.current - shownAt.current, now - revealedAt.current);
  }

  return (
    <div className="layout-with-cal">
      <div className="content">
        <Progress trial={trial} />
        <p className="mono eyebrow">{DOMAIN_LABELS[scenario.domain]}</p>
        <PageTitle>{scenario.title}</PageTitle>
        <p className="lede">{scenario.brief}</p>

        <section className="panel" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Evidence</h2>
          <dl className="facts">
            {scenario.facts.map((fact) => (
              <div key={fact.label} className="fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {!revealed ? (
          <div className="actions-row">
            <button type="button" className="button primary" onClick={reveal}>
              Show the AI recommendation
            </button>
          </div>
        ) : (
          <>
            <section className="panel advice" aria-labelledby="advice-heading">
              <h2 id="advice-heading" tabIndex={-1} ref={adviceHeading}>
                AI recommendation <span className="tag mono">simulated</span>
              </h2>
              <p className="advice-action">
                <span className="visually-hidden">Recommended action: </span>
                {recommended.label}
              </p>
              <ConfidenceMeter value={scenario.confidence} />
              {scenario.explanationMode === 'rationale' && scenario.aiExplanation ? (
                <div className="advice-reasoning">
                  <p className="mono label">Reasoning</p>
                  <p>{scenario.aiExplanation}</p>
                </div>
              ) : (
                <p className="advice-none">No reasoning was provided with this recommendation.</p>
              )}
            </section>

            <form className="decision" onSubmit={submit} noValidate>
              <fieldset>
                <legend>Your decision</legend>
                {scenario.actions.map((action) => (
                  <label key={action.id} className={`option${choice === action.id ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name="decision"
                      value={action.id}
                      checked={choice === action.id}
                      onChange={() => {
                        setChoice(action.id);
                        setError('');
                      }}
                    />
                    <span className="option-label">{action.label}</span>
                    <span className="option-tags">
                      {action.id === recommended.id && <span className="tag mono tag-ai">AI recommends</span>}
                      {action.investigative && <span className="tag mono">gathers evidence</span>}
                    </span>
                  </label>
                ))}
              </fieldset>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="actions-row">
                <button type="submit" className="button primary">
                  Submit decision
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <CalPanel note="Cal comments after you decide, never before." />
    </div>
  );
}
