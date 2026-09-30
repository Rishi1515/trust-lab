# Build status

Single source of truth for where the build stands, so later sessions do not need the full conversation. Source brief: *TrustLab Claude Implementation Brief* (docx, supplied by Rishi).

## Current phase

Phase 2 complete (experiment logic and fixtures). Next: Phase 3 content review, then Phase 4 core flow.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Unit and component tests | `npm test` |
| Type check (app + tests) | `npm run typecheck` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Check build uses the Pages base path | `npm run check:build` |
| Everything, as CI runs it | `npm run verify` |

## Completed requirements

- [x] Vite + React + TypeScript scaffold, Vitest + React Testing Library
- [x] Typed scenario schema (`src/types/scenario.ts`), session types (`src/types/session.ts`)
- [x] Seeded RNG and shuffle (`src/experiment/rng.ts`)
- [x] Balanced, seeded condition assignment (`src/experiment/assignment.ts`)
- [x] Scoring and plain-language metrics (`src/experiment/scoring.ts`)
- [x] JSON and CSV export with no personal identifiers (`src/experiment/export.ts`)
- [x] Startup validator for the scenario bank (`src/experiment/validate.ts`)
- [x] Tests: scenario integrity, balance over 400 seeds, determinism, scoring fixtures, zero counts, export fields
- [x] Sprites verified and copied to `public/sprites/` with a filename mapping

## Decisions recorded (brief left these open)

| # | Decision | Why |
|---|---|---|
| D1 | Split the brief's `Scenario` type into a canonical `ScenarioRecord` (facts, actions, ground truth, two advice variants) and a presented `Scenario` (the brief's exact shape, resolved per trial). | The brief requires one canonical record per scenario with controlled presentation variants. A single flat record cannot hold both a correct and an incorrect variant. |
| D2 | Scored trials use 0.95 (high) and 0.65 (moderate) only. 0.80 is used only in the unscored warm-up. | The manipulation has two levels; the type allows three values. |
| D3 | Balance: 6 correct / 6 incorrect advice; within each group 3 high / 3 moderate and 3 rationale / 3 none; across the run each confidence x explanation cell appears 3 times. | A full 2x2x2 design cannot be filled evenly with 12 trials; this keeps every two-way comparison balanced. |
| D4 | Each domain gets one correct-advice and one incorrect-advice scenario; group difficulty totals differ by at most 1. | Stops domain or difficulty from being confounded with AI correctness. |
| D5 | Order constraints: no two adjacent scenarios from the same domain; 3 correct-advice trials in each half; no run of more than 3 trials with the same AI correctness. | Keeps the midpoint comparable and avoids long streaks that could train blind trust or blind doubt. |
| D6 | "Appropriate reliance" follows the brief literally (accept correct advice or reject incorrect advice). Rejections of incorrect advice that land on another wrong action are counted and shown separately. | The brief's definition, made transparent. |
| D7 | "Underreliance" includes investigating when the AI was right, and the results show how many of those were investigations. | Every scenario is solvable from the facts on screen; investigation is also reported on its own. |
| D8 | Cal does not speak during scored scenarios. The brief's "95% confident" line is used after the warm-up instead. | A line that only appears with high confidence would itself be a manipulation and would confound the confidence condition. |
| D9 | Hash routing (`#/scenario/3`) with a reducer and a route guard, no router dependency. | Works on GitHub Pages with refresh and needs no 404 redirect trick. The guard stops the back button from re-answering a decision. |
| D10 | Code under MIT. Sprite art excluded from the MIT licence: all rights reserved by P. Tejas Varma, used with permission. | Safe default that grants no rights the artist has not given. Rishi to confirm with Tejas. |

## Known issues and gaps

- `skull1-sheet.png`, `torch2.png` and `Sprite-0001.aseprite` were not supplied in this session. The skull marker is not used. `source-assets/` holds a README asking for the `.aseprite` file to be added.
- The supplied torch sheet could be `torch.png` or `torch2.png` (identical dimensions). It is mapped to `torch.png`.

## Next actions

1. Phase 3: independent review of the 12 scenarios, record the review log, freeze bank 1.0.0.
2. Phase 4: core flow views and keyboard-only run.
