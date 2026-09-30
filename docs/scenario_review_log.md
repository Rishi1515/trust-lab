# Scenario review log

This log records the ambiguities found in the scenario bank and what was changed before the bank was frozen. Every scenario is fictional. The bank lives in `src/data/scenarios.ts`, and its version is `SCENARIO_BANK_VERSION`.

## Status

| Version | State | Date |
|---|---|---|
| 1.0.0 | Frozen for the first public build | 30 Sep 2026 |

**Outstanding:** a human read-through by Rishi before the portfolio link is shared. It should take about 20 minutes: play two runs with different seeds and check each feedback screen. Any wording change after this point bumps the version to 1.0.1 and adds an entry below.

## Review method

1. **Authoring pass.** One canonical record was written per scenario, with facts, three actions, the documented correct action, an outcome for each action, and two advice variants. The correct variant recommends the documented action. The incorrect variant recommends a plausible wrong action and records its `reasoningError`.
2. **Independent review pass.** A separate AI reviewer checked the scenarios against eleven rules. It was a Claude session with no part in writing them.
   - solvable from the screen alone
   - exactly one defensible action
   - plausible wrong advice with a traceable error
   - accurate correct advice
   - no tone or length tells between the two variants
   - no blunt answer leaks
   - consistent outcomes
   - arithmetic
   - neutral action labels
   - no specialist or culturally narrow knowledge
   - plain English

   The reviewer recommended edits but made none. All edits below were then applied.
3. **Automated checks.** `tests/scenarios.test.ts` and `src/experiment/validate.ts` check structure on every test run and at app startup:
   - exactly three unique actions
   - one valid correct action
   - the correct variant recommends the correct action, and the incorrect variant does not
   - a `reasoningError` on every incorrect variant
   - identical facts across variants

## Findings and changes (review pass 2)

### Must-fix

| Scenario | Finding | Change |
|---|---|---|
| EXP-02 | The label "Reject the claim as a duplicate" could be read as rejecting only the duplicate receipt, which leads to the same end state as the correct answer. | Relabelled "Reject the whole claim". |
| TXN-02 | The hold outcome said the hotel payment failed at check-out. That contradicted the facts: the hotel was already charged and the trip runs to 20 June. | The outcome now has the card declined at breakfast while the customer sleeps. |
| TXN-02 | The reasoning error relied on outside knowledge of flight times. | Added the fact "Singapore to Lisbon is about 17 hours with one connection". |
| TXN-02 | The Singapore purchase fell inside a "Portugal" notice window, which looked like a mismatch. | The notice now reads "Singapore to Portugal, departing 13 June". |
| SUP-01 | The correct explanation overstated: one late delivery ($6,000) does not erase a year of savings ($9,600). | Rewritten: B's $9,600 a year saving is less than the cost of two late deliveries. |
| SUP-01 | "The contract requires 95%" could be read as a future contract term rather than a test of the record. Percentages were not whole delivery counts. | The requirement is now "at least 95% on time over the last 12 months". Records are shown as "35 of 36" and "21 of 24". The B outcome was recomputed: 3 late deliveries a year cost about $18,000 against $9,600 saved. |

### Cross-bank issues

| Issue | Change |
|---|---|
| The correct action's position was unbalanced (1st in 5 of 12), and the investigative option was 3rd in 11 of 13. | Action display order is now shuffled per trial from the seed (`TrialPlan.actionOrder`), using a separate random stream so trial order is unaffected. A test confirms the documented action appears in every position across seeds. |
| A "short check time means investigate" cue: all three investigate-correct scenarios stated a short turnaround, and no other scenario did. | Short or moderate turnarounds were added where investigating is wrong: CUS-02 (the customer replies within a day), CYB-02 (an analyst can review within the hour) and CUS-01 (inspection takes 5 working days). |
| A "cautious answer wins" cue: the cautious or costly action was correct in 9 of 12. | EXP-01 was reworked so approval is correct (5 attendees, $82.40 each). The wrong advice misapplies the per-attendee limit to the whole bill. LOG-01 was reworked so waiting for the vessel is correct (port 25 Oct plus 4 days is 29 Oct, before the 1 Nov launch), under a rule allowing air freight only when sea would miss launch. The lenient or cheaper action is now correct in 5 of 12, and the wrong advice is the lax option in 6 of 12. |
| Explanation tells: correct explanations were longer and cited policy far more often. | Wrong explanations now cite and misapply the rule in EXP-01, EXP-02, SUP-02, TXN-01, TXN-02 and CYB-02. Explicit "policy says" phrasing was removed from several correct explanations. Word counts in each pair now differ by at most 4 words (checked by script; previously up to 15). |
| TXN-01 used a US-specific $10,000 cash reporting threshold, which advantages people with banking experience. | Replaced with a fictional internal threshold of $8,000 (deposits of $7,500 to $7,900). |

### Minor fixes

| Scenario | Change |
|---|---|
| WARM-00 | The "ask" outcome now refers to the claims record, not the receipt. |
| EXP-01 | The claimant is a sales representative, avoiding a self-approval question for a manager. |
| EXP-02 | The approve outcome is reworded: "reimbursed a fare the engineer never paid". |
| SUP-02 | The policy states a minimum of 2 references. Difficulty lowered from 3 to 2. |
| CUS-02 | Added "Missed renewals are not eligible for goodwill refunds" to close the "ask a manager" path. The correct label is shortened to "Decline the refund". Both explanations were rebalanced. The correct explanation no longer implies the sign-ins drive the policy. |
| CYB-01 | The time is now "03:10 in the user's time zone". The playbook is phrased so the player has to connect "forwards to an address outside the company" to the rule. |
| CYB-02 | Retitled "Early Tuesday scan". Removed the "responder load" fact, which pushed towards dismissing. The investigative option is now a one-hour analyst review. |
| LOG-02 | The driver's note says the load was held in the depot cold room, so the depot log is relevant. Removed "Hold and investigate an incomplete record" from the rule, so the player has to infer it. |

### Considered and not changed

- **Answer leakage through visible policy text / ceiling risk.** The brief requires every scenario to be solvable from the screen, so the governing rule stays visible. The rules were rephrased where possible so they need one inference step rather than naming the action. The remaining ceiling risk is listed in `docs/limitations.md`.
- **Near-duplicate structures.** TXN-02 and CYB-02 both clear a named pattern with a documented benign match. EXP-02, SUP-02 and LOG-02 all verify quickly before acting. These are kept because each exercises a different domain and a different piece of evidence. Domain balance in the assignment means a player sees both of a pair, but never adjacent.
- **Locale.** Amounts use a bare `$` with no country. Dates are written day-month and spelling is British. No scenario depends on a real jurisdiction's law.

## Difficulty after review

| Domain | Scenarios (difficulty) |
|---|---|
| Expense review | EXP-01 (2), EXP-02 (2) |
| Supplier selection | SUP-01 (2), SUP-02 (2) |
| Transaction monitoring | TXN-01 (2), TXN-02 (1) |
| Customer operations | CUS-01 (1), CUS-02 (1) |
| Cyber incident triage | CYB-01 (2), CYB-02 (2) |
| Logistics exception | LOG-01 (3), LOG-02 (3) |

Difficulty is the author's judgement, not measured from player data. Assignment keeps the correct-advice and incorrect-advice groups within 1 point of total difficulty.

## Documented correct actions (v1.0.0)

| Scenario | Correct action | Investigative? | Incorrect advice recommends |
|---|---|---|---|
| EXP-01 | approve | no | reject |
| EXP-02 | query | yes | reject |
| SUP-01 | supplier-a | no | supplier-b |
| SUP-02 | check | yes | contractor-d |
| TXN-01 | escalate | no | clear |
| TXN-02 | clear | no | block |
| CUS-01 | refund | no | inspect |
| CUS-02 | decline | no | refund |
| CYB-01 | escalate | no | monitor |
| CYB-02 | dismiss | no | escalate |
| LOG-01 | wait | no | air |
| LOG-02 | hold | yes | accept |
