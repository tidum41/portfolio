# Taste ledger (read first)

Single source of truth for what Mudit likes, rejects and has settled. Read this before RULES.md, STORY-PRINCIPLES.md and AI-TELLS.md. Art director facts win any conflict. One line per item, newest facts replace old ones in place.

- References: after this file, read [design/references/README.md](references/README.md) (hero findings, portfolio library, career facts).

## 1. Decided (never re-litigate)
- Font: ABC Areal abandoned (Oct 21). Helvetica Neue (Arial fallback) for body and UI; Georgia for headings as currently built (reconfirmed Oct 25). Never mention Areal in briefs or copy.
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
- One neutral figure card: near-white well (#f7f7f5 in light, #1b1e21 in dark), 8px radius, no inset border box (round L, Oct 25).
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
- Didn't: Muse stalled ~2h on one pending approval (round J); check approvals early.

## 7. Open
- Call for Mudit: "version" means two things; suggest product ones become "releases".
- Unconfirmed facts: funnel 100/62/54/42/36, sentiment 2.4/3.1/3.6, mobile 48/41/33, store name Northline.
- Placeholders (3): why version one shipped without sources; why the cutoff sits where it does; what would change his mind about the cutoff.
- Main still at 90beb49; promoting canvas to main waits on Mudit.

## 8. Update protocol
- Every brief, for Muse or any agent, starts with "Read design/TASTE.md first".
- On every approve or reject, edit one line here in the same commit as the change (move it between Likes, Dislikes, Pinned, Open).
- Settled facts go in Decided and are not reopened without Mudit saying so.
- Keep this file under ~150 lines; link to RULES.md sections instead of copying long rules.
- Approved Oct 25 10:55pm: Dialogue round P structure built from Dialogue's customer case studies (Wayfair, Kalshi, Doctronic, Suno): problem, study-wide chat and count bars (shipped), comparison answer, levels of detail, clips in chat, thin-data flags and Add to my plan (concept), with Shipped/Concept status lines and fictional Hearthside mock data.
- Oct 26 2026: Round P (PR #142, fba961b) sent back for fixes. Structure and restore approved; copy must match roundP-final.md, quotes must sit under the side they belong to, and no dark-on-dark text.
