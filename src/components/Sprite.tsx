import type { AnimationEventHandler } from 'react';

export type SpriteName = 'idle' | 'attack' | 'die' | 'skull' | 'torch' | 'torch2';

type Props = {
  name: SpriteName;
  className?: string;
  /** Provide only for static character art that carries meaning; otherwise the sprite is decorative. */
  label?: string;
  onAnimationEnd?: AnimationEventHandler<HTMLSpanElement>;
};

export function Sprite({ name, className = '', label, onAnimationEnd }: Props) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return <span className={`sprite sprite--${name} ${className}`.trim()} onAnimationEnd={onAnimationEnd} {...a11y} />;
}
