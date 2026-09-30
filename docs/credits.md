# Credits

Designed and developed by Vegesna Rishi Varma. Original character artwork and sprite animations contributed by P. Tejas Varma.

## Character art

Cal and every sprite in TrustLab are original artwork by P. Tejas Varma. The web files are byte-for-byte copies of files in the supplied `sprites/sprites/` folder, with nothing redrawn; this was checked by comparing the files. Some were renamed for clarity; the mapping is below and in `public/sprites/ATTRIBUTION.txt`.

| Web file | Source file | Sheet | Frames | Used for |
|---|---|---|---|---|
| `cal-idle.png` | `skelly.png` | 96 × 48 | 2 × 48 × 48 | Cal at rest on every screen |
| `cal-audit-strike.png` | `Skeleton_01_White_Attack1.png` | 960 × 64 | 10 × 96 × 64 | Audit strike after correctly overruling 95% advice (max 2 per run) |
| `cal-collapse.png` | `Skeleton_01_White_Die.png` | 1248 × 64 | 13 × 96 × 64 | Collapse after accepting 95% advice that was wrong (max 1 per run) |
| `risk-skull.png` | `skull1-sheet.png` | 64 × 32 | 2 × 32 × 32 | Risk marker next to "Accepted wrong advice" |
| `torch.png` | `torch.png` | 192 × 48 | 4 × 48 × 48 | Beside Cal on the opening screen |
| `torch2.png` | `torch2.png` | 192 × 48 | 4 × 48 × 48 | Midpoint screen |

The editable source `Sprite-0001.aseprite` is kept unchanged in `source-assets/` and is never served.

These files from the supplied folder are deliberately not used in version one: the cat, goblin, goblin king, demon, ghost, bat and fish sprites, and the Player and Shadow sheets.

### How the sprites are drawn

- Sheets are animated with CSS `steps()`, integer scaling (3× on wide screens, 2× on narrow ones) and `image-rendering: pixelated`.
- The 48 × 48 idle frame is offset inside a 96 × 64 stage so its feet line up with the reaction sheets' feet:
  - idle feet: bottom opaque row 44, centre x 24
  - reaction feet: row 64, centre x 45
- With reduced motion (system setting or the footer toggle), each sprite shows one fixed representative frame.

## Licences

| Part | Licence |
|---|---|
| Source code, tests, docs | MIT (see `LICENSE`) |
| Character art and sprite sheets in `public/sprites/` and `source-assets/` | All rights reserved by P. Tejas Varma, used with permission. Not covered by the MIT licence. |
| React, React DOM | MIT (runtime dependencies) |
| Fonts | None bundled; system fonts only |

## Repository

https://github.com/Rishi1515/trust-lab
