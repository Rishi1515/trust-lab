import { SCORED_TRIALS } from '../experiment/assignment';

/** Progress as text, with a segmented bar that repeats it visually. */
export function Progress({ trial }: { trial: number | 'warmup' }) {
  if (trial === 'warmup') return <p className="mono progress-text">Practice round · not scored</p>;
  return (
    <div className="progress">
      <p className="mono progress-text">
        Scenario {trial} of {SCORED_TRIALS}
      </p>
      <span className="progress-bar" aria-hidden="true">
        {Array.from({ length: SCORED_TRIALS }, (_, i) => (
          <span key={i} className={i < trial - 1 ? 'done' : i === trial - 1 ? 'current' : ''} />
        ))}
      </span>
    </div>
  );
}
