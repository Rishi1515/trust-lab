import type { Confidence } from '../types/scenario';

const LABELS: Record<Confidence, string> = { 0.95: 'high', 0.8: 'medium', 0.65: 'moderate' };

/** Confidence as a number plus a plain label. The bar repeats the number and is hidden from screen readers. */
export function ConfidenceMeter({ value }: { value: Confidence }) {
  const percent = Math.round(value * 100);
  return (
    <div className="confidence">
      <span className="mono label">Stated confidence</span>
      <span className="mono confidence-value">
        {percent}% <span className="confidence-word">({LABELS[value]})</span>
      </span>
      <span className="confidence-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}
