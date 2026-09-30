import { selectCalLine } from '../content/calDialogue';
import { MIDPOINT_AFTER, SCORED_TRIALS } from '../experiment/assignment';
import { CalPanel } from './CalPanel';
import { PageTitle } from './PageTitle';
import { Sprite } from './Sprite';

/** Progress only. No scores here, because seeing them could change behaviour in the second half. */
export function MidpointView({ seed, history, onContinue }: { seed: string; history: string[]; onContinue: () => void }) {
  return (
    <div className="layout-with-cal">
      <div className="content midpoint">
        <Sprite name="torch2" className="torch-mark-large" />
        <p className="mono eyebrow">Midpoint</p>
        <PageTitle>
          {MIDPOINT_AFTER} of {SCORED_TRIALS} decisions done
        </PageTitle>
        <p className="lede">Scores stay hidden until the end, so they cannot shape the second half.</p>
        <div className="actions-row">
          <button type="button" className="button primary" onClick={onContinue}>
            Continue to scenario {MIDPOINT_AFTER + 1}
          </button>
        </div>
      </div>
      <CalPanel line={selectCalLine('midpoint', history, seed).text} />
    </div>
  );
}
