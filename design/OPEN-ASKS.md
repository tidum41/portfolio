# Open asks

The ledger of every design ask Mudit has made for the portfolio. If it is not here, it will be forgotten.

## How to use

1. Builders read this file first, before any brief or code.
2. Every brief in `design/briefs/` has an `Asks covered:` line listing the IDs it addresses. `npm run check:asks` fails without it.
3. Audits mark each ID pass or fail with a screenshot path and the commit sha checked.
4. Only Mudit's approval or preview-verified evidence (screenshot + sha) moves an ask to verified. "Build passes" alone is not evidence.
5. Quote Mudit verbatim (short, keep his spelling); paraphrase only when no source message exists. New ask: add a row with the next ID in its component, quoted as close to verbatim as possible, with the date.
6. Status: open, in progress, verified, superseded (name the ID that supersedes it).

## Standing (all pages)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| STD-01 | Sentence case everywhere | Oct 20 | in progress | RULES.md standing rule |
| STD-02 | No em dashes | Oct 20 | in progress | RULES.md standing rule |
| STD-03 | No dot separators (·) as a default | Oct 22 | in progress | RULES.md 2026-10-22; 826bc80: 0 "·" and 0 em dashes in /dialogue body text at 1440 and 390 (local prod build, dialogue-r8/d-lib.png). Not preview-verified. |
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
| DLG-08 | "comparing sidebar vs floating bubble is just ok" | Oct 20 | superseded | by DLG-20 |
| DLG-09 | Clear closing | Oct 21 | open | |
| DLG-10 | Data-viz library section | Oct 21 | superseded | by DLG-18 |
| DLG-11 | "styled like ruth zhao reference we made for joola b2b" | Oct 20 | superseded | by DLG-15 |
| DLG-12 | UI fills the frame (~6-8% margin), no letterboxing | Oct 20 | open | dialogue-feedback-1020 G1/G2 |
| DLG-13 | Lightbox on click, Esc/click-off closes, ~200ms, reduced motion | Oct 20 | in progress | dialogue-feedback-1020 G3; r9 a3ce008: lightbox on every Dialogue figure via CaseStudyLightbox, 900px/80vh max, Close label, Esc and backdrop close, reduced motion (dialogue-r9/*-lightbox.png). Local build only. |
| DLG-14 | No dot separators in captions ("Answer + evidence, Chosen") | Oct 21 | in progress | 826bc80: captions are plain "Data shape / Encoding / Tradeoff" lines, 0 dot separators (dialogue-r8/d-lib.png). Local build only. |
| DLG-15 | "No crooked quirky shit be methodical" (grid-aligned hero) | Oct 21 | in progress | dialogue-v2.md; 826bc80: hero is a straight 2-col grid, no rotation (dialogue-r8/d-top.png). Frame is 750px, not the brief's 1120px.; r9 a3ce008: hero thumbs 3 x 120px, 8px gap, columns aligned (measured). Local build only. |
| DLG-16 | "Even hero at 390 needs to be something noteworthy" | Oct 21 | in progress | dialogue-v2.md; 826bc80: separate 390 hero, chat card with overlapping drop-off card (dialogue-r8/m-top.png). Judged by builder only, needs Mudit. |
| DLG-17 | "Interview quote frame isn't like live version"; restore 1:1 (657337d) | Oct 21 | in progress | Misses M3; 826bc80: DialogueInterviewPlayer restored from 657337d (16:9, 56px play, no control bar) plus 22px webcam blur (dialogue-r8/d-quote-top.png, m-quote.png). Not diffed pixel-wise against the live site.; r9 a3ce008: player restored by git checkout of 657337d plus diff; only adaptation is still-aspect frame and blur overlay. Local build only. |
| DLG-18 | "a library displayed in the page ... similar to how ibm carbon is laid out"; "I can't skim"; "dumb simple to understand the bad and good while still being technical for designer and pm" | Oct 21 | in progress | dialogue-v2.md; 826bc80: DialogueChartLibrary, equal-size bad/good pairs, 15px verdict + 13px technical line (dialogue-r8/d-lib.png, m-lib.png). One pair per row, not 2-up, because column is 750px.; r9 a3ce008: ruled-out specimens now distribution/timeline/quote count per brief; tag and technical lines raised for AA. Local build only. |
| DLG-19 | "background for ui elements also have a slightly offset tone for more separation" | Oct 21 | in progress | 826bc80: figure wells #EEEDEB on #FBFBFB page, 1px 4% border (dialogue-r8/d-lib.png). JOOLA/BruinLease frames only checked via shared token.; r9 a3ce008: --figure-well and 1px 4% border tokens, light and dark. Local build only. |
| DLG-20 | "Floating chat vs sidebar comparison section kinda sucks"; find a detail that "conveys experience matters in little considerations" | Oct 21 | in progress | dialogue-v2.md 1d82113; 826bc80: floating vs sidebar section replaced by low-coverage compare; good version leads with "2 of 24 interviews", no chart (dialogue-r8/d-cov.png, m-cov.png). |
| DLG-21 | "the live component versions are also so much more higher quality and crisp" (use them) | Oct 20 | in progress | live frames on canvas |
| DLG-22 | Problem/solution: "these are legit the same image. you just need one image" | Oct 20 | open | |
| DLG-23 | "case study visuals should never fill the viewport overly like that" | Oct 20 | open | |
| DLG-24 | Fixed-structure graphic "is good but its awkward with the width of the image ... that comes after" | Oct 20 | open | |
| DLG-25 | "show even more chart responses being rendered" in the UI and the case study | Oct 20 | open | |
| DLG-26 | "make drop shadow slightly slightly harsher" | Oct 21 | in progress | briefed on dialogue branch; 826bc80: --shadow-chat made harsher. Not measured against a reference; needs Mudit. |
| DLG-27 | "i dont like the shipped vs no shipped" (remove that line) | Oct 21 | in progress | briefed on dialogue branch |
| DLG-28 | "why are things not 1:1 with fonts spacing design system languyage" | Oct 21 | open | |
| DLG-29 | "make sure spacing follows dialogue's design system that we had orignally added from paper" | Oct 21 | in progress | RULES 10-21 Paper tokens |
| DLG-30 | "why is that bar graph right aligned instead of left" (assistant returns left) | Oct 21 | verified | 139a511 audit PASS (prod build 1440/390) |
| DLG-31 | Blocker: lightbox Close sits under the site header (z-index 40); a real click goes to /about. Also JOOLA and BruinLease | Oct 22 | in progress | overnight audit r11; r12: still open on 695eaa3, lightbox now portaled to body and Close anchored to the dialog corner |
| DLG-32 | Blocker, dark: fixed-structure labels 1.04:1 (dark ink on dark well) | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-33 | Dark: hero clip timestamps 2.19:1, use about #A8A29E | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-34 | Dead space under the hero right column; add sources-pill card, trim chat top gap to 24px and composer to 56px, no stretching | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-35 | Counter-evidence figure is a light box in dark mode with 0 radius; use well token, 8px radius | Oct 22 | in progress | overnight audit r11 |
| DLG-36 | Light captions 3.25:1 on page, 2.87:1 in wells; use #6B6B6B | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-37 | Lightbox zoom cut-off from 480 to 600px to match the hero breakpoint | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-38 | Remove committed audit screenshots (r8, r9, r10) and em dashes in ucla-sublease and joola meta descriptions in code; leave Sanity | Oct 22 | verified | overnight audit r11; r12 preview audit 695eaa3 |
| DLG-39 | Blocker, dark: counter-evidence pills on the dark well with light-theme ink (1.04:1 and 2.19:1); regression from DLG-35 | Oct 22 | in progress | overnight audit r12 |
| DLG-40 | Hero sources card wraps 2+1 with an empty right half; use the 4 real sources as an even 2x2 | Oct 22 | in progress | overnight audit r12 |
| DLG-41 | Remove committed .playwright-mcp screenshots and ignore the folder | Oct 22 | in progress | overnight audit r12 |
| DLG-42 | One `--caption-ink` token instead of two hard-coded caption colours | Oct 22 | in progress | overnight audit r12 |
| DLG-43 | 390 fixed-structure figure: funnel value column cut mid-glyph; show all 5 legend labels or none | Oct 22 | in progress | overnight audit r12 |
## JOOLA film and card (JOO)

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| JOO-01 | "add to order or replace also does some slight laoyut shifting" | Sep 23 | open | fix promised; needs check |
| JOO-02 | "Stretch it out timing wise a little more you can be slower on some screens" | Oct 13 | open | |
| JOO-03 | "dont like row or buttons being highlighted like in the blue when clicked" | Oct 13 | open | |
| JOO-04 | "the scaling isnt good enough for the project card" | Oct 13 | open | |
| JOO-05 | "stay on order confirmation screen and show Joola logo slightly longer" | Oct 13 | open | |

## Other

| ID | Ask | Date | Status | Evidence |
| --- | --- | --- | --- | --- |
| HRO-01 | Homepage hero line: pick pending | Oct 21 | open | |
| ARC-01 | Archive minimap contrast | Oct 21 | in progress | merged, build passes; needs preview screenshot |
| ABT-02 | Intro copy: "what makes me unique needs to be expressed"; "cognitive science background helps and communities are also true"; not "too charactery" | Oct 21 | open | |
| ABT-01 | About page without org icons | Oct 21 | in progress | merged, build passes; needs preview screenshot |

## Needs Mudit

Status can't be determined from the repo or commits.

1. JOO-01 to JOO-05: did the JOOLA film pass that shipped fix these (layout shift, slower timing, no blue highlight, card scaling, longer logo hold)?
2. DLG-01 to DLG-09: still wanted, or replaced by the v2 brief (DLG-15 to DLG-20)?
3. ABT-02: is the intro "niche" line still open, or is the current About copy approved?
4. STD-06 Beacons: remove it, or label it as past work?
5. ARC-01 and ABT-01: approve the minimap and About previews as verified?
6. DLG-27: is the shipped vs not shipped line gone to your satisfaction?

## Misses

| # | What was forgotten | Root cause | Preventive check added |
| --- | --- | --- | --- |
| M1 | Chain-link icon dropped from copy email by 8942037 | Refactor rewrote the component without reading the ledger | Builders read this file first; audits re-check verified FTR IDs |
| M2 | Areal flagged as a missing-font bug | Auditor did not know Areal was shelved | STD-05 recorded as intended |
| M3 | Quote frame drifted from the 657337d version | No pinned reference sha for an approved figure | DLG-17 pins 657337d; evidence must cite sha |
| M4 | Dialogue v2 brief written without the ledger | Briefs had no link to ask IDs | `Asks covered:` line, enforced by `npm run check:asks` |
| M5 | Quote player rewritten instead of restored a second time | Restore was done by hand, not from the pinned sha | Restores must be a git checkout of the pinned sha plus a diff |
| M6 | Audits checked only hand-picked elements for contrast | No whole-page sweep | Every audit runs a whole-page WCAG contrast sweep in both themes |
| M7 | Lightbox Close never tested with a real click at the top of the page | Header sat above it | Every audit clicks Close for real while scrolled to the top |
| M8 | DLG-31 reported fixed after a z-index change checked only on a local build; second Close-click miss | Stacking context above the header was never inspected | `scripts/check-dialogue-preview.mjs` real-click Close test, run against the preview of the tip |
| M9 | DLG-35 changed a container background without re-sweeping its children; second partial-contrast miss | Checked the container, not the text inside it | `scripts/check-dialogue-preview.mjs` whole-page WCAG text sweep, light and dark, 1440 and 390 |

Shared cause in M1, M3, M4: work started without reading this ledger. Promoted: `check:asks` script plus "builders read first" rule.

## Self-improvement

- Every miss adds a row above and a check or rule.
- When 2+ misses share a root cause, promote the fix into `design/RULES.md` or a CI check, and note it here.
