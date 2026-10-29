# Taste ledger (read first)

Single source of truth for what Mudit likes, rejects and has settled. Read this before RULES.md, STORY-PRINCIPLES.md and AI-TELLS.md. Art director facts win any conflict. One line per item, newest facts replace old ones in place.

- References: after this file, read [design/references/README.md](references/README.md) (hero findings, portfolio library, career facts).

## 1. Decided (never re-litigate)
- Font: ABC Areal abandoned (Oct 21). Helvetica Neue (Arial fallback) for body and UI; Georgia for headings as currently built (reconfirmed Oct 25). Exception: DM Sans (Dialogue's real product font) only inside Dialogue product UI mockups (`.dialogue-product-root`), never on case-study chrome (Oct 27). Never mention Areal in briefs or copy.
- Skim rules (Oct 25): every section heading states its point as a plain sentence; headings clearly bigger and heavier than body (e.g. 28/34 medium at 1440, 22/28 at 390) with 64px+ above and 16px below; body paragraphs max 3 sentences and ~65ch; one figure per section with a one-line caption; TOC labels match headings and track the active section; a reader reading only headings and captions must get the whole story.
- Weight: site cap 500; Dialogue UI keeps its real 600. See [RULES standing rules](RULES.md#dialogue-case-study-rules).
- Real study numbers, keep exact: 18/6 coverage, 4 of 24 mobile, 64/31/22%. No invented numbers (Oct 23).
- Answer card has 8 versions; no session or round counts exist, so none are stated (Mudit answers, Oct 23).
- Palette: Dialogue's existing system. Stone-500 #79716b muted, cherry #B43F7F single highlight (r23, Oct 23).
- Figures show his redesigned charts, never Dialogue's real dark text chart (r24 revert, Oct 23).
- Figures are recreations; never say they were built from the product's components.
- Story subject: the answer card's data viz, backed by IBM Carbon research (what helps teams see what, how and why adapted) (Oct 23).
- Lightbox: fits window, no scroll, x close top right matching back button, opens instantly, ~120ms fade (from :3102 preview).
- TOC hidden below 1200px (d400584).
- Hero: richer chart showing counter-evidence; source chips scroll sideways on mobile (round H).
- Process: Muse (muse.ai, Slatt) builds and merges into review branches; approve all Muse requests.
- Process: main needs Mudit's explicit OK. No Vercel previews; local build plus screenshots at 1440 and 390, light and dark (also 1024/768/360 for cut-off checks).
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
- One neutral figure card: warm well (#eceae4 in light via --figure-well-dialogue, #1b1e21 in dark), 8px radius, no inset border box (round L, Oct 25; well locked to #eceae4 Oct 29 so the white panel and its shadow read at 1x).
- The three compare cards are equal height, and the sources avatars are 24px with room to wrap (round L, Oct 25).
- Full-answer screens render at near full size: answer panel 384px, drawer 272px, and the old 640px height cap is gone (round L, Oct 25).
- Chart library cuts: the line and over-time chart, the funnel, rating averages and pies are out. Studies do not run in rounds, so no Round axes remain (round L, Oct 25).
- Chart library adds a participant by theme matrix, a diverging sentiment bar, and evidence-linked bars: every bar opens the quotes and clips behind its count (round L, Oct 25).
- Research figures on the page are limited to the round L set: NN/g counts over percents ("1 out of the 6 participants"), User Interviews 2025 (80% use AI, 91% worry about accuracy and hallucinations), Maze confidence bands (low 1 to 4, medium 5 to 9, high 10 or more), NN/g thematic analysis as coding clustered into themes (round L, Oct 25).
- Problem section describes the real product's summary surface neutrally: prose only, sentiment pills, unlabeled +N badges, no counts or charts, evidence a few steps away on section pages (round L, Oct 25).
- "UX research" casing everywhere, headings and the hero title included (round L, Oct 25).
- overscroll-behavior-y: none on html and body, so the page does not bounce on scroll up (round L, Oct 25).
- Decided: every Dialogue UI and chart must match what Dialogue really measures; audio/transcript UI uses the real WaveformIcon.
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
- Oct 28 2026: video controls live on the visual's background container, never on the product UI (play button 8px from the well's top right, as BruinLease's PhoneMockup).

## 2. Likes
- Glass-bar video player with Paper skip labels (r19 to r24, b056865).
- Dialogue logo avatar on transcript rows (b056865, public/dialogue/dialogue-avatar.svg).
- "Add to my plan" beat in the thin-data section (b056865).
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

## 3. Dislikes / rejected
- Left accent bars on cards: reads as AI.
- "Ugly box" around figures.
- Icons on people, insight or quote rows (52307c1 round G added, round H removed).
- Anything cut off at any width, 360 included.
- Vibe-coded surface variants; one surface system.
- Needless 0 to 100 scales, stray labels; unexplained units (pts must be explained).
- Cutting the chart library to "one strong comparison" (1cc9b29, round A): overruled, he wants several complex charts.
- Status chips on library pairs; use pros/cons.
- Hover states on figures.
- Copywriting voice; he wants plain, specific site voice.
- Any "full detail" chart variant: rejected, all removed (round L, Oct 25).
- Arrow animation on pager previous/next: remove (Oct 25).
- Rejected Oct 25: round L (PR #134, 9ab2166): hero too complex, text dense, invented version table and chart library UI not grounded in Dialogue.
- Rejected Oct 25: round O (PR #137, ec4e020): visually off the Dialogue system and dropped what already looked good (pinned b056865 figures, player, chart cards); also read as a chronological recount, not an intentionally framed story.

## 4. Pinned approved versions
- b056865 is the round P4 base: restore its Dialogue components and figures, then port the approved story onto it. Build only from [SYSTEM-COMPONENTS.md](SYSTEM-COMPONENTS.md); new components need Mudit's OK (Oct 27).
- b056865 (Oct 23 05:36 PT, cursor/dialogue-figure-parity-b9b1): r19 to r24, player, logo avatar, Add to my plan, full chart library. Restored into canvas via PR #122.
- 21cf2e8, bb55313, de1cfe5: lightbox fixes. d400584: TOC breakpoint.
- 843faac (PR #124, round J): canvas base before the taste ledger (08f90a4); passes b056865 ancestry; verdict FIX FIRST (see Open).
- Restore check: `git diff b056865 -- components/dialogue/DialogueInterviewPlayer.tsx components/dialogue/DialogueChartLibrary.tsx components/dialogue/product/chart` should be empty unless intended.
- Approved Oct 25: direction A decision log per /workspace/research/directions/outline-A.md; one decision per section, ~700 words, ends on what he'd test next.

## 5. Case study language
- Sentence case for all headings (Oct 25). No em dashes. No dot separators. US spelling.
- Never the word "priority"; say where it works and where it doesn't.
- Banned patterns: lists of three, "not X but Y" (max one per page, prefer zero), "The cost is" leads, buzzwords per [AI-TELLS](AI-TELLS.md).
- Name a cost next to its win, but not with "The cost is" phrasing.
- Missing evidence admitted where the claim is made; no metrics claimed.
- Headings are claims; first person owns decisions. See [STORY-PRINCIPLES](STORY-PRINCIPLES.md).
- Glossary: "version" = one of the 8 answer card designs. Product iterations of Dialogue should be "releases" (proposed, awaiting Mudit).
- Glossary: "study" = one research study; avoid "round" and "session" in chart titles and chips (round J).
- Glossary: "recreated" labels any figure rebuilt without a surviving asset (version one table).
- Names: each persona does one job; Sam R. must not be both counter-evidence and the struggling user.

## 6. What worked / what didn't
- Didn't: story rounds A to G built on an r18 base, so r19 to r24 never reached canvas (regressions audit, Oct 23). Fix: ancestry gate before every round.
- Didn't: agents re-raising Areal after it was dropped. Fix: this file.
- Didn't: a reply's suggestion (one strong comparison) overrode Mudit's ask. His asks beat agent critiques.
- Didn't: RULES.md line requiring row icons (round G) codified a mistake; rules must follow approvals, not builds.
- Worked: restore by merging the approved branch, take-theirs on approved files, hand-merge CSS (PR #122).
- Worked: local build plus 10 width/theme screenshots and a cold critique per round (shots/j/critique.md).
- Worked: visible [PLACEHOLDER] markers instead of invented facts.
- Didn't: rounds M to P3 described figures freehand in briefs (raw hex/px, "rebuild as a toggle"), so Muse built new components and dropped the b056865 set; check:dialogue-tokens passed because it skipped globals.css. Fix: briefs name system components only, new UI needs approval, and `npm run check:dialogue-system` (lint, allowlist, 640 lock) must pass before any fix-list review (Oct 27).
- Didn't: Muse stalled ~2h on one pending approval (round J); check approvals early.

## 7. Open
- Call for Mudit: "version" means two things; suggest product ones become "releases".
- Unconfirmed facts: funnel 100/62/54/42/36, sentiment 2.4/3.1/3.6, mobile 48/41/33, store name Northline.
- Placeholders (3): why version one shipped without sources; why the cutoff sits where it does; what would change his mind about the cutoff.
- Main still at 90beb49; promoting canvas to main waits on Mudit.

## 9. Motion (demo videos)
- One storyboard per clip: 4-8 s (cap 9), one or two interactions, 0.8 s pre-roll, about 1 s hold after each beat, 1.2-1.8 s final hold.
- UI moves in 300-450 ms with cubic-bezier(0.2, 0, 0, 1). Heights grow with the tapped element pinned; closing fades first, then folds; nothing pops.
- Large fades (a player, a panel) use a symmetric ease so no single frame carries the change. No hard cuts and no scroll snaps; a needed scroll is a slow ease-in-out.
- Cursor only when the click is the point: about 28px on the page, fades in near the target, glides 500-700 ms, presses at 0.92, fades out.
- Crop to the decision at 1:1 or 4:3. Only the hero shows the panel header. Smallest text renders at 12px or more at 1440.
- Loops close: collapse back to the start or crossfade 400 ms into the first frame. Posters show the held, open state.
- Record from the live code stage (/dialogue/motion) at 2x; every take passes scripts/check-dialogue-motion.py (no frame jump over 20, holds within limits, loop closes) or is re-recorded.

## 8. Update protocol
- Every brief, for Muse or any agent, starts with "Read design/TASTE.md first".
- On every approve or reject, edit one line here in the same commit as the change (move it between Likes, Dislikes, Pinned, Open).
- Settled facts go in Decided and are not reopened without Mudit saying so.
- Keep this file under ~150 lines; link to RULES.md sections instead of copying long rules.
- Approved Oct 25 10:55pm: Dialogue round P structure built from Dialogue's customer case studies (Wayfair, Kalshi, Doctronic, Suno): problem, study-wide chat and count bars (shipped), comparison answer, levels of detail, clips in chat, thin-data flags and Add to my plan (concept), with Shipped/Concept status lines and fictional Hearthside mock data.
- Oct 26 2026: Round P (PR #142, fba961b) sent back for fixes. Structure and restore approved; copy must match roundP-final.md, quotes must sit under the side they belong to, and no dark-on-dark text.

- Decided (P5 spine, Mudit, Oct 27 2026): Dialogue's story is 'Redesigning the answer so research teams can surface insights quickly, at a level of insight that doesn't lose detail.' Tension is speed versus depth. Counts, levels, clips and thin flags are each framed as a way to get the answer fast without losing the detail behind it. Not 'shows how many said it and lets you hear them.'
- Decided fact (Mudit, Oct 27 2026): Dialogue's AI chooses the chart type per answer, constrained by chart templates and guidelines adapted from IBM Carbon. It matches a template to the query and the level of detail wanted, with rules for edge cases such as thin data. The data viz section tells this; the chart library pairs are the templates. Write it plainly, no slogan.
- Decided (P5 h2s, Oct 27 2026): problem h2 is 'Teams needed answers fast, and the detail got lost'; data viz h2 is 'The AI picks a chart from templates I designed'.
- Decided (Mudit, Oct 27 2026, round P9): default answers show the count and the insight only, with no quotes; quotes surface only when the reader taps a side of the count (e.g. 75 unsure opens SideSample). Every quote row in the UI carries the Paper WaveformIcon row (`dp-clip-quote__who`, as in ClipQuotes), never a Lucide icon.
- Rules for P10 onward (Mudit, Oct 28 2026; guidelines, not laws: follow a stronger move from Rachel Chen or another top case study and note why):
  - Tell a real story with uneven pacing: most sections are quick builds, one or two carry the big turn; never repeat the same tried, changed, kept beat.
  - Prove it with real work, not statistics; impact means what I'd track, what teams might report, and where the gaps are, with no usage results claimed.
  - One spine: research teams surface insights quickly without losing detail.
  - Plain, technical language: problem, then decision, then what I built; the opening stays short under its own header.
  - Ground visuals in the real product and its light-mode tokens (dialogue-product stills, dialogue-anim run2 styles); invented Hearthside data only, nothing confidential.
  - Mine Dialogue's customer case studies (dialogue-site.md) for what data to show and where the current chat falls short.
  - Tight layouts: mobile compact, not desktop stacked tall; sections read as clearly separate.
- Motion (Mudit, Oct 28 2026): simple looping demos in the real components (CSS, no Remotion), timed to the measured recording in /workspace/dialogue-anim (hard-cut swaps, 300 ms 0.5 to 1 enter, 1000 ms linear spin, about 137 chars/s stream, cards land whole with a ~133 ms scroll ease-out); static final state under prefers-reduced-motion.

- Levels turning point (Mudit, Oct 28 2026, his words): "I assumed that honing in on the smallest levels of detail might be useful, but this might not be feasible and efficient for teams, rather optional." Depth is optional and opened by the reader; it is the page's one stated reversal and lives in Levels.
- P14 (Mudit, Oct 29): levels-every is cursor-driven (click 225 then 75, same as counts-open). Selected depth chip stays stone-200. Hero Team metadata is a visible [PLACEHOLDER]. Recorder captures PNG so the video well matches `#eceae4` / `#1b1e21`.
