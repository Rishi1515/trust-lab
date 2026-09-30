# Data dictionary

TrustLab stores one session in the browser's `sessionStorage` while you play. Nothing is sent anywhere. The results screen can export the session as JSON or CSV; both are produced in the browser by `src/experiment/export.ts`.

No export contains a name, email, device detail, location, IP address or wall-clock timestamp.

## Per-trial fields (CSV columns, JSON `trials[]` keys)

One row per scored scenario, in the order played. The warm-up is not exported.

| Field | Type | Meaning |
|---|---|---|
| `seed` | string | Seed that generated the run's scenario order and conditions. Replaying the seed reproduces them. |
| `scenario_bank_version` | string | Version of `src/data/scenarios.ts` used for the run. |
| `app_version` | string | `version` from `package.json` at build time. |
| `build_sha` | string | Short git commit of the build (`local` if built outside git). |
| `trial` | integer 1-12 | Position of the scenario in the run. |
| `scenario_id` | string | Stable scenario id, for example `EXP-01`. |
| `domain` | string | One of `expense-review`, `supplier-selection`, `transaction-monitoring`, `customer-operations`, `cyber-triage`, `logistics-exception`. |
| `difficulty` | integer 1-3 | Author-assigned difficulty. Not calibrated against player data. |
| `ai_is_correct` | boolean | Whether the simulated AI recommended the documented correct action on this trial. |
| `confidence` | number | Displayed confidence: `0.95` (high) or `0.65` (moderate). `0.8` appears only in the unscored warm-up. |
| `explanation_mode` | string | `rationale` if the AI's reasoning was shown, `none` if withheld. |
| `ai_recommendation` | string | Action id the AI recommended. |
| `correct_action` | string | Documented correct action id. |
| `chosen_action` | string | Action id the player submitted. |
| `accepted` | boolean | `chosen_action` equals `ai_recommendation`. |
| `correct` | boolean | `chosen_action` equals `correct_action`. |
| `investigated` | boolean | The chosen action is the scenario's investigative option (investigate, query, hold, monitor, trial). |
| `pattern` | string | Reliance pattern, defined below. |
| `evidence_ms` | integer | Milliseconds from the scenario appearing to the player revealing the AI advice. Descriptive only. |
| `decision_ms` | integer | Milliseconds from the advice being revealed to the decision being submitted. Descriptive only. Resets if the page is refreshed mid-scenario. |

### `pattern` values

| Value | AI advice | Player did |
|---|---|---|
| `appropriate-accept` | correct | accepted it |
| `underreliance` | correct | chose something else (including investigating) |
| `overreliance` | incorrect | accepted it |
| `correct-override` | incorrect | rejected it and chose the documented action |
| `override-other` | incorrect | rejected it but chose another action that is not the documented one |

## JSON-only fields

| Field | Meaning |
|---|---|
| `export_schema_version` | Version of this export format (`1`). |
| `app` | Always `TrustLab`. |
| `note` | States that the advice is simulated and no personal identifiers are collected. |
| `summary.trials` | Number of scored trials answered. |
| `summary.correct_decisions` | Trials where `correct` is true. |
| `summary.appropriate_reliance` | `appropriate-accept` + `correct-override` + `override-other`. |
| `summary.accepted_correct_advice` | Count of `appropriate-accept`. |
| `summary.rejected_incorrect_advice` | Count of `correct-override` + `override-other`. |
| `summary.rejected_incorrect_but_chose_other` | Count of `override-other`. |
| `summary.overreliance` | Count of `overreliance`. |
| `summary.incorrect_advice_trials` | Trials where `ai_is_correct` is false. |
| `summary.underreliance` | Count of `underreliance`. |
| `summary.underreliance_via_investigation` | Underreliance trials where the player chose the investigative option. |
| `summary.correct_advice_trials` | Trials where `ai_is_correct` is true. |
| `summary.investigations` | Trials where `investigated` is true. |
| `summary.investigations_documented_correct` | Investigations where investigating was the documented action. |
| `summary.confidence_susceptibility_pts` | Acceptance rate at 95% minus acceptance rate at 65%, in percentage points. `null` if either group is empty. |
| `summary.explanation_effect_pts` | Acceptance rate with rationale minus without, in percentage points. `null` if either group is empty. |
| `summary.discrimination_pts` | Acceptance rate of correct advice minus acceptance rate of incorrect advice, in percentage points. |
| `summary.median_trial_ms` | Median of `evidence_ms + decision_ms` across trials. |

## Session storage (not exported)

`sessionStorage["trustlab.session.v1"]` holds the seed, the run plan, recorded decisions, the current step and the ids of Cal lines already shown. It is cleared when the tab closes or a new run starts.

`localStorage["trustlab.motion"]` holds only the player's explicit animation preference (`on` or `off`).
