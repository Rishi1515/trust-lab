import { selectCalLine } from '../content/calDialogue';
import { MIDPOINT_AFTER, SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';
import { Sprite } from './Sprite';

/** Progress only. No scores here, because seeing them could change how the second half is played. */
export function MidpointView({ seed, history, onContinue }: { seed: string; history: string[]; onContinue: () => void }) {
  return (
    <div className="layout-with-cal">
      <div className="content midpoint">
        <Sprite name="torch2" className="torch-mark-large" />
        <p className="mono eyebrow">Halfway</p>
        <PageTitle>
          {MIDPOINT_AFTER} of {SCORED_TRIALS} done
        </PageTitle>
        <p className="lede">Your score stays hidden until the end, so it can't change how you play the rest.</p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onContinue}>
            Keep going
          </button>
        </div>
      </div>
      <CalPanel line={selectCalLine('midpoint', history, seed).text} />
    </div>
  );
}
