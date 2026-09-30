import { describe, expect, it } from 'vitest';
import { cueForBand, cueForDecision, playCue } from '../src/app/sound';

describe('Cal sounds', () => {
  it('sounds happy on the best choice, meh on a half-right call, grumpy otherwise', () => {
    expect(cueForDecision(true, 'appropriate-accept')).toBe('happy');
    expect(cueForDecision(true, 'correct-override')).toBe('happy');
    expect(cueForDecision(false, 'override-other')).toBe('meh');
    expect(cueForDecision(false, 'overreliance')).toBe('grumpy');
    expect(cueForDecision(false, 'underreliance')).toBe('grumpy');
  });

  it('matches the results sound to the score band', () => {
    expect(cueForBand('strong')).toBe('happy');
    expect(cueForBand('middle')).toBe('meh');
    expect(cueForBand('low')).toBe('grumpy');
  });

  it('stays silent and never throws where Web Audio is missing', () => {
    expect(() => playCue('happy')).not.toThrow();
  });
});
