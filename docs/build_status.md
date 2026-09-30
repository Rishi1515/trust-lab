# Build status

This file is the record of where the build stands, so a later session does not need the full conversation. Source brief: *TrustLab Claude Implementation Brief* (docx, supplied by Rishi).

## Current phase

Phases 1 to 7 are complete. Phase 8 (deployment) is ready. The GitHub Actions workflow is written and verified locally, but the repository has not been pushed to GitHub yet, so the live URL is not up.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` (http://localhost:5173/trust-lab/) |
| Unit and component tests | `npm test` |
| Type check (app + tests) | `npm run typecheck` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Check build uses the Pages base path | `npm run check:build` |
| Everything, as CI runs it | `npm run verify` |

Last local result: 476 tests passed; type check, lint, build and base-path check all clean.

## Completed requirements

### Phase 1: Foundation
- Vite + React + TypeScript, with Vitest and React Testing Library.
- Typed schema: `src/types/scenario.ts` and `src/types/session.ts`.

### Phase 2: Experiment
- Seeded RNG (`src/experiment/rng.ts`).
- Balanced assignment, including shuffled option order (`src/experiment/assignment.ts`).
- Scoring (`src/experiment/scoring.ts`).
- JSON and CSV export (`src/experiment/export.ts`).
- Startup validator (`src/experiment/validate.ts`).

### Phase 3: Content
- Practice round plus 12 scenarios with correct and incorrect advice variants.
- Independent review, logged in `docs/scenario_review_log.md`. Bank frozen at 1.0.0.
- `src/content/calDialogue.ts`: each line has a trigger, priority and cooldown; reaction rules are included.

### Phase 4: Core flow
- Screens: opening, briefing, practice, scenario, feedback, midpoint, results, method and credits.
- Hash routing with a route guard, and `sessionStorage` recovery.
- A complete run works by keyboard alone (tested).

### Phase 5: Character
- Cal's idle, audit strike and collapse animations on a stage with aligned baselines.
- Risk skull marker, torch accents and dialogue bubbles.
- Reduced motion (system setting) shows fixed frames. The on/off switches were removed at Rishi's request.

### Phase 6: Polish
- Responsive at 390 px and 1280 px with no horizontal overflow. This was checked during the build session with a Playwright script that is not part of the repository.
- WCAG AA text contrast, with tints added for teal and warning text.
- Visible focus, and correct and incorrect outcomes never shown by colour alone.

### Phase 7: Evidence
- Documents:
  - `README.md`
  - `docs/methodology.md`
  - `docs/limitations.md`
  - `docs/data_dictionary.md`
  - `docs/credits.md`
  - `docs/demo_script.md`
  - `LICENSE`
- Screenshots in `docs/screenshots/`.
- An 80-second silent demo recording (seed `demo32`), delivered to Rishi separately and not committed to keep the repository small.

### Phase 8: Deployment
- `.github/workflows/deploy.yml` runs `npm run verify` and deploys `dist/` to Pages from `main`.
- `BASE_PATH` is taken from the repository name.

## Decisions recorded (the brief left these open)

| # | Decision | Why |
|---|---|---|
| D1 | Split the brief's `Scenario` type into two. `ScenarioRecord` is the canonical record: facts, actions, ground truth and two advice variants. The presented `Scenario` is the brief's exact shape, resolved per trial. | The brief requires one canonical record with controlled presentation variants, and a single flat record cannot hold both a correct and an incorrect variant. |
| D2 | Scored trials use 0.95 and 0.65 only. 0.80 appears only in the unscored practice round. | The manipulation has two levels, but the type allows three values. |
| D3 | Balance: 6 correct and 6 incorrect. Within each group, 3 high, 3 moderate, 3 with rationale and 3 without. Across the run, each confidence and explanation cell appears 3 times. | A full 2 × 2 × 2 design cannot be filled evenly with 12 trials, so every two-way comparison is balanced instead. |
| D4 | Each domain has one correct-advice and one incorrect-advice scenario, and group difficulty totals are within 1 point. | Stops domain or difficulty being confounded with AI correctness. |
| D5 | Order rules: no adjacent domains, 3 correct-advice trials per half, no run of more than 3 trials with the same correctness. | Keeps the midpoint comparable and avoids streaks. |
| D6 | "Appropriate reliance" follows the brief literally. Rejections of wrong advice that land on another wrong action are shown separately. | The brief's definition, made transparent. |
| D7 | "Underreliance" includes investigating when the AI was right, and investigations are also reported on their own. | Every scenario can be solved from the facts on screen. |
| D8 | Cal is silent during scored decisions. The "95% confident" line appears after the practice round instead. | A line shown only with high confidence would confound the confidence condition. |
| D9 | Hash routing with a reducer and a guard, and no router dependency. | Survives a refresh on Pages, and the back button cannot reopen a decision. |
| D10 | Code is under MIT. The sprites are all rights reserved by P. Tejas Varma. | A safe default that grants no rights the artist has not given. |
| D11 | Option order is shuffled per trial on a separate seeded stream. | The review found the correct answer was 1st in 5 of 12 scenarios. |
| D12 | The intro and briefing do not state the 50% base rate. The method page does, with a warning. | Disclosing the base rate before play would change behaviour, but the method must stay transparent. |
| D13 | The shadowless `torch.png` stands beside Cal on the opening screen. `torch2.png` appears only at the midpoint. | Its base lines up with Cal's feet, and the brief says not to show torches everywhere. |
| D14 | The Credits page shows the credit line, one image of Cal, the licences, and a Works Cited list (MLA 9) of the research the measures draw on. It does not list per-sprite source details; that mapping stays in `public/sprites/ATTRIBUTION.txt`. | Rishi's request. The brief's attribution mapping is kept, but not shown on the page. |
| D15 | Effects never return a value; `window.scrollTo` is called inside braces. | Current Chrome returns a Promise from `scrollTo`, and React treated it as a cleanup function, which crashed navigation. `tests/setup.ts` stubs `scrollTo` to return a Promise so the tests catch this. |
| D16 | The results page shows the trust score (appropriate reliance, out of 12) in a ring that fills once. The number itself is static text. | Rishi asked for a score circle. The brief warns against a single theatrical score and animated counters, so the ring is labelled as a trust score, all underlying counts stay beside it, and it is not animated for reduced-motion visitors. |
| D17 | Cal's sounds are synthesised with the Web Audio API: happy for the best choice, a flat "meh" for rejecting bad advice but picking another wrong option, grumpy for any other miss. The results page plays one sound by score band. | Rishi's request. It avoids downloading or licensing audio files, and sounds only play inside click handlers, which browsers require before audio can start. |
| D18 | Removed the footer sound and animation switches. Motion follows the visitor's system setting only. | Rishi's request: the switches were overcoded. |
| D19 | Plain-language copy throughout: "Trusted bad advice" instead of "Overreliance", "Best choice" instead of "Documented action", a "How it works" page, "game code" instead of "seed". Exports and docs keep the technical names. | Rishi's request, so a first-time visitor can play without prior knowledge. Scenario content is unchanged, so the scenario bank stays at 1.0.0. |
| D20 | More Cal lines, including returning players, practice misses, the midpoint, and results lines that depend on whether mistakes leaned towards trusting or doubting. Equal-priority lines are picked by the seed. | Rishi's request for more wit. Cal still never speaks while a scored decision is open. |
| D21 | A "Why" page (`#/why`) explains the motivation in Rishi's voice, with MLA in-text citations that link to the Works Cited list. Cal greets the reader. McKinsey's 2026 State of AI survey was added as a source; the other claims come from sources already listed, each checked against the paper's abstract. The Credits page links to Tejas's itch.io page. | Rishi's request. Every in-text citation has a matching Works Cited entry. |

## Known issues and open items

- **Rishi to verify before sharing:**
  1. Play two runs and read every feedback screen (the human content review listed in the review log).
  2. Confirm with Tejas that the art licence wording is acceptable.
  3. Confirm that every sprite file is Tejas's original work. `Skeleton_01_White_*` follows an asset-pack naming pattern, and the brief forbids calling the art stock.
  4. Time one real run. The "estimated 10 to 12 minutes" figure has not been measured.
- **Sprite mapping verified.** All six web sprites are byte-identical to the files in `Downloads/sprites/sprites/`.
- **Not yet deployed.** Push to `github.com/Rishi1515/trust-lab`, then set Settings → Pages → Source to GitHub Actions.
- **Timing** resets if the page is refreshed mid-scenario. This is documented as a limitation.
- **Commit author.** Commits were made in the build session under "Vegesna Rishi Varma <Rishi1515@users.noreply.github.com>" with a Claude co-author trailer. Rishi can amend the email if GitHub does not link it to his account.

## Next actions

1. Push the repository and enable Pages (see README "Run it locally" and the handoff steps).
2. Open the live URL, finish one run, and check every route after a refresh.
3. Optionally record a voice-over version of the demo using `docs/demo_script.md`.
4. Write résumé bullets only after the live deployment is verified (brief section 20).
