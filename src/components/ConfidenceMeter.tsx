import type { Confidence } from '../types/scenario';

/** The AI's claimed confidence as plain words plus a number; the bar repeats it and is hidden from screen readers. */
export function ConfidenceMeter({ value }: { value: Confidence }) {
  const percent = Math.round(value * 100);
  return (
    <div className="confidence">
      <span className="mono label">AI says it is</span>
      <span className="mono confidence-value">{percent}% sure</span>
      <span className="confidence-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}
