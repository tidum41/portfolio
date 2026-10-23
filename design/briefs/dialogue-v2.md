# Dialogue case study v2 brief

Asks covered: DLG-14, DLG-15, DLG-16, DLG-17, DLG-18, DLG-19, DLG-20, STD-03

Brief only. No UI code in this change. Supersedes the 2026-10-22 hero collage rule in `design/RULES.md` (scattered, rotated charts) once approved.

## 1. Goal and story beats

Feedback: methodical, no crooked collage. Every visual tells part of the story. The quote frame must match the live UI. The 390 hero must hold up on its own. Add an in-page chart library modeled on IBM Carbon.

| # | Beat | One-line claim | Proof visual |
|---|------|----------------|--------------|
| 1 | Hero | Researchers ask, Dialogue answers with evidence | Straight product preview: chat answer + one chart + clip |
| 2 | Problem | Paragraph answers hide the evidence | Paragraph answer figure |
| 3 | Lead with the answer | Answer first, evidence second | Lead answer compare (paragraph vs structured) |
| 4 | Evidence you can watch | Quotes link to the moment they were said | Quote frame, restored 1:1 |
| 5 | Charts as answers | A chart only when the shape of the data asks for one | Chart library (section 5) |
| 6 | Little considerations | Honest about thin data | Low coverage note (section 7) |
| 7 | Outcome | What shipped and what we learned | Full answer figure |

## 2. Visualization inventory

Each viz gets exactly one job. Nothing appears twice at full size.

| Viz | Beat | Use | Notes |
|-----|------|-----|-------|
| Hero chat card + funnel | 1 | Hero | Funnel is the key feature preview |
| Paragraph answer | 2 | Key feature (problem) | Bad specimen |
| Structured answer | 3 | Key feature | Good specimen |
| Quote frame / clip player | 4 | Key feature | Restore, see section 4 |
| Synced transcript | 4 | Key feature, paired under quote frame | |
| Funnel (chosen) | 5 | Hero + library | Library shows small specimen only |
| Segment compare (chosen) | 5 | Library | |
| Trend line (chosen) | 5 | Library | |
| Coverage callout (chosen) | 5 | Library | |
| Theme bubbles (ruled out) | 5 | Library, bad side | |
| Quote frequency (ruled out) | 5 | Library, bad side | |
| Timeline (ruled out) | 5 | Library, bad side | |
| Distribution (ruled out) | 5 | Library, bad side | |
| Chart gallery (D-09) | 5 | Cut | Replaced by the library |
| Chart iteration alt | 5 | Cut | Fold into library tradeoff lines |
| Placement bubble / docked | 6 | Cut | Weak; replaced by section 7 detail |
| Coverage callout as answer state | 6 | Key feature | Bad vs good pair |
| Full answer | 7 | Key feature | |

## 3. Hero

No rotation. No overlap beyond one deliberate 24px inset. Everything snaps to the 8px grid.

**1440**
- Frame: content width 1120px, height 560px, radius `var(--radius-control)` (8px), surface per section 6.
- Composition: 12-col grid, 24px gutters. Chat card spans cols 1-7 (~632px), scaled to 1.0, left inset 48px, top 48px.
- Right column (cols 8-12, ~464px): funnel chart card 400px wide, top-aligned to the chat answer's first line; clip thumbnail row (3 x 120px, 8px gap) below it at 24px gap.
- All card tops align to one of two baselines: 48px or the funnel bottom + 24px. Bottom padding 48px.
- Titles one line, 13px label role. No text under 11px.

**390**
- Deliberate composition, not a shrunk desktop. Frame full bleed minus 16px page padding (358px), height 520px.
- Show the chat answer card at scale 1.0 cropped on the bottom edge at a sentence end, plus the funnel card overlapping the bottom 24px of chat, 16px right inset, width 300px.
- Drop the clip row. One accent (cherry focal bar) visible above the fold.
- Run the DOM text-size script: min 11px, no left-edge clip.

## 4. Quote frame: restore the 1:1 version

Live-parity version: `components/dialogue/DialogueInterviewPlayer.tsx` at **657337d** (Oct 20, "player 16:9, copy"), building on 2f05791 (Areal capture) and 774a9d4 (v2 interview still). Assets: `public/dialogue/placement-video-still.webp`, `public/dialogue/source/interview-frame.png`, `lib/caseStudies/dialoguePlacementStill.ts`, `lib/caseStudies/dialoguePlacementExport.ts`. File was dropped by the restore commits c4ae5ad / 5cd0959 / f807581 (back to fcc87a2), and the current `product/scenarios/ClipPlayerFigure.tsx` (e719fb3 through 139a511) is a rebuild that drifted.
- Spec from 657337d: 16:9 frame, body width = layout width - sidebar - 2 x player pad (312px), radius `PLACEMENT_RADIUS_MD`, blurred still, 56px white play button with 18px dark glyph, no control bar.
- Restore that component and its still; keep the r7 face blur. Implementer diffs a screenshot against the live UI before shipping.

## 5. Chart library (Carbon model)

Reference: Carbon chart types overview is a grid of tiles (specimen + name); each type page opens with a specimen, then "When to use" and "When not to use". We keep that order and make it a pair.

**Layout**
- Section width 1120px at 1440. 2-up grid of entries, 24px gutter, 48px row gap. At 390: one column, 32px row gap.
- Each entry: bad specimen and good specimen side by side, same data, same size (264 x 176px each at 1440, 16px gap; at 390 stacked 326 x 200px with 12px gap).
- Pair tags in-frame, top-left, 11px: "Ruled out" (stone) and "Chosen" (cherry outline, not fill).

**Two reading levels per entry**
1. Name: 16/500, sentence case, for example "Drop-off between steps".
2. Verdict (plain language, anyone): 15/400 ink, one sentence, max 80 characters. Example: "Bars show where people quit. Bubbles make you guess."
3. Technical line (designer/PM): 13/400 muted, 12px below verdict, three labeled parts on separate lines: Data shape, Encoding, Tradeoff. Example: "Data shape: ordered steps, counts. Encoding: length on a zero baseline is read precisely; area is not. Tradeoff: loses theme overlap."
- No em dashes, no dot separators, no legends inside specimens (direct labels per chart spec).

**Entries (good vs bad, same data)**
| Entry | Good | Bad |
|-------|------|-----|
| Drop-off between steps | Funnel bars | Theme bubbles |
| How groups differ | Segment compare | Distribution |
| Change over sessions | Trend line | Timeline |
| How much was covered | Coverage callout | Quote frequency |

Specimens follow `design/briefs/dialogue-chart-spec.md` (8px bars, one cherry mark, zero baseline). Static, no hover.

## 6. Figure surface tone

Problem: figure wells read flat against the page.
- Page `--color-bg` #FBFBFB (relative luminance ~0.96).
- Current well `--dp-figure-surface-system` #F2F1F0 (L* ~95.3, delta vs page ~3.2 L*).
- JOOLA/BruinLease media frames: rgba(46,46,46,0.04) on #FBFBFB, effective #F3F3F3.
- New: well #EEEDEB (L* ~93.8, delta ~4.7 L*, warm neutral); UI cards inside stay `--dp-surface` #FCFBF9 so cards lift off the well. Add a 1px inset border rgba(28,25,23,0.04).
- Update JOOLA/BruinLease frames to the same effective value (rgba(46,46,46,0.06), about #EFEFEF) so every case study matches. One token, all frames.

## 7. Small detail that shows care (replaces bubble vs sidebar)

Sourced only from shipped work: `CoverageCallout` ("2 of 24 interviews", "Only a few interviews match."), canvas item D-11 "counter-evidence, low coverage, zero match", `SourcesRow`, and D-10 clip at timestamp.

**Pick 1: low coverage note.** Same question, same 2 matching interviews, 1 x 2 pair at 1440 (each 448px), stacked at 390.
- Bad: confident answer with a chart; nothing says it rests on 2 of 24 interviews.
- Good: same answer led by the coverage note, chart withheld, text with sources.
- Verdict: "Two people said it. The good one tells you that."
- Why for UX teams: a finding from 2 interviews must not reach a roadmap as a trend. Trust in the tool depends on it saying when it doesn't know.

**Pick 2: source chip that opens at the moment.** Same quote, same size pair.
- Bad: quote with participant name only; you scrub a 45 minute recording.
- Good: `SourcesRow` chip with interview and timestamp; player opens at that second with the transcript in sync (D-10).
- Verdict: "One click to hear it said, not 10 minutes of scrubbing."
- Why: stakeholders believe a clip more than a summary; researchers check context before quoting.
- Overlaps beat 4, so if both are kept, beat 4 shows the player and this pair shows only the chip.

Ruled out: searching status (generic to any chat), face blur (a privacy safeguard for the case study, not a product feature).

## 8. Out of scope

Copy rewrites outside the library and captions, new chart types, interaction or motion, dark mode tuning, nav and pager changes.
