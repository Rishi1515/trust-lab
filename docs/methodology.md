# Methodology

TrustLab is a short, controlled decision task. A player reviews 12 fictional business scenarios. For each one, they read the evidence and then reveal a recommendation from a simulated AI. Finally they choose one of three actions. The design separates three things that are usually tangled together in real AI tools: whether the advice is right, how confident it says it is, and whether it explains itself.

This document describes the design as built. It makes no claims about results, because the site collects none.

## Question

Do people accept advice when it is right and reject it when it is wrong? Does a confidence figure or a written rationale change how often they accept it, independently of whether it is correct?

## Procedure

1. **Opening.** Discloses that the advice is simulated, that some of it is wrong, and that nothing leaves the browser.
2. **Briefing.** Explains the three-step decision, what the confidence figure is (the system's own claim, not a calibrated probability), privacy and duration.
3. **Practice round (unscored).**
   - Uses scenario `WARM-00`, with correct advice at 80% confidence and reasoning shown.
   - Teaches the format and the feedback screen.
   - Excluded from every metric and every export.
4. **Twelve scored scenarios.**
   - The evidence is shown first. The player clicks to reveal the AI recommendation, its stated confidence and, in half the trials, its reasoning.
   - The player picks one of three actions and submits.
   - Cal, the character, says nothing on this screen.
5. **Feedback after each decision.** Shows the documented correct action, what the chosen action led to, whether the AI was right, and a one-sentence takeaway. When the advice was wrong it also shows where its reasoning failed, including the withheld reasoning if it was not shown. Cal adds one line.
6. **Midpoint after trial 6.** Progress only, no metrics.
7. **Results.** Shows:
   - counts and rates for every metric, with plain-language definitions
   - the condition comparisons
   - a scenario-by-scenario review
   - limitations, placed beside the numbers
   - a debrief on automation bias, calibration and explanations
   - JSON and CSV export
   - replay with the same or a new seed

## Manipulations

| Variable | Levels | Purpose |
|---|---|---|
| AI correctness | right, wrong | Separates appropriate reliance from overreliance and underreliance |
| Stated confidence | 0.95 (high), 0.65 (moderate) | Tests whether a bigger number draws more agreement |
| Explanation | reasoning shown, withheld | Tests whether reasoning increases trust regardless of correctness |
| Domain | 6 business domains × 2 scenarios | Reduces dependence on one kind of decision |

The type allows `0.80` as a third confidence value. It is used only in the practice round, so scored comparisons are strictly high against moderate.

## Balanced, seeded assignment

`src/experiment/assignment.ts` builds the full run from a seed string. The same seed and scenario bank always give the same plan. The code uses xmur3 hashing, a mulberry32 PRNG and a Fisher-Yates shuffle.

Assignment follows these rules, all tested over 400 seeds in `tests/assignment.test.ts`:

1. **Correctness split.**
   - Each domain contributes one correct-advice and one incorrect-advice scenario.
   - Among the 64 possible domain splits, only those where the two groups' total difficulty differs by at most 1 are allowed.
   - The seed picks one of them.
2. **Condition cells.**
   - Six trials per group cannot fill a 2 × 2 confidence × explanation grid evenly, so the two groups get complementary patterns: (HR, HR, HN, MR, MN, MN) and (HR, HN, HN, MR, MR, MN). The seed decides which group gets which.
   - Result within each correctness group: 3 high, 3 moderate, 3 with reasoning and 3 without.
   - Result across the run: each confidence × explanation cell appears exactly 3 times.
3. **Order.** The trial order is reshuffled until all of these hold:
   - each half of the run has 3 correct-advice trials
   - no two adjacent scenarios share a domain
   - no more than 3 consecutive trials share AI correctness
4. **Option order.** The three actions in each scenario are shuffled per trial from a separate seeded stream. Position therefore cannot cue the answer, and changing this never alters the trial order.

The seed appears on the opening screen, in the briefing, on the method page, in the results and in every export. A link of the form `#/?seed=abc123` replays a seed.

## Scenario construction

Each scenario is one canonical `ScenarioRecord` in `src/data/scenarios.ts`. A record holds:

- the facts, including the governing rule
- three actions, each with the outcome it leads to
- the documented correct action (`correctActionId`)
- two advice variants written from the same facts:
  - the **correct** variant recommends the documented action
  - the **incorrect** variant recommends a plausible wrong action, and its reasoning contains one traceable error recorded in `reasoningError`

The presented `Scenario` type (the brief's section 5.4 shape) is derived from the record plus the trial's conditions. Ground truth is never inferred from recommendation text. `aiIsCorrect` is computed as `aiRecommendationActionId === correctActionId`, and a test checks it against the assigned condition.

Integrity checks run at app startup (`validateBank`) and in tests:

- three unique actions
- one valid correct action
- correct and incorrect variants that behave as intended
- a documented reasoning error
- identical facts across variants

The bank was reviewed by a second reader before being frozen. `docs/scenario_review_log.md` lists every finding and change. Every scenario is fictional. None depends on a real jurisdiction's law or on specialist knowledge.

## Measures

All measures are computed in the browser from recorded decisions (`src/experiment/scoring.ts`). A trial counts as **accepted** when the chosen action equals the AI's recommendation.

| Measure | Definition | Denominator |
|---|---|---|
| Decision accuracy | chosen action = documented action | all trials |
| Appropriate reliance | accepted right advice, or rejected wrong advice | all trials |
| Overreliance | accepted wrong advice | wrong-advice trials |
| Underreliance | rejected right advice (including investigating) | right-advice trials |
| Investigation rate | chose the scenario's evidence-gathering option | all trials |
| Confidence susceptibility | acceptance at 95% minus acceptance at 65%, in percentage points | 6 per side |
| Explanation effect | acceptance with reasoning minus without, in percentage points | 6 per side |
| Right-versus-wrong gap | acceptance of right advice minus acceptance of wrong advice | 6 per side |
| Decision time | milliseconds from scenario shown to decision, split into evidence and decision phases | descriptive only |

Notes on the definitions:

- "Appropriate reliance" follows the brief literally. Rejecting wrong advice counts even when the player then picks another action that is also not the documented one. Those cases are reported separately (`override-other`).
- Underreliance includes investigating when the advice was right, because every scenario is solvable from the facts on screen. The results show how many underreliance cases were investigations.
- Investigating is the documented action in 3 of 12 scenarios, so the investigation rate is shown with how many investigations were correct.
- When a denominator is zero, the rate is `null` and the UI shows "n/a" rather than 0% or NaN. This is tested.

**Results title.** The playful label is set only by appropriate reliance: 10 or more of 12 is "Well calibrated", 7 to 9 is "Partly calibrated", 6 or fewer is "Recalibration advised". The counts behind it are always shown next to it.

## Cal's role

Cal speaks only on the opening, briefing, practice feedback, feedback after each scored decision, midpoint and results screens. He never speaks while a scored decision is open. This is deliberate. A line such as "The model is 95% confident. Confidence remains free." would itself be a manipulation if it appeared only with high-confidence advice, and would confound the confidence condition. That line is used after the practice round instead, where every player sees it.

**Dialogue.** Lines are chosen deterministically (`src/content/calDialogue.ts`). Selection takes the highest-priority line for the trigger that is not cooling down, with ties broken by the seed.

**Sprite reactions** are rare and rule-based:

- The audit strike plays when the player overrules 95% advice and lands on the documented action. At most twice per run.
- The collapse plays when the player accepts 95% advice that is wrong. At most once per run.

## Reproducibility

- Same seed + same scenario bank version + same code gives the same run.
- Exports record `seed`, `scenario_bank_version`, `app_version` and `build_sha`.
- `npm run verify` runs the type check, lint, tests, production build and a check that the build uses the Pages base path.

## What this does not claim

- The advice is not generated by a live model.
- Confidence values are not calibrated probabilities.
- A single 12-decision session is descriptive. It is not a psychological assessment and supports no population finding.
- No data from other players is collected, so none is reported.

See `docs/limitations.md` for the full list of limitations.
