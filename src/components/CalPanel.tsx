import { useState } from 'react';
import type { Reaction } from '../types/session';
import { Sprite } from './Sprite';

type Props = {
  line?: string;
  note?: string;
  reaction?: Reaction;
  /** Optional torch standing beside Cal. Used sparingly: opening screen only. */
  accent?: 'torch';
};

/** Cal's corner: the sprite on a fixed stage, plus at most one line of dialogue. Remounts with each view. */
export function CalPanel({ line, note, reaction = 'idle', accent }: Props) {
  const [strikeFinished, setStrikeFinished] = useState(false);
  // The audit strike returns to idle when it ends; the collapse holds its last frame.
  const current: Reaction = reaction === 'attack' && strikeFinished ? 'idle' : reaction;

  return (
    <aside className="cal" aria-label="Cal, TrustLab's risk officer">
      <div className="cal-stage">
        {accent && <Sprite name={accent} className="stage-accent" />}
        <Sprite key={current} name={current} onAnimationEnd={current === 'attack' ? () => setStrikeFinished(true) : undefined} />
      </div>
      {line ? (
        <p className="bubble">
          <span className="bubble-name">Cal</span>
          <span className="visually-hidden">: </span>
          {line}
        </p>
      ) : note ? (
        <p className="cal-note">{note}</p>
      ) : null}
    </aside>
  );
}
