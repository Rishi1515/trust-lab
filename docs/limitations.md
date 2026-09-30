# Limitations

TrustLab is a controlled demonstration, not a validated instrument. These limitations are also shown on the results screen and the method page.

## Measurement

- **Small numbers.** Each condition comparison rests on 6 decisions per side, so one different choice moves a rate by about 17 percentage points. Differences within a single run are descriptive, not evidence of an effect.
- **No reliability or validity testing.** The metrics have not been tested for test-retest reliability or checked against any external measure of judgement.
- **Session length is an estimate.** The "10 to 12 minutes" figure has not been timed with real players.
- **Timing is rough.** Decision time is measured in the browser with `performance.now()`. It restarts if the page is refreshed mid-scenario, and it reflects reading speed as much as deliberation. It is reported as descriptive only.
- **Literal definitions.**
  - "Appropriate reliance" counts rejecting wrong advice even when the replacement choice is also wrong. These cases are shown separately.
  - "Underreliance" counts investigating when the advice was right. This is defensible because every scenario can be solved on screen, but investigating is a cautious act, not a dismissive one.

## Design

- **Artificial base rate.** The AI is right exactly half the time at both confidence levels. Real systems are usually right more often, and their confidence usually carries some information. Behaviour here may not transfer.
- **Disclosure raises scepticism.** Players are told some advice is wrong, which almost certainly makes them more sceptical than they would be at work. The method page discloses the full design, and a player who reads it before playing knows the base rate.
- **Visible rules and a possible ceiling.** Every scenario is solvable from the screen by design, so a careful reader can often decide without the advice. This compresses the reliance measures towards the top.
- **Difficulty is judged, not measured.** Difficulty ratings (1 to 3) are the author's judgement. Assignment keeps the right-advice and wrong-advice groups within one point of total difficulty, but individual scenarios still differ.
- **Three-way cells are unbalanced.** Every two-way combination of correctness, confidence and explanation is balanced. The full three-way combination cannot be with 12 trials: four cells get 2 trials and four get 1.
- **One scenario bank.** All players see the same 12 scenarios, in different orders and conditions. Effects could be specific to these scenarios.
- **Repeat play.** A second run is contaminated by knowledge of the scenarios and the design. The site allows replay for exploration, but a second run is not an independent observation.

## Content

- **Written by one author, reviewed by one reader.** The scenario review is recorded in `docs/scenario_review_log.md`. A human read-through by Rishi is still listed as outstanding.
- **Simplified business rules.** Policies, thresholds and procedures are simplified and fictional. They are not guidance on how any real organisation handles expenses, fraud monitoring, security incidents or logistics.
- **English only.** British spelling, day-month dates and an unqualified `$`.

## Scope

- No data from other players is collected, so the site cannot report aggregate or population-level findings.
- There is no consent flow or ethics approval, because no data leaves the browser. Collecting data from other people would need both.
