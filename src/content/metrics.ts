/** Plain-language metric definitions shared by the results screen and the method page. */
export const METRIC_TEXT = {
  accuracy: 'Scenarios where you chose the documented correct action.',
  appropriate: 'You accepted advice that was right, or rejected advice that was wrong.',
  overreliance: 'You accepted a recommendation that was wrong.',
  underreliance:
    'You rejected a recommendation that was right. Every scenario can be solved from the facts shown, so the right action was supported on screen.',
  investigation:
    'You chose the option that gathers more evidence. Reported on its own, because investigating is sometimes right and sometimes an unnecessary delay.',
  confidence:
    'Your acceptance rate for advice shown at 95% confidence minus your rate at 65%. Positive means the bigger number drew more agreement.',
  explanation: 'Your acceptance rate when the AI’s reasoning was shown minus your rate when it was withheld.',
  discrimination:
    'Your acceptance rate for right advice minus your rate for wrong advice. The larger this gap, the better your trust tracked the advice’s quality.',
  time: 'Time from the scenario appearing to your decision. Descriptive only: faster is not better.',
} as const;
