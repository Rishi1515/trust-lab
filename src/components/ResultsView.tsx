import { useMemo } from 'react';
import { APP_VERSION, BUILD_SHA, SCENARIO_BANK_VERSION } from '../app/version';
import { selectCalLine } from '../content/calDialogue';
import { METRIC_TEXT } from '../content/metrics';
import { SCENARIOS } from '../data/scenarios';
import { HIGH_CONFIDENCE, MODERATE_CONFIDENCE } from '../experiment/assignment';
import { downloadText, exportFileName, toCsv, toJson, type ExportMeta } from '../experiment/export';
import {
  buildTrialResults,
  formatPoints,
  formatRate,
  formatSeconds,
  ratio,
  resultBand,
  summarise,
  type Ratio,
  type TrialResult,
} from '../experiment/scoring';
import type { Session } from '../types/session';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';
import { PATTERN_LABEL } from './patternText';
import { Sprite } from './Sprite';

const BAND_TITLE = { strong: 'Well calibrated', middle: 'Partly calibrated', low: 'Recalibration advised' } as const;

function countOf(r: Ratio): string {
  return r.total === 0 ? 'none in this run' : `${r.count} of ${r.total}`;
}

function BarRow({ label, value }: { label: string; value: Ratio }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar-track" aria-hidden="true">
        <span className="bar-fill" style={{ width: `${Math.round((value.rate ?? 0) * 100)}%` }} />
      </span>
      <span className="bar-value mono">
        {countOf(value)} accepted · {formatRate(value)}
      </span>
    </div>
  );
}

function Comparison(props: { title: string; definition: string; points: number | null; rows: [string, Ratio][] }) {
  return (
    <div className="comparison">
      <h3>
        {props.title}: <span className="mono">{formatPoints(props.points)}</span>
      </h3>
      <p className="muted small">{props.definition}</p>
      {props.rows.map(([label, value]) => (
        <BarRow key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function aiAccuracyAt(results: TrialResult[], confidence: number): Ratio {
  const subset = results.filter((r) => r.scenario.confidence === confidence);
  return ratio(subset.filter((r) => r.scenario.aiIsCorrect).length, subset.length);
}

type Props = { session: Session; onReplay: () => void; onNewRun: () => void };

export function ResultsView({ session, onReplay, onNewRun }: Props) {
  const results = useMemo(() => buildTrialResults(session.plan, session.decisions, SCENARIOS), [session]);
  const s = summarise(results);
  const band = resultBand(s);
  const line = selectCalLine(`results-${band}`, session.calHistory, session.seed).text;
  const meta: ExportMeta = { seed: session.seed, scenarioBankVersion: SCENARIO_BANK_VERSION, appVersion: APP_VERSION, buildSha: BUILD_SHA };
  const highAccuracy = aiAccuracyAt(results, HIGH_CONFIDENCE);
  const moderateAccuracy = aiAccuracyAt(results, MODERATE_CONFIDENCE);

  const metrics: { name: string; value: Ratio; text: string; extra?: string }[] = [
    { name: 'Decision accuracy', value: s.accuracy, text: METRIC_TEXT.accuracy },
    {
      name: 'Appropriate reliance',
      value: s.appropriateReliance,
      text: METRIC_TEXT.appropriate,
      extra: s.appropriateReliance.rejectedIncorrectButChoseOther
        ? `${s.appropriateReliance.rejectedIncorrectButChoseOther} of these rejected wrong advice but chose another action that was not the documented one.`
        : undefined,
    },
    { name: 'Overreliance', value: s.overreliance, text: `${METRIC_TEXT.overreliance} Counted out of the scenarios where the advice was wrong.` },
    {
      name: 'Underreliance',
      value: s.underreliance,
      text: `${METRIC_TEXT.underreliance} Counted out of the scenarios where the advice was right.`,
      extra: s.underreliance.viaInvestigation ? `${s.underreliance.viaInvestigation} of these were choices to investigate.` : undefined,
    },
    {
      name: 'Investigation',
      value: s.investigation,
      text: METRIC_TEXT.investigation,
      extra: s.investigation.count ? `Investigating was the documented action in ${s.investigation.documentedCorrect} of your ${s.investigation.count}.` : undefined,
    },
  ];

  function download(kind: 'json' | 'csv') {
    const text = kind === 'json' ? toJson(results, s, meta) : toCsv(results, meta);
    downloadText(exportFileName(meta, kind), text, kind === 'json' ? 'application/json' : 'text/csv');
  }

  return (
    <div className="results">
      <div className="results-head">
        <div>
          <p className="mono eyebrow">Results · {s.trials} scored decisions</p>
          <PageTitle>{BAND_TITLE[band]}</PageTitle>
          <p className="lede">
            You accepted right advice {countOf(s.acceptance.aiCorrect)} times and wrong advice {countOf(s.acceptance.aiIncorrect)}{' '}
            times. The title comes from your appropriate-reliance count; the numbers below are what it is based on.
          </p>
        </div>
        <CalPanel line={line} />
      </div>

      <div className="results-grid">
        <div className="results-main">
          <section className="panel" aria-labelledby="counts-heading">
            <h2 id="counts-heading">What you did</h2>
            <table className="metrics">
              <caption className="visually-hidden">Reliance metrics for this run</caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">Count</th>
                  <th scope="col">Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.name}>
                    <th scope="row">
                      {m.name}
                      <span className="metric-def">{m.text}</span>
                      {m.extra && <span className="metric-def">{m.extra}</span>}
                    </th>
                    <td className="mono">{countOf(m.value)}</td>
                    <td className="mono">{formatRate(m.value)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">
                    Decision time (median)
                    <span className="metric-def">{METRIC_TEXT.time}</span>
                  </th>
                  <td className="mono">{formatSeconds(s.decisionTime.medianMs)}</td>
                  <td className="mono">–</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="panel" aria-labelledby="conditions-heading">
            <h2 id="conditions-heading">How the presentation affected you</h2>
            <Comparison
              title="Right versus wrong advice"
              definition={METRIC_TEXT.discrimination}
              points={s.discrimination}
              rows={[
                ['Advice was right', s.acceptance.aiCorrect],
                ['Advice was wrong', s.acceptance.aiIncorrect],
              ]}
            />
            <Comparison
              title="Confidence susceptibility"
              definition={METRIC_TEXT.confidence}
              points={s.confidenceSusceptibility}
              rows={[
                ['Stated 95%', s.acceptance.highConfidence],
                ['Stated 65%', s.acceptance.moderateConfidence],
              ]}
            />
            <Comparison
              title="Explanation effect"
              definition={METRIC_TEXT.explanation}
              points={s.explanationEffect}
              rows={[
                ['Reasoning shown', s.acceptance.rationale],
                ['Reasoning withheld', s.acceptance.noRationale],
              ]}
            />
          </section>
        </div>

        <aside className="panel limitations" aria-labelledby="limits-heading">
          <h2 id="limits-heading">Read these numbers with care</h2>
          <ul className="plain-list">
            <li>
              <strong>{s.trials} decisions is a small sample.</strong> One different choice moves a rate out of 6 by about 17
              points.
            </li>
            <li>
              <strong>The AI was right exactly half the time by design</strong>, at both confidence levels. Real systems are not
              built this way.
            </li>
            <li>
              <strong>You were told some advice was wrong</strong>, which probably made you more sceptical than you would be at
              work.
            </li>
            <li>
              <strong>Scenarios differ in difficulty.</strong> Assignment balances difficulty between right and wrong advice, but
              only to within one point.
            </li>
            <li>
              <strong>This describes one session.</strong> It is not a measure of you as a person, and it is not a research
              finding.
            </li>
          </ul>
          <a className="text-link" href="#/method">
            Full method and limitations
          </a>
        </aside>
      </div>

      <section className="panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Scenario by scenario</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="review-heading">
          <table className="review">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Scenario</th>
                <th scope="col">AI advice</th>
                <th scope="col">Your choice</th>
                <th scope="col">Documented action</th>
                <th scope="col">Reliance</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const label = (id: string) => r.scenario.actions.find((a) => a.id === id)?.label ?? id;
                return (
                  <tr key={r.trial}>
                    <td className="mono">{r.trial}</td>
                    <td>{r.scenario.title}</td>
                    <td>
                      {label(r.scenario.aiRecommendationActionId)}
                      <span className="cell-meta mono">
                        {Math.round(r.scenario.confidence * 100)}% · {r.scenario.explanationMode === 'rationale' ? 'reasoning shown' : 'no reasoning'} ·{' '}
                        {r.scenario.aiIsCorrect ? 'right' : 'wrong'}
                      </span>
                    </td>
                    <td>
                      <span aria-hidden="true">{r.correct ? '✓ ' : '✗ '}</span>
                      <span className="visually-hidden">{r.correct ? 'Matched: ' : 'Did not match: '}</span>
                      {label(r.decision.chosenActionId)}
                    </td>
                    <td>{label(r.scenario.correctActionId)}</td>
                    <td>
                      {r.pattern === 'overreliance' && <Sprite name="skull" className="sprite-inline risk-mark" />} {PATTERN_LABEL[r.pattern]}
                    </td>
                    <td className="mono">{formatSeconds(r.decision.evidenceMs + r.decision.decisionMs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel debrief" aria-labelledby="debrief-heading">
        <h2 id="debrief-heading">Debrief</h2>
        <h3>Automation bias</h3>
        <p>
          People tend to accept automated advice without checking it as carefully as they would check a colleague, especially
          when the advice is fluent or sounds certain. Overreliance above counts how often that happened here.
        </p>
        <h3>Confidence calibration</h3>
        <p>
          A confidence figure is only useful if it matches how often the system is right. In this run the AI was right{' '}
          {countOf(highAccuracy)} times when it said 95% and {countOf(moderateAccuracy)} times when it said 65%.
          {highAccuracy.rate === moderateAccuracy.rate
            ? ' The figure carried no information about correctness, so any difference in how often you accepted the advice came from the number itself.'
            : ' The figure was not a reliable guide to correctness.'}
        </p>
        <h3>Explanations</h3>
        <p>
          Every wrong recommendation came with a plausible argument containing one traceable mistake. Half of all
          recommendations showed their reasoning and half did not, so the explanation effect compares the same kinds of advice
          with and without it.
        </p>
        <h3>How this was controlled</h3>
        <p>
          Your seed fixed which scenarios had right or wrong advice, the confidence and reasoning conditions, the order and the
          position of each option. Each business domain contributed one right and one wrong recommendation. Facts never changed
          between conditions. The scenario bank is versioned and was reviewed before release.
        </p>
      </section>

      <section className="panel" aria-labelledby="export-heading">
        <h2 id="export-heading">Your data</h2>
        <p>
          Downloads are created in your browser. They contain your {s.trials} decisions, the conditions, the seed and version
          numbers, and no personal identifiers.
        </p>
        <p className="meta mono">
          seed {session.seed} · scenario bank {SCENARIO_BANK_VERSION} · app {APP_VERSION} ({BUILD_SHA})
        </p>
        <div className="actions-row">
          <button type="button" className="button" onClick={() => download('json')}>
            Download JSON
          </button>
          <button type="button" className="button" onClick={() => download('csv')}>
            Download CSV
          </button>
        </div>
        <h3>Play again</h3>
        <p className="muted">A new run starts from zero. Nothing from this run counts towards the next one.</p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onNewRun}>
            New run with a new seed
          </button>
          <button type="button" className="button" onClick={onReplay}>
            Replay seed {session.seed}
          </button>
        </div>
      </section>
      <p className="credit-line">Character art and sprites by P. Tejas Varma.</p>
    </div>
  );
}
