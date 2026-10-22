# Open asks

The ledger of every design ask Mudit has made for the portfolio. If it is not here, it will be forgotten.

## How to use

1. Builders read this file first, before any brief or code.
2. Every brief in `design/briefs/` has an `Asks covered:` line listing the IDs it addresses. `npm run check:asks` fails without it.
3. Audits mark each ID pass or fail with a screenshot path and the commit sha checked.
4. Only Mudit's approval or preview-verified evidence (screenshot + sha) moves an ask to verified. "Build passes" alone is not evidence.
5. New ask: add a row with the next ID in its component, quoted as close to verbatim as possible, with the date.
6. Status: open, in progress, verified, superseded (name the ID that supersedes it).

## Standing (all pages)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| STD-01 | Sentence case everywhere | Oct 20 | in progress | RULES.md standing rule |
| STD-02 | No em dashes | Oct 20 | in progress | RULES.md standing rule |
| STD-03 | No dot separators (·) as a default | Oct 22 | in progress | RULES.md 2026-10-22 |
| STD-04 | Site weight cap 500 (Dialogue UI keeps its real 600) | Oct 20 | in progress | RULES.md; dialogue-feedback-1020 G4 |
| STD-05 | Areal abandoned; Helvetica Neue fallback is intended, not a bug | Oct 20 | verified | type-system.md "shelve ABC Areal" |
| STD-06 | Beacons is not a current project; do not present it as current | Oct 21 | open | |

## Footer (FTR)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| FTR-01 | Copy email: chain-link icon with "Copied" | Oct 20 | verified | Regressed by 8942037, restored; see Misses M1 |
| FTR-02 | Footer email at natural width at rest | Oct 21 | verified | prior ledger, prod build |
| FTR-03 | Equal gaps to neighbors in both states, calm slide (~220ms ease-out) | Oct 21 | verified | prior ledger, prod build |

## Case study pager (PGR)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| PGR-01 | Previous flush left, Next flush right of the 750px content column; lone Next flush right at all widths incl. tablet | Oct 21 | verified | prior ledger, prod build |

## Dialogue case study (DLG)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| DLG-01 | Quieter in-figure text | Oct 21 | open | |
| DLG-02 | Solutions laid out horizontally, chosen one obvious | Oct 21 | open | |
| DLG-03 | No divider under "Study chat" | Oct 21 | open | |
| DLG-04 | Equal-height figures at 8px radius on a calm background | Oct 21 | superseded | by RULES 10-22 natural-height rows; radius part lives on |
| DLG-05 | Natural chart mapping | Oct 21 | open | |
| DLG-06 | Fixed caption | Oct 21 | open | |
| DLG-07 | Real interview frame, heavy face blur, Dialogue icon and viewer avatar | Oct 21 | open | |
| DLG-08 | Refined floating vs docked comparison | Oct 21 | superseded | by DLG-20 |
| DLG-09 | Clear closing | Oct 21 | open | |
| DLG-10 | Data-viz library section | Oct 21 | superseded | by DLG-18 |
| DLG-11 | Ruth Zhao-style collage hero | Oct 21 | superseded | by DLG-15 |
| DLG-12 | UI fills the frame (~6-8% margin), no letterboxing | Oct 20 | open | dialogue-feedback-1020 G1/G2 |
| DLG-13 | Lightbox on click, Esc/click-off closes, ~200ms, reduced motion | Oct 20 | open | dialogue-feedback-1020 G3 |
| DLG-14 | No dot separators in captions ("Answer + evidence, Chosen") | Oct 22 | open | |
| DLG-15 | Methodical, non-quirky, grid-aligned hero; "no crooked collage" | Oct 22 | open | dialogue-v2.md |
| DLG-16 | 390 hero is noteworthy on its own | Oct 22 | open | dialogue-v2.md |
| DLG-17 | Restore the quote frame 1:1 to 657337d (match live UI) | Oct 22 | open | Misses M3 |
| DLG-18 | Carbon-style skimmable chart library: bad vs good pairs, plain verdict + one technical line | Oct 22 | open | dialogue-v2.md |
| DLG-19 | Offset figure background tone from the page | Oct 22 | open | |
| DLG-20 | Replace floating vs sidebar section with a small UX-care detail | Oct 22 | in progress | dialogue-v2.md 1d82113 |

## Other

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| HRO-01 | Homepage hero line: pick pending | Oct 21 | open | |
| ARC-01 | Archive minimap contrast | Oct 21 | in progress | merged, build passes; needs preview screenshot |
| ABT-01 | About page without org icons | Oct 21 | in progress | merged, build passes; needs preview screenshot |

## Misses

| # | What was forgotten | Root cause | Preventive check added |
| --- | --- | --- | --- |
| M1 | Chain-link icon dropped from copy email by 8942037 | Refactor rewrote the component without reading the ledger | Builders read this file first; audits re-check verified FTR IDs |
| M2 | Areal flagged as a missing-font bug | Auditor did not know Areal was shelved | STD-05 recorded as intended |
| M3 | Quote frame drifted from the 657337d version | No pinned reference sha for an approved figure | DLG-17 pins 657337d; evidence must cite sha |
| M4 | Dialogue v2 brief written without the ledger | Briefs had no link to ask IDs | `Asks covered:` line, enforced by `npm run check:asks` |

Shared cause in M1, M3, M4: work started without reading this ledger. Promoted: `check:asks` script plus "builders read first" rule.

## Self-improvement

- Every miss adds a row above and a check or rule.
- When 2+ misses share a root cause, promote the fix into `design/RULES.md` or a CI check, and note it here.
