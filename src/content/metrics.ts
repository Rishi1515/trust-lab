/** Plain-language explanations shared by the results screen and the "How it works" page. */
export const METRIC_TEXT = {
  appropriate: 'You followed the AI when it was right, or went against it when it was wrong.',
  accuracy: 'You picked the best option.',
  overreliance: 'You followed the AI when it was wrong.',
  underreliance: 'You went against the AI when it was right.',
  investigation: 'You picked the "check first" option. Sometimes that is smart, sometimes it just wastes time.',
  discrimination: 'How much more often you followed good advice than bad advice. Bigger is better.',
  confidence: 'How much more often you agreed when the AI said "95% sure" than when it said "65% sure". Near zero means the number did not sway you.',
  explanation: 'How much more often you agreed when the AI explained itself than when it did not. Near zero means explanations did not sway you.',
  time: 'Just for interest. Faster is not better.',
} as const;
