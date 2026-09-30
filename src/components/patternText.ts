import type { ReliancePattern } from '../types/session';

export const PATTERN_LABEL: Record<ReliancePattern, string> = {
  'appropriate-accept': 'Accepted right advice',
  underreliance: 'Overruled right advice',
  overreliance: 'Accepted wrong advice',
  'correct-override': 'Overruled wrong advice',
  'override-other': 'Overruled wrong advice, chose another action',
};
