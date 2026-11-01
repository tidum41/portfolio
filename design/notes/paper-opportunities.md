# Paper opportunities, Dialogue case study (audit, Nov 1 2026)

Read-only audit of `/dialogue` on review/round-p15 at 9a6d3c7. Nothing on the page changed. Read design/TASTE.md first; it wins every conflict here, and nothing below reopens a decided item.

Spine: research teams surface insights quickly without losing the detail behind them, and the AI picks a chart per answer from templates adapted from IBM Carbon.

Paper source: the screenshots and notes in `uploads/paper-shots.tgz`. File names below are paths inside it: `tokens/` (component and data viz sheets, "after" state) and `viz2/` (the data viz options at full size). Current visuals were judged from the take posters, frames pulled from the take videos in `public/dialogue/motion/`, and a local render of the live data viz and thin data figures.

Ground rules for every item:
- **Data:** only Hearthside values the page already uses (225 and 75 of 300, 9 of 14, 88 of 125, the top five asks, the median scores of 2 and 4, two of 300 missed a delivery, the 125 and 300 follow-up chips, Ana, Dev, Mei, Owen). A value I don't have is marked [PLACEHOLDER].
- **Figures:** one figure per section (skim rules). Every idea goes into an existing figure, its poster or its caption. None adds a figure.
- **Text:** every idea adds no body text. Where words are needed, they replace words already there.
- **New components:** tagged **NEW COMPONENT, needs Mudit's OK**. Anything untagged is built from the SYSTEM-COMPONENTS allowlist.

## Top 5 by story impact

1. **Levels: show the failure and the fix as held frames.** The page's one reversal can't be seen today without watching the video at the right second. The first-try poster stops before the count leaves view, and the kept toggles poster is an empty Insight card.
2. **Data viz: show the percent chart that the By group template beat.** The body claims that 9 of 14 and 88 of 125 look alike as percents, but the figure only draws the counts.
3. **Clips: open-state poster plus a zoom on the player bar.** The poster shows no player. When the take does open, it looks almost the same as the first-try failure frame, and the player-bar decisions are too small to read.
4. **Thin data: put the misleading chart beside the flag.** The rule against charting two people is stated in words, but nothing shows what a two-person bar would have looked like.
5. **Data viz: draw one awkward-shape rule instead of describing it.** "Two values tie: no highlight" is Mudit's cherry rule. Today it is one of four text cells.

Each is written up in its beat below and marked **[Top 1]** to **[Top 5]**.

---

## 1. Hero: "Interactive insights for UX research teams"

**(a) Must prove.** The finished artifact up front: one answer gives the count and the insight at a glance, and one tap reaches a person.

**(b) Proves it? Yes.** The take ends on 225 of 300 with the cherry 225 and Ana's quote (`live-hero-ask.jpg`). It is the only figure with panel chrome, as decided. Team metadata is still a visible [PLACEHOLDER] (P14).

**(c) Paper reuse.** `tokens/components-section1-after.png`, Variation A (spec panel plus the case-study shadow), is what the hero already follows. Nothing more is needed.

**(d) New detail.** None. Round L's hero was rejected as too complex, and the hero is approved as is. Leave it.

## 2. Problem: "Teams needed answers fast, and the detail got lost"

**(a) Must prove.** Prose hides how many people stand behind each claim, so a fast answer loses its detail.

**(b) Proves it? Yes.** The static annotated still (`variant-before-full.jpg`) underlines "Many found" in cherry with an "Unstated count" callout. A skimming reader gets it at once (P16 r4).

**(c) Paper reuse.** None. `tokens/components-section2-after.png`, panel "Original (Dialogue spec)", is Dialogue's real DM Mono text chart. TASTE bars it from every figure (r24 revert), so it must not appear here as a before.

**(d) New detail, optional, low effort.** The same paragraph hedges again with "several", "Some", "others", "A few" and "a handful". Give those a thin stone-500 underline and keep the one cherry focal on "Many found". The still then shows that the missing count is how the answer is written, not a single slip, and the callout and caption stay as they are. Don't print a tally of the hedges; that would be a new number.

## 3. Levels of detail: "Every level at once was too slow, so depth became optional"

**(a) Must prove.** Two things: stacking every level in one stream pushes the count out of view (the first try), and the kept toggles let the reader open depth and get back to the count in one tap.

**(b) Proves it? Only while the video plays.** **[Top 1]**
- The desktop first-try poster (`variant-every-full.jpg`, 2.2 s) shows the 75 open with Mei and Owen. The count is still in view, so the poster shows the opposite of the claim. The failure only appears around 5.8 s, when the player opens and the count is gone.
- The toggles poster (`variant-toggles-full.jpg`, 7.1 s) is the Insight state: one sentence on a mostly empty card. It is the loop seam, not the held open state that TASTE motion rules ask posters to show.
- In motion, B's Source state (about 5 s) looks almost like the first-try failure frame: player open, count scrolled away. What differs is that B's tab row stays at the top, so Insight is one tap back. Nothing on the page points that out.
- A, the picker still, is clear. Its stone-900 225 follows round 9.

**(c) Paper reuse.**
- `tokens/components-section6-after.png`: Original (Dialogue's real tab row: Overall, Screener, Sections, Participants) beside Variation B, which shipped (36px, borderless, warm active). It shows the levels control is Dialogue's own pattern. Word it as a design choice; TASTE forbids saying a figure was built from the product's components.
- `tokens/components-section4-after.png` and `tokens/components-section5-after.png`, Variation A in each: these are the rows and player the takes already use. They are the reference for any re-record.

**(d) New detail.**
- **Posters, no new component.** First try: use the held frame where the player has pushed the count out of view (around 5.8 s). B: use the held Source state with Ana playing. Then a reader on reduced motion, or one who never presses play, sees both halves of the turn.
- **Point at the anchor.** Name the one thing that differs in B: the tab row stays put, and one tap on Insight brings the count back. The default costs no extra text: swap B's caption clause "tapping Ana plays her clip" for that line. The stronger version is a static callout in the well beside B's panel ("One tap back to the count"), as P15 allows. P16 limits annotated stages to two, so the callout **needs Mudit's OK**. On phones the words stay in the caption (P16 r3).
- Why: this beat is the page's one stated reversal. If the failure and the fix look the same, the claim that depth became optional goes unproven.

## 4. Counts: "Every claim leads with how many, and both sides open"

**(a) Must prove.** The count is the level everyone reads, so it leads; each side of the count opens its people on a tap.

**(b) Proves it? Yes, in motion.** The take swaps the 225 for the 75 and back. The still (`live-side.jpg`) shows the 225 open with Ana and Dev. Two [PLACEHOLDER]s remain in the copy (what came before counts, and how the 2 shown quotes are picked).

**(c) Paper reuse.**
- `tokens/components-section4-after.png`: Original (Dialogue's transcript rows from 597-0, letter avatars) next to Variation A, the kept rows (12 by 16 padding, 8 apart, duration in a fixed right lane). This before and after shows the rows were derived from Dialogue's own transcript and tightened into countable cards.
- `tokens/components-section2-after.png`, Variation A: the 24px stacked bar with a 2px seam and tabular legend lanes, the round 5 card.

**(d) New detail, mid impact.** A zoomed pair of the bar alone, made from the existing ChartStackedBar. One state has the 225 selected: solid cherry, with the 75 in stone. The other has the 75 selected: the 225 drops to a tint and the 75 goes solid. Each legend swatch matches its segment (round 9). It shows the selection decision without a ring; the ring was dropped at P4. This only makes sense if the counts take gains a held still, so it ranks below the top 5.
- Check before acting: the "+N more" pill appears in Paper (`tokens/components-section4-after.png`, "+73 more") and in the By group template, but not in the counts take. If it was cut on purpose ("2 quotes shown, picked from the 225"), leave it out.

## 5. Clips: "A quote plays from its moment, inside the answer"

**(a) Must prove.** The deepest level loads only on a tap, plays only the quote's moment (04:10 to 04:24), and stays inside the answer without losing the count.

**(b) Proves it? Partly.** **[Top 3]**
- The poster (`live-clip.jpg`, 5.4 s) shows the quotes with the cursor on Ana, but no player. A reduced-motion reader never sees a clip in the clips section.
- In motion, the open state (about 4.3 s) scrolls the bar out of view, so the frame looks like the first-try failure. The count survives only as "picked from the 225" and its cherry key dot in the sample head. That is the real answer, but nobody would notice it.
- The player-bar decisions (fixed-width tabular times, scrub limited to the clip range, the open-in-new-tab session link, all P16 r4 and round 9) render at about 12px inside the take. No one will read them.

**(c) Paper reuse.**
- `tokens/components-section5-after.png`: "Current case study" (cherry 6% fill and ring, times not in fixed lanes) beside Variation A, which shipped (warm selected card, #E7E5E4 edge, 40px time lanes, open icon at the bar's right). This is a ready-made before and after for the "sweats the small decisions" takeaway: the ring was removed to keep one cherry per figure.
- `tokens/components-section5-after.png`, Original (Dialogue spec, 597-0 and 5SR-0, no session link): shows the player follows Dialogue's own and adds the session link.

**(d) New detail.**
- **Poster, no new component.** Use the held open state with Ana playing.
- **Zoomed player bar.** A still of the bar alone at about 2x, made from DialogueDemoStill with the existing DialogueInterviewPlayer. It carries two thin-leader notes in the well: "times sit in fixed lanes, so nothing shifts as seconds tick" and "the scrub is the clip, 04:10 to 04:24, not the session". The session-link icon is visible but unlabelled. Why: this is the page's clearest small decision, and today it is invisible. Placement: inside this section's one figure, as the poster's second state or a crop below it. It **needs Mudit's OK** as an annotated stage (P16 caps them at two); on phones the notes move into the caption.
- **Optional, NEW COMPONENT, needs Mudit's OK:** a pinned mini count in the sample head (225 of 300 as a thin bar) so the count stays in view while the clip plays. Only consider this if the head's "picked from the 225" is judged too weak once it is pointed out.

## 6. Data visualization: "The AI picks a chart from templates I designed"

**(a) Must prove.** Four things:
- The AI matches each answer's shape to one template.
- The templates are adapted from IBM Carbon, with named departures.
- Each pick beats a plausible alternative for a stated reason.
- Rules cover the awkward shapes, and every chart keeps the way back to its people.

**(b) Proves it? The mapping, yes. The choice and the rules, no.** The live figure (local render, 1440 and 390) is a routing sentence, four rows (question type, then template, then one pro line, then the card, cut and Carbon source), and a two-by-two grid of awkward-shape cells in text.
- **[Top 2]** The body says 9 of 14 and 88 of 125 look alike as percents, but no percent chart is drawn anywhere, so the claim rests on prose. The con line in each template's data (`con`) isn't rendered either, so no row says what its pick costs.
- **[Top 5]** The awkward shapes are text only. Ties, too many categories and zero results are the Paper notes' "not shown" gap (`chart-story.md`, part d).
- Only By group opens its people, and only on a tap. The other three cards show no route back to the people.

**(c) Paper reuse.**
- `viz2/section-2-segments-b.png` (100% stacked bar, "percent hides base size") is the exact argument for By group. The code already holds the matching near-miss: the `segments` entry's "Common chart" in DialogueChartLibrary, a ChartBarList in percents built from 9 of 14 and 88 of 125. Reuse the code version; the Paper render's data doesn't match the page (see the conflicts section).
- `viz2/section-1-share-a.png` (meter, "hides the other 75 unless the second chip is tapped") is the ruled-out option for Split. It can be drawn as a single-row ChartBarList.
- `viz2/section-3-ranking-a.png` and `viz2/section-3-ranking-b.png` (sorted bars against a table with bars): the "loses the glance" reason for Ranked.
- `viz2/section-6-theme-a.png`: bars with a lead quote. Its reasons are out of the same 225 and it leads with Ana's 04:10 to 04:24, so it stays on the page's story. It is a candidate fifth template only if Mudit wants one. Its reason counts are Paper Hearthside values not yet on the page, so they need his OK before use.
- `carbon-map.md`: the Carbon names to use. For example, Split's two-sided bar is Carbon's meter (proportional) variant, while the page says "meter chart".

**(d) New detail.**
- **[Top 2] Show the near-miss for By group only.** In that row, a small ruled-out card (percents, 64% and 70%, computed from the page's 9 of 14 and 88 of 125) beside the kept counts card, with the existing con line. Every other row keeps today's single card, so the stack stays light and "four matches compare at once" still holds (P16 r4). Why: it turns the section's main sentence from a claim into something the reader can see, and shows a pick made against a believable alternative (TASTE likes: believable near-misses).
- **[Top 5] Draw one rule.** Replace the "Two values tie" text cell with a small ChartBarList where the top two rows tie and neither is cherry. The answer sentence says they tie. Tie counts: [PLACEHOLDER: two tied Hearthside counts from Mudit]. Why: the cherry hierarchy (one focal, none when nothing leads) is a Nov 1 decision, and this is the one place it can be seen working. The other three cells stay as text.
- **A route back to people on every card, NEW COMPONENT, needs Mudit's OK.** Every Paper data viz render ends in a people chip: waveform, names, +N, then the cut count on the right (for example `viz2/section-6-theme-a.png`, "Ana, Dev +116 / 118 no date shown"). It is not on the allowlist. The allowlisted fallback is EvidenceFooter ("Based on N of 300"); RULES says every answer card keeps one, and the templates show none. Why: it shows the spine in each chart, since each template still keeps a way back to its people.

## 7. Thin data: "Two people get a flag, and no chart"

**(a) Must prove.** Under three people a chart would read as a pattern, so the answer swaps the chart for a flag that says why, plus follow-ups the same interviews can count.

**(b) Proves it? The mechanism, yes. The reason, only in words.** **[Top 4]** The take (`live-thin.jpg`) shows the warm flag ("Early signal, 2 people. A chart needs 3 or more."), "View 2 clips", and two follow-up chips with 125 and 300 in a fixed count lane. Nothing shows the misleading chart that the rule prevents.

**(c) Paper reuse.**
- `viz2/section-8-thin-b.png` (unit dots, ruled out: "units still look like a result") and `viz2/section-8-thin-c.png` (compact flag, ruled out: "the reason there is no chart is less explicit") are the two options the kept flag beat.
- `tokens/components-section3-after.png`: "Current case study" (long chip wraps, its count floats off the baseline) against Variation A, which shipped (warm 40px flag, full-width chips, fixed count lane). This is a clean micro before and after for the chip lane.

**(d) New detail.**
- **[Top 4] A near-miss beside the flag.** Inside this section's one figure, the kept thin answer next to a small ruled-out card: the same answer drawn as a ChartBarList bar of two people. Base: [PLACEHOLDER: the group the near-miss bar counts out of; against 300 it is a sliver and would not mislead]. It uses the round 9 cut-and-denominator line, with no callout (P16 r4: no gutter note on this take). Why: the reader sees why a chart was refused, which is the strongest argument that Mudit's thin-data rule goes beyond Carbon. Unit dots (`viz2/section-8-thin-b.png`) would be a more honest-looking ruled-out option, but they are a **NEW COMPONENT, needs Mudit's OK**.
- **Lower impact: the chip-lane zoom.** A 360px crop of the longer chip ("What did shoppers say about the date?") with its 300 held in the fixed lane, set against the Paper "Current case study" chip whose count drifted. It's a good small detail, but it ranks below the near-miss.

## 8. Shipped and next: "Counts shipped, and the rest is a concept I'd test"

**(a) Must prove.** What shipped is set apart from what is concept, and what he'd measure is named honestly, with no results claimed.

**(b) Proves it? Yes, in text.** This section has no figure, and that's correct. One [PLACEHOLDER] remains (which signal first).

**(c) Paper reuse.** None.

**(d) New detail.** None. A visual here would add chrome to a section whose job is honesty. Keep it text.

## 9. Takeaway

**(a) Must prove.** The one takeaway about Mudit: he works from research teams' needs through desk research, designs inside an existing system, and sweats the small decisions.

**(b) Proves it? Yes, in text.** The learning is still a [PLACEHOLDER].

**(c) and (d).** Nothing new. The small-decision proof belongs in the clips and thin data zooms above, not in a closing figure.

---

## Flags

### Needs a new component (Mudit's OK first)
- The people chip under every chart (all `viz2/` renders). Allowlisted fallback: EvidenceFooter.
- Unit dots for the thin-data near-miss (`viz2/section-8-thin-b.png`). Allowlisted fallback: ChartBarList.
- A pinned mini count in the clip sample head (optional, clips).
- Any Paper option not drawable with the allowlisted charts: donut (`viz2/section-1-share-b.png`), treemap (`viz2/section-6-theme-b.png`), heatmap (`viz2/section-7-cooccur-a.png`, section 9 themes by segment) and bullet (section 9 target).

### Needs Mudit's OK but no new component
- More annotated stages. P16 fixed two, and the Levels B callout and the clip player zoom would add up to two more. The no-OK fallback is to put the words in the caption.
- A fifth template (`viz2/section-6-theme-a.png`) and its reason counts.

### Paper material that must not be reused as is
- **Cut chart types.** `tokens/dataviz-section4-after.png` and `viz2/section-4-waves-*.png` are line charts, and line charts and Round axes are cut. Section 9's weekly-tracking sparkline is a line too, and its task drop-off step chart is the cut funnel's job. Use none of them.
- **Data that disagrees with the page.**
  - Section 1 splits 300 into 225 / 41 / 34, but the page's two sides are 225 and 75.
  - Section 2 uses 62 of 90, 118 of 150 and 45 of 60, but the page uses 9 of 14 and 88 of 125.
  - Section 3 ranks themes from 142 of 300, but the page's top asks run from 41 of 300.
  - Rebind any reused render to the page's values.
- **Personas.** In section 8, Mei and Owen are lapsed buyers who cancelled, but on the page Mei is unsure and Owen checked the date. TASTE gives each persona one job.
- **Quotes.** The `viz2/` and `tokens/dataviz-*` renders put double quotes around "Arrives by Friday". Round 9 requires single quotes everywhere.
- **Cherry.** The `viz2/` option labels for each pick are cherry, so a render carries two cherry marks once the focal bar is cherry too. TASTE allows at most one cherry focal per figure. `tokens.md` also calls cherry logo-only; TASTE's Nov 1 approval of cherry as an accent wins.
- **Dot separator.** Variation B's chart-card footer in `tokens/components-section2-after.png` ("Stacked bar · 300 interviews") uses a dot separator, which is banned.
- **Dialogue's real text chart.** The "Original (Dialogue spec)" panel in `tokens/components-section2-after.png` is the DM Mono block, and TASTE bars it from figures.

### Label accuracy (report only, no copy changed)
- Split says "Adapted from Carbon's meter chart". `carbon-map.md` names it meter (proportional), a variant of meter.
- The page's 1 to 5 template is a median dot plot ("lollipop chart, stems dropped"). Paper's likelihood pick is a diverging stacked bar with an open [PLACEHOLDER] on centring (`carbon-map.md`, mismatch 3), and no Paper render of the median dot template exists.

### Poster checks (recording, not design)
TASTE motion: posters show the held, open state.
- `variant-every-full` stops before the failure.
- `variant-toggles-full` shows the empty Insight state.
- `live-clip` shows no player.
- These are covered under Top 1 and Top 3. The `-dark` posters share the desktop frame times (see `poster-times.json`). The phone first-try poster (`variant-every-full-m.jpg`, 4.6 s) already shows the player open with the answer sentence gone, so only the desktop and desktop dark first-try posters need the change. The phone clip and toggles posters have the same gap as desktop.
