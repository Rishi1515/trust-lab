import { SCENARIO_BANK_VERSION } from '../app/version';
import { METRIC_TEXT } from '../content/metrics';
import { PageTitle } from './PageTitle';

export function MethodView({ backHref, seed }: { backHref: string; seed: string }) {
  return (
    <div className="content prose">
      <p className="mono eyebrow">How it works</p>
      <PageTitle>How TrustLab works</PageTitle>
      <p className="note">Haven't played yet? This page gives away how often the AI is wrong. You might want to play first.</p>

      <h2>In short</h2>
      <p>
        Companies use AI tools that recommend decisions. The risk is that people stop checking and just follow the advice, even
        when it is wrong. TrustLab measures that. You make 12 small work decisions with advice from a pretend AI. It is right
        exactly 6 times and wrong 6 times, and the game tracks when you follow it and when you don't. The ideas come from
        research on how people trust automated advice; the papers are listed on the Credits page.
      </p>

      <h2>What changes from case to case</h2>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="What changes between cases">
        <table>
          <thead>
            <tr>
              <th scope="col">What</th>
              <th scope="col">Options</th>
              <th scope="col">Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Is the AI right?</th>
              <td>Right or wrong</td>
              <td>To see whether you follow good advice and catch bad advice.</td>
            </tr>
            <tr>
              <th scope="row">How sure it says it is</th>
              <td>95% or 65%</td>
              <td>To see whether a bigger number makes you agree more.</td>
            </tr>
            <tr>
              <th scope="row">Does it explain itself?</th>
              <td>Explanation shown or not</td>
              <td>To see whether an explanation makes you agree more, even when the advice is wrong.</td>
            </tr>
            <tr>
              <th scope="row">Type of decision</th>
              <td>Six kinds, two cases each</td>
              <td>So the result isn't about one kind of problem.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>How it's kept fair</h2>
      <p>Every game is built from a short game code, and every game has the same balance:</p>
      <ul>
        <li>6 right and 6 wrong pieces of advice.</li>
        <li>Within each of those: 3 at 95% and 3 at 65%, and 3 with an explanation and 3 without.</li>
        <li>Each type of decision gets one right and one wrong piece of advice.</li>
        <li>Each half of the game has 3 right and 3 wrong pieces of advice.</li>
        <li>Two cases of the same type never come back to back.</li>
        <li>The order of the three options is shuffled, so the answer is never always in the same spot.</li>
      </ul>
      <p>The same game code always gives exactly the same game. The 80% figure only appears in the practice round.</p>

      <h2>The cases</h2>
      <p>
        All 12 cases are made up and can be solved from the facts on screen. Each one has a correct answer stored separately from
        the AI's advice, and two versions of the advice written from the same facts: one right, and one wrong with a single,
        findable mistake in its reasoning. The facts never change between versions. The cases were checked in a separate review
        before release and are frozen at version {SCENARIO_BANK_VERSION}.
      </p>

      <h2>What the scores mean</h2>
      <dl className="definitions">
        <dt>Trust score / Trusted at the right times</dt>
        <dd>{METRIC_TEXT.appropriate} This is the number in the circle, out of 12.</dd>
        <dt>Best choice picked</dt>
        <dd>{METRIC_TEXT.accuracy}</dd>
        <dt>Trusted bad advice</dt>
        <dd>{METRIC_TEXT.overreliance} Researchers call this overreliance.</dd>
        <dt>Ignored good advice</dt>
        <dd>{METRIC_TEXT.underreliance} Researchers call this underreliance. Choosing to check first counts here too.</dd>
        <dt>Chose to check first</dt>
        <dd>{METRIC_TEXT.investigation}</dd>
        <dt>Could you tell good advice from bad?</dt>
        <dd>{METRIC_TEXT.discrimination}</dd>
        <dt>Did "95% sure" sway you?</dt>
        <dd>{METRIC_TEXT.confidence}</dd>
        <dt>Did its explanations sway you?</dt>
        <dd>{METRIC_TEXT.explanation}</dd>
        <dt>Time per decision</dt>
        <dd>{METRIC_TEXT.time}</dd>
      </dl>
      <p>
        The title comes only from the trust score: 10 to 12 is "Well calibrated", 7 to 9 is "Partly calibrated", 6 or fewer is
        "Needs recalibration". Calibrated means your trust matched how good the advice really was.
      </p>

      <h2>What this game doesn't claim</h2>
      <ul>
        <li>No real AI writes the advice. It was written in advance.</li>
        <li>The "% sure" numbers are not real measurements.</li>
        <li>One game of 12 decisions says little about a person. It is not a test of you.</li>
        <li>No one else's results are collected, so none are shown.</li>
      </ul>

      <h2>Limits</h2>
      <ul>
        <li>Each comparison rests on only 6 decisions per side.</li>
        <li>Players know some advice is wrong, so they are probably more careful than at work.</li>
        <li>The rules are on screen, so careful readers can often solve a case without the AI.</li>
        <li>How hard each case is was judged by the author, not measured.</li>
        <li>The timer restarts if you refresh the page in the middle of a case.</li>
      </ul>

      <h2>Privacy</h2>
      <p>
        No personal details, no tracking and nothing sent to a server. Your game lives in this browser tab and disappears when
        you close it. Downloads are made in your browser. Your game code is <span className="mono">{seed}</span>.
      </p>

      <p className="actions-row">
        <a className="button" href={`#${backHref}`}>
          Back to the game
        </a>
      </p>
    </div>
  );
}
