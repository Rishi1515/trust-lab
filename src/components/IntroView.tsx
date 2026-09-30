import { selectCalLine } from '../content/calDialogue';
import { SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';

export function IntroView({ seed, onStart }: { seed: string; onStart: () => void }) {
  return (
    <div className="layout-with-cal">
      <div className="content">
        <p className="mono eyebrow">A decision experiment</p>
        <PageTitle className="title">TrustLab</PageTitle>
        <p className="lede">
          You review {SCORED_TRIALS} business decisions with advice from a simulated AI. Some of that advice is wrong. At the end
          you see how often you trusted it when you should have, and when you should not have.
        </p>

        <section className="panel" aria-labelledby="disclosure-heading">
          <h2 id="disclosure-heading">Before you start</h2>
          <ul className="plain-list">
            <li>
              <strong>The AI is simulated.</strong> Every recommendation, confidence figure and explanation was written in advance
              and comes from a fixed, versioned scenario bank. No language model runs here.
            </li>
            <li>
              <strong>Some advice is wrong on purpose.</strong> Wrong recommendations can sound just as sure, and be just as
              well argued, as right ones.
            </li>
            <li>
              <strong>Nothing leaves your browser.</strong> No sign-in, no tracking and no uploads. You can download your own
              results at the end.
            </li>
          </ul>
          <p className="meta mono">About 10 to 12 minutes · 1 practice round + {SCORED_TRIALS} scored decisions · run seed {seed}</p>
        </section>

        <div className="actions-row">
          <button type="button" className="button primary" onClick={onStart}>
            Start
          </button>
          <a className="text-link" href="#/method">
            Read the method first
          </a>
        </div>
      </div>
      <CalPanel line={selectCalLine('intro', [], seed).text} accent="torch" />
    </div>
  );
}
