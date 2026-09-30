import { selectCalLine } from '../content/calDialogue';
import { SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';

type Props = { seed: string; returning: boolean; onStartWarmup: () => void };

export function BriefingView({ seed, returning, onStartWarmup }: Props) {
  return (
    <div className="layout-with-cal">
      <div className="content">
        <p className="mono eyebrow">Before you start</p>
        <PageTitle>How to play</PageTitle>
        <ol className="steps">
          <li>
            <strong>Read the facts.</strong> Each case tells you what happened and the company rule. Everything you need is on
            the screen.
          </li>
          <li>
            <strong>Ask the AI.</strong> Click to see what it recommends and how sure it says it is.
          </li>
          <li>
            <strong>Decide.</strong> Follow the AI, pick something else, or choose to check first.
          </li>
          <li>
            <strong>See the answer.</strong> You find out the best choice and what happened.
          </li>
        </ol>

        <section className="panel" aria-labelledby="confidence-heading">
          <h2 id="confidence-heading">About the AI's "% sure"</h2>
          <p>
            The AI tells you how confident it is, like "95% sure". That number is part of the game, not a real measurement.
            Don't take it on faith.
          </p>
        </section>

        <section className="panel" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Your privacy</h2>
          <p>
            No name, email or personal details. Your answers stay in this browser tab and disappear when you close it.
          </p>
        </section>

        <p className="meta mono">
          1 practice round (doesn't count), then {SCORED_TRIALS} decisions · game code {seed}
        </p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onStartWarmup}>
            Start the practice round
          </button>
        </div>
      </div>
      <CalPanel line={selectCalLine(returning ? 'briefing-returning' : 'briefing', [], seed).text} />
    </div>
  );
}
