import { selectCalLine } from '../content/calDialogue';
import { SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';

export function BriefingView({ seed, onStartWarmup }: { seed: string; onStartWarmup: () => void }) {
  return (
    <div className="layout-with-cal">
      <div className="content">
        <p className="mono eyebrow">Briefing</p>
        <PageTitle>How each decision works</PageTitle>
        <ol className="steps">
          <li>
            <strong>Read the evidence.</strong> Each scenario shows the facts and the rule that applies. Everything you need is on
            screen; no specialist knowledge is required.
          </li>
          <li>
            <strong>Reveal the AI recommendation.</strong> You will see the action it recommends and a stated confidence. In
            some scenarios it also explains its reasoning.
          </li>
          <li>
            <strong>Decide.</strong> Accept the recommendation, choose a different action, or choose the option that gathers
            more evidence first. Each scenario has three options.
          </li>
          <li>
            <strong>See what happened.</strong> After each decision you see the documented correct action and what your choice
            led to.
          </li>
        </ol>

        <section className="panel" aria-labelledby="confidence-heading">
          <h2 id="confidence-heading">About the confidence figures</h2>
          <p>
            The percentage is the simulated system’s claim about itself. It is part of the experiment and is not a calibrated
            probability from a trained model. Deciding how much it deserves is part of the task.
          </p>
        </section>

        <section className="panel" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Privacy</h2>
          <p>
            TrustLab collects no name, email or demographic information and asks for no free text. Your decisions are kept in
            this browser tab only and are cleared when the tab closes. Nothing is sent to a server. You can download your
            results as JSON or CSV at the end.
          </p>
        </section>

        <p className="meta mono">
          Practice round first (not scored), then {SCORED_TRIALS} scored scenarios · estimated 10 to 12 minutes · seed {seed}
        </p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onStartWarmup}>
            Start the practice round
          </button>
        </div>
      </div>
      <CalPanel line={selectCalLine('briefing', [], seed).text} />
    </div>
  );
}
