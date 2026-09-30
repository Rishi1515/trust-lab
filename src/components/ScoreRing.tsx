import type { CSSProperties } from 'react';

type Props = { score: number; total: number; band: 'strong' | 'middle' | 'low' };

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The trust score as a ring that fills once when the results appear (skipped for visitors
 * whose system asks for reduced motion). The number itself is plain text, not a counter.
 */
export function ScoreRing({ score, total, band }: Props) {
  const fraction = total === 0 ? 0 : score / total;
  const offset = CIRCUMFERENCE * (1 - fraction);
  return (
    <figure className={`score-ring band-${band}`} role="img" aria-label={`Trust score: ${score} out of ${total}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r={RADIUS} />
        {score > 0 && (
          <circle
            className="ring-fill"
            cx="60"
            cy="60"
            r={RADIUS}
            transform="rotate(-90 60 60)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ '--full': CIRCUMFERENCE } as CSSProperties}
          />
        )}
      </svg>
      <span className="ring-center" aria-hidden="true">
        <span className="ring-score">{score}</span>
        <span className="ring-total">/ {total}</span>
      </span>
      <figcaption className="ring-caption mono" aria-hidden="true">
        Trust score
      </figcaption>
    </figure>
  );
}
