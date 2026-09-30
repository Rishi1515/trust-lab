import { SCENARIO_BANK_VERSION } from '../app/version';
import { METRIC_TEXT } from '../content/metrics';
import { PageTitle } from './PageTitle';

export function MethodView({ backHref, seed }: { backHref: string; seed: string }) {
  return (
    <div className="content prose">
      <p className="mono eyebrow">Method</p>
      <PageTitle>How the experiment works</PageTitle>
      <p className="note">
        If you have not played yet, this page describes the design, including how often the AI is wrong. Reading it first may
        change how you play.
      </p>

      <h2>Question</h2>
      <p>
        When a system gives advice, do people accept it when it is right and reject it when it is wrong? And does the way the
        advice is presented, a confidence figure and a written rationale, change that, independently of whether the advice is
        correct?
      </p>

      <h2>What varies</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Manipulated variables">
        <table>
          <thead>
            <tr>
              <th scope="col">Variable</th>
              <th scope="col">Levels</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">AI correctness</th>
              <td>Right or wrong</td>
              <td>Separates appropriate reliance from overreliance and underreliance.</td>
            </tr>
            <tr>
              <th scope="row">Stated confidence</th>
              <td>95% (high) or 65% (moderate)</td>
              <td>Tests whether a bigger number draws more agreement.</td>
            </tr>
            <tr>
              <th scope="row">Explanation</th>
              <td>Reasoning shown or withheld</td>
              <td>Tests whether reasoning increases trust independently of correctness.</td>
            </tr>
            <tr>
              <th scope="row">Domain</th>
              <td>Six business areas, two scenarios each</td>
              <td>Reduces dependence on one kind of decision.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Balance</h2>
      <p>Conditions are assigned from a seed rather than drawn at random per trial, so every complete run has the same shape:</p>
      <ul>
        <li>6 right and 6 wrong recommendations.</li>
        <li>Within each of those groups: 3 at 95% and 3 at 65%, and 3 with reasoning and 3 without.</li>
        <li>Across the run, each confidence and explanation combination appears exactly 3 times.</li>
        <li>Each domain contributes one right and one wrong recommendation.</li>
        <li>The total difficulty of the right-advice and wrong-advice groups differs by at most 1 point.</li>
        <li>Each half of the run has 3 right and 3 wrong recommendations.</li>
        <li>No two scenarios from the same domain are adjacent, and no more than 3 in a row share AI correctness.</li>
        <li>The order of the three options is shuffled per scenario, so position cannot hint at the answer.</li>
      </ul>
      <p>
        The same seed always reproduces the same run. The 80% confidence figure appears only in the unscored practice round.
      </p>

      <h2>Scenarios</h2>
      <p>
        Each scenario is one canonical record: facts, three actions, the documented correct action and what each action leads
        to. The ground truth is stored separately from the advice. Two advice texts are written from the same facts: one
        recommends the documented action, the other recommends a plausible wrong action whose reasoning contains one traceable
        error. Facts never change between conditions. Every scenario is fictional and solvable from the screen alone. Before
        release the bank went through a separate review pass by an AI reviewer that had not written it, and is frozen at
        version {SCENARIO_BANK_VERSION}. The review log in the repository lists every finding and change.
      </p>

      <h2>Measures</h2>
      <dl className="definitions">
        <dt>Decision accuracy</dt>
        <dd>{METRIC_TEXT.accuracy}</dd>
        <dt>Appropriate reliance</dt>
        <dd>{METRIC_TEXT.appropriate} Rejections of wrong advice that land on another non-documented action still count, and are shown separately.</dd>
        <dt>Overreliance</dt>
        <dd>{METRIC_TEXT.overreliance}</dd>
        <dt>Underreliance</dt>
        <dd>{METRIC_TEXT.underreliance} Investigating when the advice was right counts here, and is shown separately.</dd>
        <dt>Investigation rate</dt>
        <dd>{METRIC_TEXT.investigation}</dd>
        <dt>Confidence susceptibility</dt>
        <dd>{METRIC_TEXT.confidence}</dd>
        <dt>Explanation effect</dt>
        <dd>{METRIC_TEXT.explanation}</dd>
        <dt>Right-versus-wrong gap</dt>
        <dd>{METRIC_TEXT.discrimination}</dd>
        <dt>Decision time</dt>
        <dd>{METRIC_TEXT.time}</dd>
      </dl>
      <p>
        The results title (well calibrated, partly calibrated, recalibration advised) is based only on appropriate reliance:
        10 or more of 12, 7 to 9, or 6 or fewer. It is a label for the counts, not an assessment.
      </p>

      <h2>What this does not claim</h2>
      <ul>
        <li>The advice is not generated by a live AI model. It is pre-written.</li>
        <li>Confidence figures are not calibrated probabilities from a trained model.</li>
        <li>One 12-decision session is descriptive. It is not a psychological assessment and supports no population finding.</li>
        <li>No results from other players are collected, so none are reported.</li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>Small sample: each condition comparison rests on 6 decisions per side.</li>
        <li>Players are told some advice is wrong, which likely raises scepticism compared with real work.</li>
        <li>The rules are visible on screen by design, so careful readers can often solve a scenario without the advice.</li>
        <li>Difficulty ratings are the author’s judgement, not measured.</li>
        <li>Timing resets if the page is refreshed mid-scenario.</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        No personal data, analytics or server calls. The session lives in this tab’s session storage and disappears when the
        tab closes. Downloads are generated locally. Your current seed is <span className="mono">{seed}</span>.
      </p>

      <p className="actions-row">
        <a className="button" href={`#${backHref}`}>
          Back to the experiment
        </a>
      </p>
    </div>
  );
}
