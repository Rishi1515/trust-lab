import type { ReliancePattern } from '../types/session';

export const PATTERN_LABEL: Record<ReliancePattern, string> = {
  'appropriate-accept': 'Trusted good advice',
  underreliance: 'Ignored good advice',
  overreliance: 'Trusted bad advice',
  'correct-override': 'Caught bad advice',
  'override-other': 'Caught bad advice, but picked another wrong option',
};
