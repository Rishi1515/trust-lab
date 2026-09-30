import { useMemo } from 'react';
import { APP_VERSION, BUILD_SHA, SCENARIO_BANK_VERSION } from '../app/version';
import { mistakeLean, resultsTrigger, selectCalLine } from '../content/calDialogue';
import { METRIC_TEXT } from '../content/metrics';
import { SCENARIOS } from '../data/scenarios';
import { HIGH_CONFIDENCE, MODERATE_CONFIDENCE } from '../experiment/assignment';
import { downloadText, exportFileName, toCsv, toJson, type ExportMeta } from '../experiment/export';
import {
  buildTrialResults,
  formatRate,
  formatSeconds,
  ratio,
  resultBand,
  summarise,
  type Ratio,
  type Summary,
  type TrialResult,
} from '../experiment/scoring';
import type { Session } from '../types/session';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';
import { PATTERN_LABEL } from './patternText';
import { ScoreRing } from './ScoreRing';
import { Sprite } from './Sprite';

const BAND_TITLE = { strong: 'Well calibrated', middle: 'Partly calibrated', low: 'Needs recalibration' } as const;

function verdict(summary: Summary, band: keyof typeof BAND_TITLE): string {
  const lean = mistakeLean(summary);
  if (summary.trials > 0 && summary.appropriateReliance.count === summary.trials) {
    return 'Perfect. You trusted the AI every time it was right and caught it every time it was wrong.';
  }
  if (band === 'strong') return 'You trusted the AI when it was right and caught it when it was wrong, almost every time.';
  if (band === 'middle') {
    if (lean === 'trusting') return 'You got most calls right, but the AI talked you into some of its mistakes.';
    if (lean === 'doubting') return 'You got most calls right, but you also doubted some advice that was actually good.';
    return 'You got most calls right, with a few slips both ways.';
  }
  return lean === 'doubting' ? 'You doubted the AI a lot, even when it was right.' : "The AI's advice swayed you more often than it should have.";
}

function countOf(r: Ratio): string {
  return r.total === 0 ? 'none in this game' : `${r.count} of ${r.total}`;
}

function points(p: number | null): string {
  if (p === null) return 'n/a';
  if (p === 0) return '0 points';
  return `${p > 0 ? '+' : '−'}${Math.abs(p)} points`;
}

function BarRow({ label, value }: { label: string; value: Ratio }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <span className="bar-track" aria-hidden="true">
        <span className="bar-fill" style={{ width: `${Math.round((value.rate ?? 0) * 100)}%` }} />
      </span>
      <span className="bar-value mono">
        agreed {countOf(value)} · {formatRate(value)}
      </span>
    </div>
  );
}

function Comparison(props: { title: string; definition: string; value: number | null; rows: [string, Ratio][] }) {
  return (
    <div className="comparison">
      <h3>
        {props.title} <span className="mono">{points(props.value)}</span>
      </h3>
      <p className="muted small">{props.definition}</p>
      {props.rows.map(([label, value]) => (
        <BarRow key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function aiRightAt(results: TrialResult[], confidence: number): Ratio {
  const subset = results.filter((r) => r.scenario.confidence === confidence);
  return ratio(subset.filter((r) => r.scenario.aiIsCorrect).length, subset.length);
}

type Props = { session: Session; onReplay: () => void; onNewRun: () => void };

export function ResultsView({ session, onReplay, onNewRun }: Props) {
  const results = useMemo(() => buildTrialResults(session.plan, session.decisions, SCENARIOS), [session]);
  const s = summarise(results);
  const band = resultBand(s);
  const line = selectCalLine(resultsTrigger(s, band), session.calHistory, session.seed).text;
  const meta: ExportMeta = { seed: session.seed, scenarioBankVersion: SCENARIO_BANK_VERSION, appVersion: APP_VERSION, buildSha: BUILD_SHA };
  const rightAtHigh = aiRightAt(results, HIGH_CONFIDENCE);
  const rightAtModerate = aiRightAt(results, MODERATE_CONFIDENCE);

  const rows: { name: string; value: Ratio; text: string; extra?: string }[] = [
    {
      name: 'Trusted at the right times',
      value: s.appropriateReliance,
      text: METRIC_TEXT.appropriate,
      extra: s.appropriateReliance.rejectedIncorrectButChoseOther
        ? `This includes ${s.appropriateReliance.rejectedIncorrectButChoseOther} where you rightly rejected the AI but then picked another wrong option.`
        : undefined,
    },
    { name: 'Best choice picked', value: s.accuracy, text: METRIC_TEXT.accuracy },
    { name: 'Trusted bad advice', value: s.overreliance, text: `${METRIC_TEXT.overreliance} Out of the times it was wrong.` },
    {
      name: 'Ignored good advice',
      value: s.underreliance,
      text: `${METRIC_TEXT.underreliance} Out of the times it was right.`,
      extra: s.underreliance.viaInvestigation
        ? `${s.underreliance.viaInvestigation} of ${s.underreliance.viaInvestigation === 1 ? 'these was' : 'these were'} choosing to check first.`
        : undefined,
    },
    {
      name: 'Chose to check first',
      value: s.investigation,
      text: METRIC_TEXT.investigation,
      extra: s.investigation.count ? `Checking first was the best choice in ${s.investigation.documentedCorrect} of your ${s.investigation.count}.` : undefined,
    },
  ];

  function download(kind: 'json' | 'csv') {
    const text = kind === 'json' ? toJson(results, s, meta) : toCsv(results, meta);
    downloadText(exportFileName(meta, kind), text, kind === 'json' ? 'application/json' : 'text/csv');
  }

  return (
    <div className="results">
      <div className="results-head">
        <ScoreRing score={s.appropriateReliance.count} total={s.trials} band={band} />
        <div>
          <p className="mono eyebrow">Your results</p>
          <PageTitle>{BAND_TITLE[band]}</PageTitle>
          <p className="lede">{s.trials === 0 ? 'No decisions were recorded in this game.' : verdict(s, band)}</p>
          {s.trials > 0 && (
            <p className="muted">
              Your trust score counts the decisions where you followed the AI when it was right or went against it when it was
              wrong. The AI was right {s.acceptance.aiCorrect.total} times and wrong {s.acceptance.aiIncorrect.total} times. You
              followed its good advice {countOf(s.acceptance.aiCorrect)} times and its bad advice{' '}
              {countOf(s.acceptance.aiIncorrect)} times.
            </p>
          )}
        </div>
        <CalPanel line={line} />
      </div>

      <div className="results-grid">
        <div className="results-main">
          <section className="panel" aria-labelledby="counts-heading">
            <h2 id="counts-heading">Your numbers</h2>
            <table className="metrics">
              <caption className="visually-hidden">Your numbers for this game</caption>
              <thead>
                <tr>
                  <th scope="col">What</th>
                  <th scope="col">Count</th>
                  <th scope="col">Rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
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
                    Typical time per decision
                    <span className="metric-def">{METRIC_TEXT.time}</span>
                  </th>
                  <td className="mono">{formatSeconds(s.decisionTime.medianMs)}</td>
                  <td className="mono">
                    <span aria-hidden="true">–</span>
                    <span className="visually-hidden">no rate</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="panel" aria-labelledby="conditions-heading">
            <h2 id="conditions-heading">What swayed you</h2>
            <Comparison
              title="Could you tell good advice from bad?"
              definition={METRIC_TEXT.discrimination}
              value={s.discrimination}
              rows={[
                ['When the AI was right', s.acceptance.aiCorrect],
                ['When the AI was wrong', s.acceptance.aiIncorrect],
              ]}
            />
            <Comparison
              title={'Did "95% sure" sway you?'}
              definition={METRIC_TEXT.confidence}
              value={s.confidenceSusceptibility}
              rows={[
                ['When it said 95%', s.acceptance.highConfidence],
                ['When it said 65%', s.acceptance.moderateConfidence],
              ]}
            />
            <Comparison
              title="Did its explanations sway you?"
              definition={METRIC_TEXT.explanation}
              value={s.explanationEffect}
              rows={[
                ['When it explained', s.acceptance.rationale],
                ["When it didn't", s.acceptance.noRationale],
              ]}
            />
          </section>
        </div>

        <aside className="panel limitations" aria-labelledby="limits-heading">
          <h2 id="limits-heading">Take these numbers lightly</h2>
          <ul className="plain-list">
            <li>
              <strong>{s.trials} decisions is a small sample.</strong> One different choice changes a score quite a lot.
            </li>
            <li>
              <strong>The AI here is wrong exactly half the time.</strong> Real AI tools are usually right more often.
            </li>
            <li>
              <strong>You knew some advice was wrong</strong>, so you were probably more careful than you would be at work.
            </li>
            <li>
              <strong>Some cases are harder than others.</strong> The game spreads them out fairly, but not perfectly.
            </li>
            <li>
              <strong>This is a game, not a test of you as a person.</strong>
            </li>
          </ul>
          <a className="text-link" href="#/method">
            How the game works
          </a>
        </aside>
      </div>

      <section className="panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Every decision</h2>
        <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="review-heading">
          <table className="review">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Case</th>
                <th scope="col">The AI said</th>
                <th scope="col">You chose</th>
                <th scope="col">Best choice</th>
                <th scope="col">Result</th>
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
                        {Math.round(r.scenario.confidence * 100)}% sure · {r.scenario.explanationMode === 'rationale' ? 'explained' : 'no explanation'} ·{' '}
                        {r.scenario.aiIsCorrect ? 'was right' : 'was wrong'}
                      </span>
                    </td>
                    <td>
                      <span aria-hidden="true">{r.correct ? '✓ ' : '✗ '}</span>
                      <span className="visually-hidden">{r.correct ? 'Best choice: ' : 'Not the best choice: '}</span>
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
        <h2 id="debrief-heading">What this game is about</h2>
        <h3>Trusting machines too much</h3>
        <p>
          People tend to accept a computer's advice without checking it, especially when it sounds sure of itself. Researchers
          call this automation bias. "Trusted bad advice" shows how often it happened to you.
        </p>
        <h3>Confidence numbers can mislead</h3>
        <p>
          A "95% sure" label only helps if the AI really is right 95% of the time. Here it was right {countOf(rightAtHigh)} times
          when it said 95%, and {countOf(rightAtModerate)} times when it said 65%, so the number told you nothing. With only 6
          decisions each, one game can't prove the number swayed you, but it's worth noticing if it did.
        </p>
        <h3>Explanations can mislead too</h3>
        <p>
          Every piece of wrong advice came with a reasonable-sounding explanation that had one mistake hidden in it. A good
          explanation is not proof of a right answer.
        </p>
        <h3>How the game is kept fair</h3>
        <p>
          Your game code decided which cases got right or wrong advice, the confidence numbers, whether an explanation was shown,
          and the order. Every type of decision got one piece of right advice and one piece of wrong advice. The same code always
          gives the same game.
        </p>
      </section>

      <section className="panel" aria-labelledby="export-heading">
        <h2 id="export-heading">Your answers</h2>
        <p>Download your answers if you want to keep them. The file is made in your browser and has no personal details.</p>
        <p className="meta mono">
          game code {session.seed} · cases {SCENARIO_BANK_VERSION} · app {APP_VERSION} ({BUILD_SHA})
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
        <p className="muted">A new game starts from zero. Nothing from this game carries over.</p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onNewRun}>
            Play a new game
          </button>
          <button type="button" className="button" onClick={onReplay}>
            Replay game {session.seed}
          </button>
        </div>
      </section>
      <p className="credit-line">Character art and sprites by P. Tejas Varma.</p>
    </div>
  );
}
