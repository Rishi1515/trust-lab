import { selectCalLine } from '../content/calDialogue';
import { SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';

export function IntroView({ seed, onStart }: { seed: string; onStart: () => void }) {
  return (
    <div className="layout-with-cal">
      <div className="content">
        <p className="mono eyebrow">A decision game</p>
        <PageTitle className="title">TrustLab</PageTitle>
        <p className="lede">
          An AI gives you advice on {SCORED_TRIALS} quick work decisions. Some of its advice is wrong. Your job is to decide
          when to trust it and when not to. At the end you get a score.
        </p>

        <section className="panel" aria-labelledby="disclosure-heading">
          <h2 id="disclosure-heading">Good to know</h2>
          <ul className="plain-list">
            <li>
              <strong>The AI is pretend.</strong> All of its advice was written in advance. No real AI is running here.
            </li>
            <li>
              <strong>Some advice is wrong on purpose.</strong> Wrong advice can sound just as sure as right advice.
            </li>
            <li>
              <strong>Nothing leaves your browser.</strong> No sign-up and no tracking.
            </li>
          </ul>
          <p className="meta mono">About 10 minutes · 1 practice round + {SCORED_TRIALS} decisions · game code {seed}</p>
        </section>

        <div className="actions-row">
          <button type="button" className="button primary" onClick={onStart}>
            Start
          </button>
          <a className="text-link" href="#/why">
            Why I made this
          </a>
          <a className="text-link" href="#/method">
            How it works
          </a>
        </div>
      </div>
      <CalPanel line={selectCalLine('intro', [], seed).text} accent="torch" />
    </div>
  );
}
