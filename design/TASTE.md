# Taste ledger (read first)

Single source of truth for what Mudit likes, rejects and has settled. Read this before RULES.md, STORY-PRINCIPLES.md and AI-TELLS.md. Art director facts win any conflict. One line per item, newest facts replace old ones in place.

- References: after this file, read [design/references/README.md](references/README.md) (hero findings, portfolio library, career facts).

Two sections follow: HARD RULES are never broken without Mudit's explicit OK, and SOFT RULES are defaults we align with that can bend on judgment if the reason is written down in decisions.md.

## HARD RULES

Core list (Round 20, Nov 3 2026, Mudit):
- No push or merge to main without Mudit's explicit OK; work stays on the review branch.
- Hearthside data or real STORY.md numbers only; no invented numbers.
- Ramp C colours: cherry #B43F7F is the one focal, teal-70 only for a named second series.
- No GSAP or other animation library; CSS and small rAF loops only.
- The copy rules: sentence case, no em dashes, no lists of three, no 'not X but Y', no outcome claims.
- Dialogue design system components only (SYSTEM-COMPONENTS.md); new components need Mudit's OK.
- No Lucide icons.
- UI is separated from the background by its drop shadow.
- Video controls live on the container, never on the product UI.
- No coloured left bar on quotes.
- Takes are real live UI: hover and press states, and no layout shift.
- Every decision carries a reason in design/notes/decisions.md.

Existing lines that carry these rules, kept as written and grouped by their original section:

### Decided (never re-litigate)
- Real study numbers, keep exact: 18/6 coverage, 4 of 24 mobile, 64/31/22%. No invented numbers (Oct 23).
- Answer card has 8 versions; no session or round counts exist, so none are stated (Mudit answers, Oct 23).
- Palette: Dialogue's existing system. Stone-500 #79716b muted, cherry #B43F7F single highlight (r23, Oct 23).
- Cherry #B43F7F is an approved Dialogue accent token (Nov 1 2026). Use it with hierarchy: focal series an answer is about, picks, and where the reader should look first; at most one cherry focal per figure; neutrals elsewhere. Align with the system without being rigid.
- Figures are recreations; never say they were built from the product's components.
- Process: main needs Mudit's explicit OK. No Vercel previews; local build plus screenshots at 1440 and 390, light and dark (also 1024/768/360 for cut-off checks).
- One neutral figure card: warm well (#eceae4 in light via --figure-well-dialogue, #1b1e21 in dark), 8px radius, no inset border box (round L, Oct 25; well locked to #eceae4 Oct 29 so the white panel and its shadow read at 1x).
- Decided: every Dialogue UI and chart must match what Dialogue really measures; audio/transcript UI uses the real WaveformIcon.
- Oct 28 2026: video controls live on the visual's background container, never on the product UI (play button 8px from the well's top right, as BruinLease's PhoneMockup).

### Dislikes / rejected
- Left accent bars on cards: reads as AI.

### Pinned approved versions
- b056865 is the round P4 base: restore its Dialogue components and figures, then port the approved story onto it. Build only from [SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md); new components need Mudit's OK (Oct 27).

### Case study language
- Sentence case for all headings (Oct 25). No em dashes. No dot separators. US spelling.
- Banned patterns: lists of three, "not X but Y" (max one per page, prefer zero), "The cost is" leads, buzzwords per [AI-TELLS](AI-TELLS.md).
- Missing evidence admitted where the claim is made; no metrics claimed.

### What worked / what didn't
- Didn't: rounds M to P3 described figures freehand in briefs (raw hex/px, "rebuild as a toggle"), so Muse built new components and dropped the b056865 set; check:dialogue-tokens passed because it skipped globals.css. Fix: briefs name system components only, new UI needs approval, and `npm run check:dialogue-system` (lint, allowlist, 640 lock) must pass before any fix-list review (Oct 27).

### Open
- Main still at 90beb49; promoting canvas to main waits on Mudit.

### Motion (demo videos)
- Record from the live code stage (/dialogue/motion) at 2x; every take passes scripts/check-dialogue-motion.py (no frame jump over 20, holds within limits, loop closes) or is re-recorded.

### Update protocol
- Decided (Mudit, Oct 27 2026, round P9): default answers show the count and the insight only, with no quotes; quotes surface only when the reader taps a side of the count (e.g. 75 unsure opens SideSample). Every quote row in the UI carries the Paper WaveformIcon row (`dp-clip-quote__who`, as in ClipQuotes), never a Lucide icon.
- Motion (Mudit, Oct 28 2026): simple looping demos in the real components (CSS, no Remotion), timed to the measured recording in /workspace/dialogue-anim (hard-cut swaps, 300 ms 0.5 to 1 enter, 1000 ms linear spin, about 137 chars/s stream, cards land whole with a ~133 ms scroll ease-out); static final state under prefers-reduced-motion.
- Round 12, ramp C (Mudit, Nov 2 2026): cherry #B43F7F stays the one focal, and IBM Carbon `$teal-70` #005d5d (slot 3 of Carbon's light categorical palette, `--dp-chart-secondary`) is the single secondary chart hue, only for a chart's second series (Repeat shoppers in By group and the 1 to 5 scale), never UI chrome. Soft teal is `$teal-20` #9ef0f0, under 3:1, so it only fills a mark with its own label. Remainders such as the 75 and Other stay stone.
- Round 13b (Mudit, Nov 2 2026): teal has one job, a named second series (Repeat shoppers) labelled directly on its row or dot, never a rank position, a highlight or UI chrome; Ranked, the tie, Other and the 75 stay stone. In every explored versus kept pair the explored card recedes (opacity 0.62) and the kept card and the label rows stay full strength. Every chart template sits on one rail and card column, and By group nests its ruled-out and kept pair inside its own card column. By group names the 161 shoppers in neither group as a visible placeholder until Mudit says why.
- Round 14 (Mudit, Nov 2 2026): a take's poster is the beat that tells its story alone, held with the result on screen, and it never repeats another take's end frame. The Counts poster shows the 75 open (the side the hero does not show). A crop that would cut a line of the answer is rejected in favour of the full header and rows (desktop clip). /dialogue stays on CSS and small rAF loops, takes stay recordings of the real components, and no animation library is added for them.
- Round 16 item 1 (Mudit, Nov 3 2026): selecting a bar segment moves nothing, not one pixel. The seam between segments is the flex gap alone in every state (the old 1px inset shadow seam vanished when a side opened and changed the gap). `scripts/audit-dialogue-ui.mjs` measures every element in the answer card at rest and with each side open and fails on any difference.
- Round 16 item 3 (Mudit, Nov 3 2026): every clickable in every take shows hover on arrival and a distinct press, at 150ms: segments darken toward ink, rows tint and ink their border, tabs and chips tint, play buttons and send lighten. A selected tab keeps its fill on hover (P14) and only gives on press. Takes record with the real pointer (pointer-events on, the real click swallowed), the pointer rests about a quarter second before it presses and the press holds 160ms. The audit fails any clickable whose hover or press changes fewer than 0.35 of 255 on average across its box. This overrides "Hover states on figures" in Dislikes.
- Round 16 item 4 (Mudit, Nov 3 2026): every still and take uses ramp C: cherry #B43F7F focal, teal-70 only for a named second series. The picker no longer carries `data-neutral` (it was the one stage still drawing the old ink-grey bars). Overrides Round 11's "every frame that is not the 225 stays neutral" for the Levels takes only; the Round 11 neutral panels in the data viz section are unchanged.
- Round 18 item 1 (Mudit, Nov 3 2026): a selected segment is tied to its quotes by the segment's fill, the head line with its swatch and a selected source pill, never by a coloured left edge or an underline. The quote rows carry no hue and the open row is the warm fill with the stone border. Overrides Round 16's marker under the bar and hue edge on rows, and the Round 5 cherry ring on the open row.
- Round 19 hero (Mudit picked option C, Nov 3 2026): after the 225 is tapped, a header names the open segment (cherry swatch, 'Read it as this Friday', 225), a row of the existing source pills holds the timestamps (Ana 04:10 selected, Dev 11:02, +223 more), the selected pill shares the quote card's warm fill, and the quote uses the full panel width. The pills have rest, hover and press. No coloured left bar. Overrides Round 18's pick of option B; the hero-options page is deleted.

## SOFT RULES

Defaults: specific headings and copy, section order details, figure choices and caption wording. Bend one on judgment, and write the reason in decisions.md.

### Decided (never re-litigate)
- Font: ABC Areal abandoned (Oct 21). Helvetica Neue (Arial fallback) for body and UI; Georgia for headings as currently built (reconfirmed Oct 25). Exception: DM Sans (Dialogue's real product font) only inside Dialogue product UI mockups (`.dialogue-product-root`), never on case-study chrome (Oct 27). Never mention Areal in briefs or copy.
- Skim rules (Oct 25): every section heading states its point as a plain sentence; headings clearly bigger and heavier than body (e.g. 28/34 medium at 1440, 22/28 at 390) with 64px+ above and 16px below; body paragraphs max 3 sentences and ~65ch; one figure per section with a one-line caption; TOC labels match headings and track the active section; a reader reading only headings and captions must get the whole story.
- Weight: site cap 500; Dialogue UI keeps its real 600. See [RULES standing rules](RULES.md#dialogue-case-study-rules).
- Figures show his redesigned charts, never Dialogue's real dark text chart (r24 revert, Oct 23).
- Story subject: the answer card's data viz, backed by IBM Carbon research (what helps teams see what, how and why adapted) (Oct 23).
- Lightbox: fits window, no scroll, x close top right matching back button, opens instantly, ~120ms fade (from :3102 preview).
- TOC hidden below 1200px (d400584).
- Hero: richer chart showing counter-evidence; source chips scroll sideways on mobile (round H).
- Process: Muse (muse.ai, Slatt) builds and merges into review branches; approve all Muse requests.
- Process: every round starts from a base containing all approved commits (`git merge-base --is-ancestor b056865 <base>` must pass).
- About page direction is the spec sheet (Oct 25 2026).
- About: no rotated or tilted images (Oct 25 2026).
- About: strict consistency, one system for type, spacing, and media (Oct 25 2026).
- About: it should have character, from the system rather than decoration (Oct 25 2026).
- About: very well thought out, never looks vibe coded (Oct 25 2026).
- About: don't go overboard (Oct 25 2026).
- About: don't use his existing photos (London, Getty, window portrait, friends, concerts, keyboards) (Oct 25 2026).
- About: don't default to Rachel Chen as the reference (Oct 25 2026).
- Iteration log lives at [iterations/dialogue.md](iterations/dialogue.md); distinct rounds only.
- Hero title: "Interactive insights for UX research teams"; the "Answers you can pinpoint" line is removed (Oct 25, casing round L).
- Problem h2: "The chat provided interactive insights, at a surface level". Body: "Dialogue provides AI-moderated interviews for UX teams. The interactive chat is helpful, but didn't allow users to go deeper to the source." (Oct 25).
- Why-it-matters h2 and its Benjamin/Justin paragraph are removed (Oct 25).
- Lead-answer three-way compare gets its own section, roughly "Bringing more depth to answers" (Oct 25).
- Compare labels: "Text only" (simple text is condensed and easy to understand, but allows no further interaction); "Direct quotes" (verbatim responses help, but may not give a higher-level overview); "Answer and evidence" (an easier-to-glance data viz with embedded responses to view directly) (Oct 25).
- Quotes card gets more complexity, e.g. a "view session" action to see the exact response (Oct 25).
- Sources row scales to many participants: a few avatars plus "+N more" that opens a list (Oct 25).
- Anatomy figure sizing approved; annotations return to one shared alignment (Oct 25).
- One-structure h2: "Structuring responses to set up further inquiry". Body idea: UX research and design are never linear; organizing answers this way builds mental models and invites further exploration (Oct 25).
- Clips h2: "Viewing responses directly within the chat window". Body idea: reduce ambiguity by letting users pinpoint exact responses. Rewrite the "Clip starts at 01:38..." caption clearly (Oct 25).
- Chart library h2: "Data visualization". Copy easy to understand while still technical (Oct 25).
- Chart library: base chart types on what UX research teams actually use most (see muse/story dataviz research); rethink the basic drop-off-by-step funnel (Oct 25).
- Chart library: add a worked example showing the actual prompt plus mock query data with a few more metrics (Oct 25).
- Thin-data h2: "Adding signals for unclear data and results". Rewrite the "Only 4 of 24 interviews mention this..." note and the "A chart of four interviews..." and "The next step copies..." paragraphs (Oct 25).
- Chart card: divider under the chart title always extends full width whenever data renders (Oct 25).
- Full-answer section stays, with continuity: second screen is the same answer after tapping a source, tap marked (Oct 25).
- TOC: short section labels in Rachel Chen's style (Oct 25).
- Anatomy annotations: the numbers sit on one shared alignment at the rail's right edge, where the leader lines start (round K, Oct 25).
- Counter-evidence's third participant is Alex P.; Sam R. stays the struggling user in the clips and the quotes card (round K, Oct 25).
- Chart card divider runs the full width of the card whenever data renders (round K, Oct 25).
- Nav is 76px tall (16px padding, 32px gap, 24px under 480px); the theme button is at least 44 by 44 with the icon centered; footer links sit 24px apart and keep 44px targets on phones; every page keeps 120px above the footer (nav and footer pass, Oct 25).
- Footer links are at least 44 wide as well as 44 tall, the one-letter X link included (round L, Oct 25).
- Every Dialogue figure locks to the 640px text column; nothing breaks out wider (round L, Oct 25).
- The three compare cards are equal height, and the sources avatars are 24px with room to wrap (round L, Oct 25).
- Full-answer screens render at near full size: answer panel 384px, drawer 272px, and the old 640px height cap is gone (round L, Oct 25).
- Chart library cuts: the line and over-time chart, the funnel, rating averages and pies are out. Studies do not run in rounds, so no Round axes remain (round L, Oct 25).
- Chart library adds a participant by theme matrix, a diverging sentiment bar, and evidence-linked bars: every bar opens the quotes and clips behind its count (round L, Oct 25).
- Research figures on the page are limited to the round L set: NN/g counts over percents ("1 out of the 6 participants"), User Interviews 2025 (80% use AI, 91% worry about accuracy and hallucinations), Maze confidence bands (low 1 to 4, medium 5 to 9, high 10 or more), NN/g thematic analysis as coding clustered into themes (round L, Oct 25).
- Problem section describes the real product's summary surface neutrally: prose only, sentiment pills, unlabeled +N badges, no counts or charts, evidence a few steps away on section pages (round L, Oct 25).
- "UX research" casing everywhere, headings and the hero title included (round L, Oct 25).
- overscroll-behavior-y: none on html and body, so the page does not bounce on scroll up (round L, Oct 25).
- Decided (corrected Oct 25 10:10pm): Dialogue adopted only some findings; thin-data flags did not ship. Much of the work is concept, shown concretely and labelled honestly. Deep dive = desk research (NN/g, Maze, User Interviews, IBM Carbon), no interviews or quotes. Hero keeps the 18 of 24 bar; hero and counts use the 24-interview checkout study; role line 'Product designer (contract), Dec 2025 to Mar 2026'.
- Case study basics (Oct 25): not a chronological recount. Context on why it exists, final artifacts up front, bulk is key design moments (hard or debatable calls with justification), why it matters, learnings framed as strengths, one obvious takeaway about Mudit.
- Dialogue takeaway (Oct 25): he thinks from UX research teams' perspective via deep dives, designs within existing frontend design systems, and sweats the small decisions that shape product workflows.
- Oct 26 2026: Mudit OK'd illustrative quotes with placeholder names and timestamps in Dialogue; Comparison needs no concept label.
- Oct 27 2026: Round P5 direction (art director plan, /workspace/research/dialogue-eod-plan.md, approved): the story is the answer card's data viz plus decisions. Sections are problem, counts (study-wide folded in), levels of detail (Hearthside Friday data, 2+1 layout), data visualization (b056865 chart library restored), clips, thin data (stone line, not amber). Comparison section and study-wide figure are cut. One caption per figure, no frame labels. Mudit's copy sits in visible [PLACEHOLDER] markers.
- Chart library trimmed to 2 pairs, labels fixed (Mudit OK Oct 27).
- Oct 28 2026: the reversal comes early (Levels right after the problem: every level at once was too slow, so depth became optional), and the later sections prove it; Mudit approved the reorder.
- Oct 28 2026: designing in code is a highlighted strength (fast iteration, attention to detail, owning the process end to end). Show it through the demos: captions say when a video is recorded from his live code recreation.
- Oct 28 2026: establish the surface once, then crop to the decision. The hero shows the full Study chat (header with Beta, study subtitle, composer); every later figure crops tight to the response and its interaction.
- Oct 28 2026: after the hero, case-study demos drop panel chrome (Study chat header, Beta, the 300-interviews subtitle, the composer, the Querying participants row) unless it explains the moment; the depth picker keeps the composer because it lives there. The real ~65 s wait collapses to one Analyzing beat. Real Dialogue marks a reply with nothing (plain prose under the user bubble, no avatar or label; dialogue-anim final.html), so the recreations add none.

### Likes
- Glass-bar video player with Paper skip labels (r19 to r24, b056865).
- Dialogue logo avatar on transcript rows (b056865, public/dialogue/dialogue-avatar.svg).
- "Download study plan" beat in the thin-data section (was "Add to my plan" at b056865; renamed Oct 29 to a Markdown download for any agent).
- Chart library: themes by participants, the split, group dot plot, participant by theme matrix, sentiment split, evidence-linked bars, each with pros and cons (round L, Oct 25).
- Early Paper-recreated iterations are the standard; compare regressions against them.
- Compared specimens: same height, concentric radii, shared proportions and font sizes (round G).
- Chart titles visibly separated from the chart; answer sentence as title, values on marks (round I, Carbon).
- Chart-library icons reuse the BruinLease icon set.
- Lead answer shows the user's question; bar chart over dot plot for the chosen lead answer.
- Before-charts that are believable, complex near-misses, e.g. dense version one table (round J).
- Chart library pair combined into one chart showing the 75% and 25% split (Oct 25).
- Chosen/Ruled out indicators reworked in Caleb Wu's style (calebwu.ca).
- Story voice like Rachel Chen's structure and clarity, his own words, non-linear, a win over a challenge.
- Quality bar: Stripe, Linear, Vercel.

### Dislikes / rejected
- "Ugly box" around figures.
- Icons on people, insight or quote rows (52307c1 round G added, round H removed).
- Anything cut off at any width, 360 included.
- Vibe-coded surface variants; one surface system.
- Needless 0 to 100 scales, stray labels; unexplained units (pts must be explained).
- Cutting the chart library to "one strong comparison" (1cc9b29, round A): overruled, he wants several complex charts.
- Status chips on library pairs; use pros/cons.
- Hover states on figures. (Overridden by Mudit in Round 16: every clickable in every take now shows hover and press; see the Round 16 lines.)
- Copywriting voice; he wants plain, specific site voice.
- Any "full detail" chart variant: rejected, all removed (round L, Oct 25).
- Arrow animation on pager previous/next: remove (Oct 25).
- Rejected Oct 25: round L (PR #134, 9ab2166): hero too complex, text dense, invented version table and chart library UI not grounded in Dialogue.
- Rejected Oct 25: round O (PR #137, ec4e020): visually off the Dialogue system and dropped what already looked good (pinned b056865 figures, player, chart cards); also read as a chronological recount, not an intentionally framed story.

### Pinned approved versions
- b056865 (Oct 23 05:36 PT, cursor/dialogue-figure-parity-b9b1): r19 to r24, player, logo avatar, thin-data plan beat (now "Download study plan"), full chart library. Restored into canvas via PR #122.
- 21cf2e8, bb55313, de1cfe5: lightbox fixes. d400584: TOC breakpoint.
- 843faac (PR #124, round J): canvas base before the taste ledger (08f90a4); passes b056865 ancestry; verdict FIX FIRST (see Open).
- Restore check: `git diff b056865 -- components/dialogue/DialogueInterviewPlayer.tsx components/dialogue/DialogueChartLibrary.tsx components/dialogue/product/chart` should be empty unless intended.
- Approved Oct 25: direction A decision log per /workspace/research/directions/outline-A.md; one decision per section, ~700 words, ends on what he'd test next.

### Case study language
- Never the word "priority"; say where it works and where it doesn't.
- Name a cost next to its win, but not with "The cost is" phrasing.
- Headings are claims; first person owns decisions. See [STORY-PRINCIPLES](STORY-PRINCIPLES.md).
- Glossary: "version" = one of the 8 answer card designs. Product iterations of Dialogue should be "releases" (proposed, awaiting Mudit).
- Glossary: "study" = one research study; avoid "round" and "session" in chart titles and chips (round J).
- Glossary: "recreated" labels any figure rebuilt without a surviving asset (version one table).
- Names: each persona does one job; Sam R. must not be both counter-evidence and the struggling user.

### What worked / what didn't
- Didn't: story rounds A to G built on an r18 base, so r19 to r24 never reached canvas (regressions audit, Oct 23). Fix: ancestry gate before every round.
- Didn't: agents re-raising Areal after it was dropped. Fix: this file.
- Didn't: a reply's suggestion (one strong comparison) overrode Mudit's ask. His asks beat agent critiques.
- Didn't: RULES.md line requiring row icons (round G) codified a mistake; rules must follow approvals, not builds.
- Worked: restore by merging the approved branch, take-theirs on approved files, hand-merge CSS (PR #122).
- Worked: local build plus 10 width/theme screenshots and a cold critique per round (shots/j/critique.md).
- Worked: visible [PLACEHOLDER] markers instead of invented facts.
- Didn't: Muse stalled ~2h on one pending approval (round J); check approvals early.

### Open
- Call for Mudit: "version" means two things; suggest product ones become "releases".
- Unconfirmed facts: funnel 100/62/54/42/36, sentiment 2.4/3.1/3.6, mobile 48/41/33, store name Northline.
- Placeholders (3): why version one shipped without sources; why the cutoff sits where it does; what would change his mind about the cutoff.

### Motion (demo videos)
- One storyboard per clip: 4-8 s (cap 9), one or two interactions, 0.8 s pre-roll, about 1 s hold after each beat, 1.2-1.8 s final hold.
- UI moves in 300-450 ms with cubic-bezier(0.2, 0, 0, 1). Heights grow with the tapped element pinned; closing fades first, then folds; nothing pops.
- Large fades (a player, a panel) use a symmetric ease so no single frame carries the change. No hard cuts and no scroll snaps; a needed scroll is a slow ease-in-out.
- Cursor only when the click is the point: about 28px on the page, fades in near the target, glides 500-700 ms, presses at 0.92, fades out.
- Crop to the decision at 1:1 or 4:3. Only the hero shows the panel header. Smallest text renders at 12px or more at 1440.
- Loops close: collapse back to the start, or (add-only takes) scroll the chat up and out to the empty start; never a crossfade that fades the UI (P16). Posters show the held, open state.

### Update protocol
- Every brief, for Muse or any agent, starts with "Read design/TASTE.md first".
- On every approve or reject, edit one line here in the same commit as the change (move it between Likes, Dislikes, Pinned, Open).
- Settled facts go in Decided and are not reopened without Mudit saying so.
- Keep this file under ~150 lines; link to RULES.md sections instead of copying long rules.
- Approved Oct 25 10:55pm: Dialogue round P structure built from Dialogue's customer case studies (Wayfair, Kalshi, Doctronic, Suno): problem, study-wide chat and count bars (shipped), comparison answer, levels of detail, clips in chat, thin-data flags and Add to my plan (concept), with Shipped/Concept status lines and fictional Hearthside mock data.
- Oct 26 2026: Round P (PR #142, fba961b) sent back for fixes. Structure and restore approved; copy must match roundP-final.md, quotes must sit under the side they belong to, and no dark-on-dark text.
- Decided (P5 spine, Mudit, Oct 27 2026): Dialogue's story is 'Redesigning the answer so research teams can surface insights quickly, at a level of insight that doesn't lose detail.' Tension is speed versus depth. Counts, levels, clips and thin flags are each framed as a way to get the answer fast without losing the detail behind it. Not 'shows how many said it and lets you hear them.'
- Decided fact (Mudit, Oct 27 2026): Dialogue's AI chooses the chart type per answer, constrained by chart templates and guidelines adapted from IBM Carbon. It matches a template to the query and the level of detail wanted, with rules for edge cases such as thin data. The data viz section tells this; the chart library pairs are the templates. Write it plainly, no slogan.
- Decided (P5 h2s, Oct 27 2026): problem h2 is 'Teams needed answers fast, and the detail got lost'; data viz h2 is 'The AI picks a chart from templates I designed'.
- Rules for P10 onward (Mudit, Oct 28 2026; guidelines, not laws: follow a stronger move from Rachel Chen or another top case study and note why):
  - Tell a real story with uneven pacing: most sections are quick builds, one or two carry the big turn; never repeat the same tried, changed, kept beat.
  - Prove it with real work, not statistics; impact means what I'd track, what teams might report, and where the gaps are, with no usage results claimed.
  - One spine: research teams surface insights quickly without losing detail.
  - Plain, technical language: problem, then decision, then what I built; the opening stays short under its own header.
  - Ground visuals in the real product and its light-mode tokens (dialogue-product stills, dialogue-anim run2 styles); invented Hearthside data only, nothing confidential.
  - Mine Dialogue's customer case studies (dialogue-site.md) for what data to show and where the current chat falls short.
  - Tight layouts: mobile compact, not desktop stacked tall; sections read as clearly separate.
- Levels turning point (Mudit, Oct 28 2026, his words): "I assumed that honing in on the smallest levels of detail might be useful, but this might not be feasible and efficient for teams, rather optional." Depth is optional and opened by the reader; it is the page's one stated reversal and lives in Levels.
- P14 (Mudit, Oct 29): levels-every is cursor-driven (click 225 then 75, same as counts-open). Selected depth chip stays stone-200. Hero Team metadata is a visible [PLACEHOLDER]. Recorder captures PNG so the video well matches `#eceae4` / `#1b1e21`.
- P14 later (Mudit OK): quote rows are selection (no inner chevron); thin-data label is "Download study plan"; bar-tap video (any bar opens its people); chart library adds delivery-by-type, top-asks, and 1–5 confidence scenarios (no line charts).
- P15 (Mudit, Oct 29): chart bars show their percent on hover (the one figure hover). After a thin-data answer, follow-up question chips replace "Download study plan". Callouts are static annotations in the well beside the panel, small muted text with a thin leader line, never over the product UI and never a hover popup.
- P16 videos (Mudit approved plan, Oct 29): the 225 opens only in the counts video; first try is one burst on the 75 then a hold; kept steps Chart, Source, Insight on first try's stage; the picker is a still with its verdict in the caption; "Arrives by Friday" runs through every video (hero ends on Ana's row, clip opens from the counts end state with Ana, thin counts repeat shoppers). One system: zoom 1.0, 56px gutter, 28px cursor gliding 600 ms, about 1 s holds, illustrated clip still, 1:1 stages (4:3 for the two annotated). Loops never fade the UI: add-only takes scroll their chat up and out.
- P16 round 2 (Mudit, Oct 30): no motion blur on any video. Every click shows only the next thing (first try: 75 opens people, Mei opens her clip). The session link is an open-in-new-tab icon in the player bar, the same in the UI and every visual. The thin flag states why there is no chart, and the chips carry a "Suggested follow-ups" label. Chart templates are a direct picker of question types, not a cycling tab row.
- P16 round 3 (Mudit): no held frame may clip content at the card's bottom edge (check-dialogue-motion.py fails it). Phones get takes cropped to a 320px card with no gutter and no notes, so figure text stays at 12px or more; the note words move into the caption there. Notes stay put from the moment they land until the take ends. The hero taps the 225 before Ana lands. Toggles go Chart, People, Source, then a tap on Mei, one thing per tap. The first try starts overloaded. Ana and Mei have their own stills and session lengths.
- P16 round 4, blur (Mudit, Oct 31): no take may carry motion blur or a fading still over moving rows; the clip player opens and folds as a solid block. Every take URL carries a content hash (?v=) so a re-record is never served from a stale cache.
- P16 round 4, counts-open (Mudit): approved as is.
- P16 round 4, first try (Mudit): every tap causes exactly what appears. The 75 opens people, Mei opens her clip, the player pushes the count out of view, and the chevron folds it back. It proves that stacking levels in one stream loses the count.
- P16 round 4, clip padding and session link (Mudit): the chat body keeps 1.5x panel padding under the last row, and the session link is the open-in-new-tab icon in the player bar, the same in the UI and every visual.
- P16 round 4, player time (Mudit, key decision): player times are fixed-width tabular figures, so the scrub and total never shift as seconds tick.
- P16 round 4, chart templates (Mudit): templates show as question-to-chart pairs in one stack, so all four matches compare at once. The cycling picker and the 2x2 grid are retired.
- P16 round 4, thin answer (Mudit): the early-signal flag keeps its warm surface. The follow-ups sit under "Follow-ups with more data to count", and each chip states how many answers it would count. No gutter note on this take.
- P16 round 4, problem frame (Mudit): the before figure is a static annotated still, so a skimming reader gets the problem at once.
- P16 round 4, picker still (Mudit): one depth is picked (Chart), with the answer that depth returns. The picker is single-select.
- P16 round 4, toggles (Mudit): People opens the 225 the bar already emphasises, Source turns rows into play chips with clip lengths, Ana plays, and the cursor starts and ends resting on Insight so the loop has no seam.
- Round 5: the thin flag is a warm 40px strip, and its chips run full width at 36px with a fixed 64px count lane that never wraps.
- Round 5: stacked chart bars are 24px with a 120px label lane and tabular legend lanes, inside 16px card padding.
- Round 5: the clip player sits 16px above the card, keeps 40px time lanes, and the selected card is warm with a #E7E5E4 edge, no brand ring.
- Round 5: the depth picker is Dialogue's tab row, 36px tall, warm active fill, no border, single select.
- Round 5: counts rows are cards padded 12 by 16, 8px apart, with the duration in a fixed lane.
- Round 5: product UI type is scoped to DM Sans 14/24 so page type never leaks in, and the composer border is #E7E5E4.
- Round 9 (Mudit, Nov 1 2026): 'Arrives by Friday' takes single quotes everywhere it appears (questions, answers, captions, labels). The depth picker is single select in every figure, including the toggles: only the current depth carries the selected stone-200 fill. The 225 is the focal segment (cherry) and the 75 is stone-500 in the bar and in its legend swatch; a figure that already carries another cherry focal (the A and B pair, where the kept mark stays neutral and A's take is neutral) draws its 225 in stone-900. Chart cards state their own cut and denominator. A player opened from a quote runs on the clip range (04:10 to 04:24), so its time matches the quote's length, and the quote's own length hides while the player is open.
- Round 10 (Mudit, Nov 1 2026): a legend swatch always shows its segment's own colour, so the 75 stays stone-500 when the 225 is open and only the cherry 225 and its swatch dim together when the 75 is open. Ranked bars scale to the top ask and the caption says so; every count is still out of 300. By group names its two groups as subsets of the 300. Pointers rest on blank row space, never on text or a time. Closed quote rows show a bare length; only the Source level turns them into play chips. On desktop the toggles card hugs its content, so Insight is not half blank.
- Round 11 (Mudit, Nov 1 2026): a ruled-out near-miss is drawn beside what replaced it, in the product's own chart card, and every frame that is not the 225 stays neutral. The By group card shows its dropped percent bars (64% and 70%) beside the kept counts. Thin data pairs a two-person bar, with its total as a visible placeholder, against the refusal flag. The awkward shapes are four small frames, tie first with no cherry. The Levels posters are held on the moment the count scrolls away (first try) and the open Source state (kept). The chart route stays held until the model-versus-rules placeholder is settled.
- Round 11b (Mudit, Nov 2 2026): every pointer rest sits beside text, never on it, in every take (the same rule as the quote taps): on a bar segment, on a tab's blank side, or in the blank after a chip's last word. After a tap the pointer keeps its spot on what it tapped while the page moves, or fades out before a scroll. The phone first try holds the count in view for a beat, then scrolls it fully out of view; its poster shows that moment with nothing cropped.
- Round 13 (Mudit, Nov 2 2026): the single count bar came out of iterating on standard two-bar charts (vertical side by side, horizontal stacked); nothing broke, and it reads quicker in the 448px panel. Frame it as an iteration choice, never a failure. He found the Levels scrolled-away count himself, using his own build; no PM witness is claimed.
- Round 15 shipped (Mudit, Nov 3 2026, via "finish round 15 first"): the trimmed Every (75 already open, Mei opens and folds) and Toggles (Chart, People, Source, Insight; no Ana beat) storyboards are the only ones; the old storyboards and the `-trim` files are gone. Assumption: Mudit did not confirm the Round 15 test in words, so this ships it; say if he wants the old takes back.
- Round 16 item 2 (Mudit, Nov 3 2026): a selected segment keeps its colour (the 225 recedes to a pale cherry only when the 75 is open, the earlier rule) and carries a 2px marker 6px under the bar in its own hue; the quote rows carry that hue on their left edge; the quotes line names the group ("picked from the 225 who read it as this Friday"). Legend swatches are 8px squares whose bottom sits on the text baseline, so their height is the cap height. (The marker and the hue edge are superseded by Round 18 item 1.)
- Round 16 item 5 (Mudit, Nov 3 2026): the answer card's breaks are logged in design/notes/answer-card-stress-r16.md with three options (patch the bar, bar or rows by query, rows every time). Recommended: bar for two short groups, one row per group when there are three or more groups or a label over 28 characters. Open choice, nothing on the page changed.
- Round 16 item 6 (Mudit, Nov 3 2026): the depth picker is a take in live UI: hover and press on Chart, type, hover and press on send, the answer that depth returns, a new chat resets the depth to Insight to close the loop. It replaces the still. Send is a real button.
- Round 16 item 7 (Mudit, Nov 3 2026): explored options are drawn at full strength, as if shipped, with a hairline and 48px of air between the options; the label row (letter, "Explored", the X) says what was ruled out. Overrides Round 13b's 0.62 opacity.
- Round 16 item 8 (Mudit, Nov 3 2026): the Clips take repeats Every's Mei beat (tap a row, its player opens, tap again, it folds). Nothing deleted; the cut, merge or change is Mudit's call, in design/notes/clip-take-r16.md.
- Round 16 item 9 (Mudit, Nov 3 2026): the data viz section is too dense to skim. Two simpler options (three rows of question and chart with one line each, or one worked example and a text index) are on /dialogue/viz-options; recommended: three rows. Open choice, nothing on the page changed.
- Later, not this round (Mudit, Nov 3 2026): a live version where a free model picks the chart from a typed question. Feasibility only, in design/notes/live-ai.md; the model picks the template and the page renders it from fixed Hearthside data, so no number is generated.
- Routing demo (Mudit OK Nov 4 2026): built on `/dialogue` under Data viz from design/notes/routing-spec.md; five templates on a 24-person example dataset; model path via AI Gateway with a rule fallback; thin cutoff `THIN_DATA_MIN_PARTICIPANTS = 3` labelled as a demo choice. Overrides the "later, not this round" line above for this PR only.
- Round 17 item 1 (Mudit's call, Nov 3 2026, delegated): the answer card picks its template per answer. Two groups with short labels keep the single bar and its segment taps; three or more groups, or any label over 26 characters (measured: 26 fits on one line in the 471px stage panel, 28 wraps), return one row per group, each scaled to the whole. The rule is one function, `lib/dialogue/product/answerLayout.ts`, and the real `AnswerCard` (`components/dialogue/live/AnswerCard.tsx`) uses it. The default two-group card is pixel-identical, so no take was re-recorded. The Data viz section carries one frame of the rows layout (a long question, long labels, the page's 225 and 75). The stress page stays as evidence. Reasons in `design/notes/decisions.md`.
- Round 17 item 2 (Mudit's call, Nov 3 2026, delegated): the Clips take is cut and the figure is a still of Ana's clip open under the 225's head line (no cursor). It repeated Every's Mei beat. The four clip videos are deleted, the stills keep the `live-clip` names, and the recorder renders them with `clipstill`. Overrides Round 14's "Clip keeps its poster and timing" and the P16 clip storyboard as a page take; the storyboard stays in the recorder.
- Round 17 item 3 (Mudit's call, Nov 3 2026, delegated): Match the chart is three rows of question and chart with one line under each (a split bar, ranked bars and a flag). Split holds the figure's one cherry and Ranked stays neutral. Overrides Round 11's By group pair and four awkward-shape frames, Round 13b's nested By group pair and the "all four matches" line in P16 round 4; those leave the page (teal-70 has no series on the page until a named second series returns). Reasons in `design/notes/decisions.md`.
- Round 18 item 2 (Mudit, Nov 3 2026): whichever segment is not open steps down to stone-300, in both directions. Overrides Round 10's one-sided recede (the 225 receded to a 35% cherry tint when the 75 opened) and keeps every fill on ramp C.
- Round 18 item 4 (Mudit, Nov 3 2026): there is no Source level. Every quote row is a play button from the start (its clip length is a play chip), and the depth levels are Insight, Chart and People. Overrides Round 14's four levels.
- Round 18 item 3 (Mudit, Nov 3 2026): the first tap in a take lands near 1 second. No pre-roll on Toggles, Every and Counts; the pointer starts beside its first target. Add-only takes keep their empty-chat pre-roll.
- Round 18 item 5 (Mudit, Nov 3 2026): the data viz figure takes its spacing from `--space-1` to `--space-5`. Hovering a stacked bar or a ranked row swaps its counts for percents in one grid cell.
- Round 18 item 6 (Mudit, Nov 3 2026): an info icon that looks hoverable answers on hover and focus, in the existing tooltip chip, in one short line.
- Round 19 (Mudit, Nov 3 2026): the approved section order is Problem, Levels with Clips folded in, Counts, Data viz with Thin data as its closing rule, Shipped, Takeaway. Overrides the earlier separate Clips and Thin data sections and the P15 removal of illustrative-data captions (they are back on every mock figure); Priya and Hearthside are labelled as an illustrative scenario in the Problem's first line, and the Team row is out until names exist.
- Round 20 (Mudit, Nov 3 2026), soft-rule change: the Data viz h2 is 'Charts count people out of their own group'. It overrides the P5 h2 line above ('The AI picks a chart from templates I designed'), which waits in design/OPEN-QUESTIONS.md until the model-or-fixed-rule question is answered. This file is now split into HARD RULES and SOFT RULES.
