# Dialogue iterations

Distinct rounds only. No per-patch entries. Newest first. Previews are behind Vercel auth. Each URL is the deployment of the commit named in its entry, or of the tip of the push that carried it where noted.

## Round P3, Oct 26 2026 (audit fix round on the approved structure)
- Base: review/dialogue-canvas at bf2b3d4 (contains 7c91898 and b056865, both checked with merge-base), with PR #142's two commits cherry-picked clean (round P plus its roundP-final fixes). Branch review/round-p3, PR into review/dialogue-canvas, not merged. No Vercel; validated locally on a fresh production server.
- Levels of detail is rebuilt as one 448 panel: a three-step toggle (Text only, Direct quotes, Answer and evidence) over the deepest step's content, so the panel holds one height, nothing clips from 360 to 1440, and nothing scrolls sideways (the three-card row clipped its third card by 11px at 1440 and ran to x 922 at 390). The Chosen badge goes; the toggle's active step carries the choice.
- The selected bar segment now reads: segments sit 2px apart, and the selected one takes a 2px ink ring at a 1px offset (measured contrast 16.9:1 in light, 13.1:1 in dark, against the 1.59:1 the audit measured for the old 1px stone-500 outline). The ring is the system's --dp-ink, so it flips with the theme.
- Dark mode: product panels go dark with the site. html[data-theme="dark"] repoints the --dp tokens (panel #26292e on the #1b1e21 well, ink #f4f2ef, muted #a8a49e); status lines take #a8a49e in dark. No light panel sits on the dark well anywhere on the page.
- Hero: the clip collapses to a thumbnail beside Mei's card, the composer is gone, and the figure takes the standard 640 frame like every other figure (no drop shadow; panels inside frames lose theirs). The frame measures 490px at 1440, down from about 795. The bar stays the headline number, and because Mei's quote sits under it, the 6 segment is ringed in the hero and in Levels so she reads as the other side.
- Counts opens one side only: the 6, with Owen's card. The composed quotes are cut (Nadia in Counts, Jen in Thin data, per Mudit's Oct 26 call): Counts shows no 18-side quote, and Thin data shows exactly two neutral participant rows behind its count of 2. "Add to my plan" is 66px in panel space, 43px rendered at 390, with room before the prompt.
- Comparison: no status line (per the Oct 26 TASTE line), the rows move into the shared 448 panel, row labels shorten to First-time and Repeat so nothing wraps, and the body says plainly that the rows measure different claims. Problem's two lists of three are cut to two (the case-study asks, and the before chat's themes, whose labels now match the summary table's). The Thin prompt's three-part instruction is cut to two. Clips becomes the turning point: "Playing the clip in place kept the answer in view", opening on the cost of linking out, with Mei framed as one of the six. Captions state their insight and end with a period; the Thin body uses "2 of 5" and "grey line" to match its figure.
- Panel type is held to 15/14/13/12: the prompt renders at 13/18, toggle steps and the Beta badge at 12, rows and labels at 13.
- Validation: production build, typecheck, check:dialogue-tokens (73 files) and check:site-mobile pass; the P3 Playwright pass over 1440/390 in light and dark plus 360/768/1024 cut-offs passes with docW 375 at 390 and zero in-panel scrollers. Two defects were caught in screenshots and fixed before pushing: the focal segment had lost its cherry fill in the rebuilt figures, and the hero/levels thumbnails pointed at a wrong asset path.
- Preview: none (local validation only, per brief)

## Round P, Oct 25 2026 (restore-first rebuild on the approved structure, Hearthside mock data)
- Base verified: review/dialogue-canvas at e6a8d70 (TASTE: approve round P structure), with b056865 confirmed as an ancestor before building. Branch review/round-p, PR into review/dialogue-canvas, not merged. No Vercel; validated locally.
- The page is rebuilt to the approved structure: hero, Problem, Study-wide chat (Shipped), Counts (Shipped), Comparison (Concept), Levels of detail (Concept), Clips (Concept), Thin data (Concept), and the takeaway. Figures, the player and the chart cards are the pinned b056865 set, restored rather than reinvented: `git diff b056865` for DialogueInterviewPlayer.tsx is empty, and for product/chart it is only the round K full-width divider (already on canvas), one `selected` data prop on ChartStackedBar, and the outline rule below. No chart library, no new chart types, no amber, no left accent bars, no hover states.
- All figure data is the fictional Hearthside study (lib/dialogue/product/hearthside.ts): "Checkout signals", 24 interviews, segments 9/10/5. The only numbers in figures are 18 of 24 and 6 of 24 (Friday reading), 6 of 9 and 7 of 10 (comparison), 9 of 24 with its 4/3/2 segment split (price doubt, bars scaled to 24), 2 of 5 (thin data), and the given timecode ranges. Clip thumbs use participant photos, not product screenshots, so no other study's data shows in a frame.
- Hero: title, the role line, and the customers line, then one layered figure: question bubble, the answer sentence as the chart title, the 18 of 24 stacked bar, and Mei's quote card (18:27-18:49) tapped open into the player. Problem keeps the decided heading and body, cites the six needs from Dialogue's case studies (Wayfair, Kalshi, Doctronic, Suno), admits the deep dive was desk research (NN/g, Maze, User Interviews, IBM Carbon) with no interviews, and its figure is the before chat in Hearthside data (emoji theme list, "How many mentioned this?" answered with the clarify deflection, a raw-text name table), captioned exactly "Recreated with invented data".
- Study-wide chat is the header pair only, the per-interview header muted. Counts opens both sides: the 6 of 24 segment carries the 1px stone-500 outline (the chart system's own --dp-chart-muted), with Mei and Owen's cards under "18 of 24" and a plain restatement under "6 of 24 did not"; no quote was supplied for the six, so none is fabricated. Comparison is one row per segment (count bar, quote card, clip). Levels of detail is three equal-height specimens (Text only, Direct quotes, Answer and evidence, with the decided cost lines), 2+1 at 1440, a scroll row with a 24px peek at 390, and the evidence specimen in dark via a .dp-force-dark token block; inside that narrow card the stacked bar's labels move to a legend line because the 6 of 24 label cannot fit its segment width.
- Clips: the price-doubt answer with its segment split, Aisha's card (15:40-16:02) tapped open into the player, and a synced transcript whose active line is her verbatim quote; the moderator's two questions are composed for the recreation. Thin data: the flag is a stone-500 line, "Early signal, 2 people", in the answer; the Add to my plan beat is shown from the tapped button to the copied prompt (Hearthside text, 2 of 5 the only count); the section closes on what he would test next, with no metrics.
- Type and layout: claim headings in Georgia at 28/34 (22/28 at 390), 64px above and 16px below; body at most 3 sentences per section; status lines are 13px stone-500 directly under the heading in sections 2 to 7. Figures lock to the 640px column in the neutral well; chat figures scale the 448px panel to fit (hero capped 560 at 390, the rest 520, the levels figure included), nothing cut off from 360 to 1440. Takeaway: a 1px rule with 96px above it and the decided sentence. TOC labels are short, the TOC tracks the active section, and the first label's cap top equals the hero h1's cap top (ink-measured, delta 0): on /dialogue the back link sits absolute in the 48px above the aside, its foot on the nav's bottom edge, and the list starts at the aside top.
- Copy note: roundP-final.md was not in the repo or this environment, so the body copy was composed from the brief's facts and the decided lines in TASTE (the problem heading and body are the decided text verbatim; the clips and thin-data headings are the decided ones). It follows STORY-PRINCIPLES and AI-TELLS: claims as headings, a cost named next to its win, the missing interviews admitted in the problem section, no lists of three outside the takeaway, no "not X but Y", no em dashes.
- Validation: production build, typecheck and check:dialogue-tokens (73 files) pass; check:site-mobile passes; a 53-check Playwright pass over 1440/390 in light and dark plus 360/768/1024 cut-off checks all passes; the page text greps clean for em dashes and for Northline study content.
- Preview: none (local validation only, per brief)

### Round P fixes, Oct 25 2026 (same branch, PR #142 updated)
- Copy now matches roundP-final.md (supplied after the first push) exactly: its headings and body text in every section, the hero body paragraph restored, the hero caption is "One answer, its count, and the clip behind a quote." with no label, the hero and counts question reads "How did shoppers read 'Arrives by Friday'?", and Problem loses the six-item needs list and the extra paragraph the first push had added. The final doc also settles the mock data: the six "asked which Friday or checked the date", so Owen's card moves to the 6 of 24 side (selected, outlined, shown open) and the 18 side gains a composed quote (Nadia, 05:12-05:28, "I just read it as this Friday."), flagged here because the doc supplied no 18-side quote. The before chat's themes are now delivery fee at cart, unclear Friday promise, returns hidden, with Aisha's card in the first turn; on phones that turn clamps to two themes and the table to one row.
- Clips is rebuilt on the Friday moment per the final doc: Mei's card tapped open into the player with a three-row transcript (her line active); the price-doubt split leaves this section (Aisha's card now grounds the problem figure). Thin data gains Jen's quote card (text composed; the doc gives her timecode and the finding only), and the copied prompt is rewritten so the page holds zero "not X but Y" constructions ("The count is small, so treat it as a lead.").
- Comparison: rows are ChartBarList bars ("First-time, free returns 6 of 9", "Repeat, arrives by Friday 7 of 10"), and the clip thumb is a small thumb beside the quote at every width. Text that sits directly on the well (segment labels, bar values) uses the site's theme text tokens, so in dark mode it reads light on the dark well instead of dark on dark.
- Levels of detail: at 1440 the three specimens sit in one row, equal height, no empty cell, all in the page's light treatment (the forced-dark specimen is gone; the chosen specimen keeps the canvas Chosen badge). At 390 the scroll row no longer clips the first card: the negative margins are gone, the row pads inside the well, and the first card starts fully visible with the next peeking.
- Study-wide chat at 390 no longer scales: the two headers stack at normal type size (the flex-basis that sized them as columns is released on phones, with a specificity raise because the CSS bundler reorders media rules). The figure is about 120px of headers, 184px framed.
- Validation: production build, typecheck, tokens and site-mobile pass; the fix-round Playwright pass (1440/390, light and dark, cut-offs, exact-copy greps, a "not...but" count of 0) passes; every figure is within its 390 cap (hero exactly 560).

## Round L, Oct 25 2026 (critique fixes, chart library rebuild, Georgius figure discipline)
- Base verified: review/dialogue-canvas at 35d3635 (after round K, the nav and footer pass, TASTE #129 and the About spec sheet), with b056865 confirmed as an ancestor before building. Branch review/round-l. No Vercel; validated locally.
- Critique fixes: the footer X link target is at least 44 by 44 (it was 10px wide). The three compare cards are equal height at desktop widths (479px each at 1440) and the sources avatars grow to 24px with room to wrap. Every remaining "full detail" chart variant is removed. The "lead to check, not a finding" line is deleted. "UX research" casing everywhere, the hero title included.
- Figures: every figure locks to the 640px text column, and the figure card is one neutral system: near-white well (#f7f7f5 light, #1b1e21 dark), 8px radius, no inset border. The full-answer screens render at near full size (answer panel 384px, drawer 272px, the 640px height cap lifted, anatomy and full-answer scale floors lowered so the narrower column never crops them).
- Chart library: the line and over-time entry is cut (studies do not run in rounds, and no Round axes remain on the page), the funnel entry is cut, and the groups entry keeps only its dot plot on one shared scale. Added: a participant by theme matrix drawn from the worked example's mock study (each column adds up to the matching bar), a diverging sentiment bar (frustrated and happy counted on either side of a center line, the mixed count named under it), and evidence-linked bars as a rule (the address bar shown open over the study's real quotes and clips). Each entry gains one plain "why it is here" line backed only by the round L research figures (NN/g counts over percents, User Interviews 80% and 91%, Maze confidence bands, NN/g thematic analysis), and the Data shape, Encoding and Tradeoff lines are rewritten in plain language as What goes in, How it reads, Where it falls short. The worked example's mock study is now 15 participants so its counts read "N of 15".
- Problem section rewritten from the real product screens: the summary is prose only, with sentiment pills, unlabeled +N badges, no charts, counts, quotes or clips, and the evidence a few steps away on section pages. The deck claim is softened to "answers are easy to share". The thin data section gains the Maze confidence bands next to the 4 of 24 rule.
- Global: overscroll-behavior-y: none on html and body. The /dialogue footer gap measures 120px at 390 on this build, the same measure as every other page. design/TASTE.md gains one line per round L decision, and the sentiment-axis call leaves Open because the line chart is cut.
- Preview: none (local validation only, per brief)

## Round K, Oct 25 2026 (TASTE decisions: depth section, research-based library, continuity)
- Base verified: review/dialogue-canvas at a18e429 (PR #126), with b056865 confirmed as an ancestor before building. Branch review/dialogue-round-k. No Vercel; validated locally.
- Hero and problem: the title is now "Interactive insights for UX Research teams". The problem heading and body are Mudit's Oct 25 text. The why-it-matters section and its Benjamin and Justin paragraph are removed.
- New section "Bringing more depth to answers" holds the three-way compare (the old comparison section, renamed). Labels are Text only, Direct quotes, and Answer and evidence, with Mudit's captions. The quotes card gains a View session action. The chosen card's sources row scales: three initial avatars, a "+15 more" control that opens the list, and the count stated as 18 interviews.
- Anatomy: annotation numbers now sit on one shared alignment at the rail's right edge (labels render number-last). The 360px clip-thumbnail overflow is fixed by letting the thumbs flex inside the anatomy scene (the 16:02 thumb ran 4px past the card in both themes).
- One structure is now "Structuring responses to set up further inquiry" (non-linear inquiry, mental models). Clips is now "Viewing responses directly within the chat window", and its figure caption says plainly what the viewer sees. Thin data is now "Adding signals for unclear data and results": the low-signal note and both paragraphs rewritten to one clear point each, the real 4 of 24 kept.
- Chart library is now "Data visualization". New lead entry, themes by participants, is a worked example: the prompt as typed, mock data with participants and clips per theme (marked as mock), and the sorted bar chart it produces. The dropoff entry drops its full-detail variant and keeps the simplified funnel, with the verdict that funnels stay for task flows only. The coverage pair is combined into one diverging bar showing 75% and 25%, counts in front of percents. Group and trend copy is rewritten in plainer language; the group entry names the participant by theme matrix as the participant-level form.
- Full answer: a second screen shows the same answer after Jordan M.'s source is tapped, the tap marked on the pill and the drawer opened on his clip. The section copy points at it.
- Sam split: counter-evidence's third participant is now Alex P. (Sam R. stays the struggling user in the clips and the quotes card). The remaining lists of three in page copy are removed (role decisions, follow-up evidence line, the room learning). The chart card title divider now runs the full width of the card. The pager arrows no longer animate on hover. TOC labels are short. The three placeholders stay.
- Why: Mudit's round K brief and the Oct 25 decisions in design/TASTE.md, which this round also updates (round K fixes moved out of Open; Alex P., the shared alignment, and the full-width divider recorded as decided).
- Preview: none (local validation only, per brief)

## Round J, Oct 23 2026 (visual fixes, wording pass, Carbon moves up)
- Base verified: review/dialogue-canvas at de98f47, with b056865 confirmed as an ancestor (git merge-base --is-ancestor) before building.
- Visual: below 768px the anatomy and full-answer figures lose their height cap and fade, so the clips drawer, follow-ups and the Marcus W. chip show in full; the follow-up figure's dot values no longer run past the chart card edge at 360; the transcript scroll button gets a gutter at phone widths instead of covering a line; in dark mode the counter-evidence block's names and header flip light (it is the one block sitting bare on the dark frame well) and the version table stays white; paragraphs after figures start 24px clear of the caption; on phones the evolution stacks two, three, eight.
- Version one table: the figure itself is now labelled "(recreated)", and the recreation is denser (drop column, a behind-mobile column, a third sentiment table, tighter rows, two plain summary notes) so it backs the "long, hard to glance at" claim.
- Facts: "a line I drew by feel" is cut. Kept and flagged to Mudit as unconfirmed: the funnel values, the sentiment scores, the mobile funnel, "headed into slides and reports", the Benjamin and Justin both-rooms line, and the name Northline.
- Wording: "round" and "session" are out of chart titles, chips and figure verdict copy (Sentiment over time, Change over time, Compare to the first study); Sam T. becomes Sam R.; US spelling throughout the page copy; "no chart carries a legend" becomes "no shipped chart", since the fuller first drafts carry legends. The sentiment axis labels still read Round 1 to 3 in the data; flagged in the PR.
- AI tells: the three "The cost is" leads are rephrased, the second "not X but Y" (attention belongs on the answer) is cut, and the problem section's adjective triad is trimmed to two.
- Story shape: the Carbon and data viz section moves up to sit directly after the evolution, gains a beat on what research teams need to see, and the page closes by returning to the hero card as the win. The three placeholders stay.
- Why: Mudit's round J brief. Validated locally at 1440, 1024, 768, 390 and 360 in light and dark; no Vercel.
- Preview: none (local validation only, per brief)

## Round I, Oct 23 2026 (the answer card's data viz, told as eight versions)
- Changed: base is review/dialogue-canvas with the restored r24 work merged (PR #122); the player, the Paper avatar, Add to my plan and the four-entry chart library all stay. The story is reframed around the answer card's data viz and told non-linearly: the page opens on the finished card, the lead rewinds to version one, and the problem section now shows version one itself, a plain black and white markdown table recreated from the study's own numbers (no asset survives in the repo; the recreation is listed in the round report). The comparison becomes the evolution: versions two, three and eight, each with a where-it-works and where-it-doesn't line, and the word "priority" is gone. The chart section now cites IBM Carbon inline (zero baselines for bars, a cropped axis for the sentiment line, labels on the marks, the answer sentence as title, the peak annotated), names the palette bend (stone plus one cherry mark in place of 14 colours) and Dialogue's own addition (the evidence count gates the chart). The changed-my-mind learning is retold on the restored library's full-detail chart instead of the retired bubbles.
- Placeholders: the session and round counts and their sentence are deleted per Mudit's answers, and the card version count is stated as 8. Three placeholders remain: why the first version shipped without sources, why the cutoff sits where it does, and what would change his mind about the cutoff.
- Mobile: the source chips in the live answer moments wrap at phone widths instead of scrolling, so no name is cut mid word (the segment answer clipped "Marcus W." at 390).
- Why: Mudit's round I brief, with his own answers for the reframe, the first try, the grouping move, the sequencing, and the Carbon mapping. Validated locally; no Vercel.
- Preview: none (local validation only, per brief)

## Round H, Oct 23 2026 (hero answer with counter-evidence, no cut-off charts, mobile evidence rows)
- Changed: PR #120 merged first (moment charts shrink at 390). The icon rail came out of the two query-answer moments. The hero is now one full-width query-answer moment: the checkout question answered with summary, sources and the five-step funnel on the supporting side, and the 18/6 coverage split, the counter-evidence block and the thin mobile slice (4 of 24) alongside it, then a clip and follow-ups, real study data only. On mobile the source chips run in one sideways-scrolling row, the search step's found label is shortened to "moments" and its padding and type tighten so the line wraps to at most two lines, and counter-evidence quotes wrap instead of ellipsising. The comparison trio stacks at 940px and below (chosen first) because at 768 the third panel's text clipped at the frame edge.
- Why: Mudit's round H feedback on round G. Validated locally at 1440, 1024, 768, 390 and 360 in light and dark; no chart, value or label cut off.
- Preview: none (local validation only, per brief)

## Round G, Oct 23 2026 (story restructure and query-answer moments)
- Changed: the story is rebuilt on a 7-move plan, 14 claim headings. The opening splits into what Dialogue is, the problem, why it was hard, and a first-person role heading. A lead line after the hero points at the final answer and names the hidden problem, a confident chart over thin evidence. Why-it-matters carries the trust counts as visible placeholders where Mudit has not supplied them, and counter-evidence gets its own section with the real counter-evidence block. The comparison is told as a sequence (paragraphs, quote list, structured answer) with one prioritised line per option. Clips and follow-ups each gain a ruled-out unit. Thin data is the climax: the 4-of-24 rule, the 18-of-24 case rebuilt as a full query-and-answer moment, and visible placeholders for where the cutoff sits and what would move it. "One answer, start to finish" is renamed to a claim about follow-ups keeping their evidence, and the reflection is replaced by two learnings (cut a chart before a source; changed my mind about chart weight). Two new DialogueQueryMoment figures (segment breakdown, coverage) render a real question as Dialogue's answer card with its evidence trail, trail steps marked with BruinLease Phosphor icons. Chart craft raised: library specimens share a height, the inner chart card radius is concentric with the specimen frame, and secondary colors are the exact DS stone-500 and cherry values.
- Why: Mudit's round G brief. Counts and reasons he has not supplied stay as visible [PLACEHOLDER: ...] markers, never invented. No Vercel preview this round, per the brief; validated in a clean local production build at 1440 and 390, light and dark.
- Preview: none (local validation only, per brief)

## Round F, Oct 23 2026 (two copy fixes)
- Changed: the thin data summary now reads "when autofill skipped the apartment field", lowercase, sentence case like the rest of the figure copy. The follow-up drawer now keeps one story for its counts: the search line reads "Searched 24 interviews, found 18 address moments" (QuerySearchStep gained an optional found label), the footer stays "Based on 18 of 24 interviews", and the clips line reads "Clips from 18 interviews at the address step", all agreeing with the coverage figure's 18 of 24.
- Why: Mudit's round F check found a capitalised Autofill mid-sentence and three count lines in the filtered answer that mixed moments and interviews and repeated the parent answer's search line. Verified in a clean local production build with Playwright at 1440 and 390, light and dark.
- Preview: PREVIEW_URL (deployment of the round F commit on review/dialogue-story-f, merged into review/dialogue-canvas)

## Story depth, Oct 23 2026 (round E)
- Changed: five surface-level spots now carry their reasoning. The problem body says where the answers were headed, slides and reports, and what an untraceable claim costs there. The structure body argues the sequence, sources ahead of the chart because the reader should meet the interviews before the shape. The drop-off annotation rows are renamed from spec labels to the decision itself: first reach, why it failed, tradeoff. The thin data body says why the count is the honest unit, a count cannot look like more than it is. The full answer body names the rejected default, a follow-up starting over with a fresh answer, before the drawer behaviour. Five questions the page cannot answer from the repo were flagged to Mudit instead of being written around: why the original chat shipped without sources, where the thin line sits, whether a regenerating follow-up was ever watched, whether a sixth part was cut, and what was tried for the room problem.
- Why: round E judged the story only, as a hiring manager with four minutes. Verified in a clean local production build with Playwright at 1440 and 390, light and dark: all five replacements live, gaps still exactly 48px, cognitive science still appears once, no horizontal overflow.
- Preview: PREVIEW_URL (deployment of the story depth commit on review/dialogue-story-e, merged into review/dialogue-canvas)

## Light check fixes, Oct 23 2026 (step D)
- Changed: the numbers now reconcile. The checkout answer finds 18 relevant moments in the hero, the trio, and the anatomy source line, matching the 18 of 24 interviews behind the address finding in coverage. The full answer follow-up is retargeted from mobile only to the address step only, so it no longer collides with the thin data mobile answer: its footer reads "Based on 18 of 24 interviews", its search step finds 18 moments, and its chart is the checkout funnel with the address step focal. The counter evidence quotes are now about the address step going fine, matching the "3 had no trouble with address" summary. The hero "-38% drop" tooltip is gone, and the drop is stated as 38 points in the summary and the chart note. The lead comparison now shows the user's question, "Where did people drop off in checkout?", in a user bubble above the three options. Compound modifiers are hyphenated again across the prose, the meta line about a second answer on this page is cut, and the hero dates are spelled out in both places, "December 2025 to March 2026".
- Why: Mudit's light check of cbcfd91 found the contradictions between figures. Verified in a clean local production build (server killed first) with Playwright at 1440 and 390, light and dark: no "-38% drop" anywhere, no "found 9", no "Based on 24 of 24" on the filtered answer, gaps still exactly 48px, no horizontal overflow.
- Preview: PREVIEW_URL (deployment of the light check commit on review/dialogue-story-d, merged into review/dialogue-canvas)

## Cold critique fixes, Oct 23 2026 (step 3)
- Changed: the problem section now shows the problem state, the wall of text answer as a captioned figure, instead of only describing it. The counter evidence claim moved from the structure section, whose figure does not show it, into the why it matters body next to the trio panel that does. The reflection closing sentence is rewritten so it parses. The chart section body no longer narrates where coverage sits on the page, the thin data opening sentence is simplified, and the coverage paragraph no longer repeats its caption. The clips caption spells out the card that failed instead of the shorthand "card-failed quote". The drop off tradeoff line names a real cost: bars rank the steps and nothing more, and why people quit still has to come from the clips. At 600px and below the lead comparison stacks with the chosen panel first.
- Why: a cold critique of the story build against STORY-PRINCIPLES.md and AI-TELLS.md, reviewed as a hiring manager would read it. Verified in a clean local production build with Playwright at 1440 and 390, light and dark: all seven section gaps still measure exactly 48px, desktop trio order unchanged, chosen panel first only on phones, no horizontal overflow.
- Preview: PREVIEW_URL (deployment of the cold critique commit on review/dialogue-story-c, merged into review/dialogue-canvas)

## Story build, Oct 23 2026 (story and copy first, then craft fixes)
- Changed: full story and copy rewrite in first person (claim headings in sentence case, a why and its cost per decision, the missing customers admitted in the body, cognitive science used once, in the structure section). Eyebrow now matches the metadata dates and the subtitle says what the work is. Chart library cut to the drop off pair only; groups and change over sessions pairs removed, coverage moved into thin data as its own captioned figure. The repeated anatomy list is cut, the anatomy figure and the hero now carry the standard caption, and the Limit line is replaced by a text only Reflection section, "What I did not solve". The dead outcome margin rule is removed so the section gap keeps one owner. STORY-PRINCIPLES.md and AI-TELLS.md gained the missing tests: cost in the same breath as the win, admit what was not had, count steps and options instead of metrics, "not X but Y" at most once per page.
- Why: Mudit approved the round 1 and round 2 review fixes on Oct 23. Verified in a local production build with Playwright at 1440 and 390, light and dark: every section gap measures exactly 48px, figure left edges sit on the text column at both widths, the pair stacks at 390 with its notes below both charts, and no horizontal overflow. On this base the hero already used the dark well token and the trio line already sat above its figure, so those two fixes needed no code.
- Preview: PREVIEW_URL (deployment of the story build commit on review/dialogue-story-b, merged into review/dialogue-canvas)
## r24, Oct 23 2026 (text chart reverted, library and anatomy fixes)
- Changed: designed charts back in product figures (r23 palette kept), hero hover restored, question bubbles on the lead compare with a bar chart on the chosen card, anatomy zoomed with real-size labels, lightbox fits the viewport, Paper avatar on Dialogue transcript rows, Phosphor pros and cons icons, a busier first draft for the dropoff pair, new chart title treatment, equal-height concentric library frames.
- Why: Mudit's r24 notes, ledger DLG-99 to DLG-113.
- Preview: none, local build only (no [preview] tag)

## r23, Oct 23 2026 (color pass)
- Changed: chart fills limited to stone-500 plus cherry, stacked bars on stone-500 and stone-600 with white labels, 1px stone-200 card border in light mode, product figures show Dialogue's own text chart (dark block and markdown table) instead of designed charts.
- Why: Mudit's r23 color pass, ledger DLG-95 to DLG-98.
- Preview: none, local build only (no [preview] tag)

## r22, Oct 23 2026 (Agentation notes)
- Changed: skip labels centred in their circles, chart library judged by pro and con lists instead of status chips, full answer gets a lead, supporting and quote hierarchy. No chart colors changed.
- Why: Mudit's r22 notes, ledger DLG-92 to DLG-94.
- Preview: none, local build only (no [preview] tag)

## r20, Oct 23 2026 (Agentation notes on 160151d)
- Changed: anatomy callouts scale with the UI and the composer is DS height, interview player rebuilt from the Paper export with a mirrored skip back, chart library pairs now richer first draft versus simplified chosen, dot plot and stacked bar primitives for variety, DS button for Add to my plan.
- Why: Mudit's r20 notes, ledger DLG-86 to DLG-90.
- Preview: none, local build only (no [preview] tag)

## r19, Oct 22 2026 (Agentation notes)
- Changed: lead compare no longer clips and gets a calmer surface (two extension tokens), figures capped at 640px by scaling, chart titles on their own row, chart library near-miss specimens with numbered markers, thin-data "Add to my plan" copies a prompt, ClipCard accent bar removed, hero footer expand icon dropped.
- Why: Mudit's r19 notes, ledger DLG-79 to DLG-85 (his DLG-70 to 78).
- Preview: none, local build only (no [preview] tag)

## r18, Oct 22 2026 (polish)
- Changed: 390 anatomy shows all five parts, hero search step within two lines (chat column +24px, shorter copy at phone width), hero "-38% drop" tooltip back, transcript player black edge to edge, balanced wrap in the amber warning.
- Why: r18 audit of 3585bb6. DLG-70 to DLG-72.
- Preview: PREVIEW_URL (deployment of COMMIT_SHA)

## r17, Oct 22 2026 (restore plus DS conformance)
- Changed: restored trust signals (amber low-signal warning, evidence footer, "Ask this next study"), counter-evidence expander, Paper section-5 transcript and the anatomy search line, inline clip link and footer; hero aside is now quote rows plus the evidence footer; pill format, send button, focus border, chart-title gap and lead comparison type scale per plan.md; styles/dialogue-tokens.css (DS raw, role tokens, extension block) with the product CSS migrated; check:dialogue-tokens.
- Why: Mudit approved the r17 restore plan and the DS conformance audit. DLG-58 to DLG-69.
- Not restored: study view and hero layout (Mudit's follow-up). Lead comparison card keeps no footer.
- Preview: https://portfolio-q4ati66yx-mudits-projects-d560e6b3.vercel.app (deployment of 3585bb6, protected; check:dialogue-preview, check:annotate and check:site-mobile passed against it)
- Image: ![r17](img/r17-anatomy.webp) early left, now right.

## DLG-57, Oct 22 2026 (Agentation comment box typing)
- Changed: every window or document key listener (ruler mode, lightbox, project popup, quarter picker, bento gallery, motion lab) returns early for editable targets through lib/isEditableTarget, which reads composedPath. The toolbar stops typed characters in the capture phase so other tools' single-letter shortcuts cannot swallow them. check:annotate types the full alphabet, digits and punctuation into the comment box on /dialogue and /.
- Why: Mudit could not type some letters ("c") in the comment box. No site listener reproduces it; the Vercel preview toolbar binds "c" and is the likely source, so the guard is aimed at it. Unverified without a logged-in toolbar session.
- Preview: https://portfolio-dxba7y8op-mudits-projects-d560e6b3.vercel.app (deployment of 99022e7)
- Image: none this round.

## e7cd42c, Oct 22 2026 (Agentation on Dialogue)
- Changed: merged origin/review/agentation (PR #107, 8aa312e), taking its STD-09 over the earlier revert. Every Dialogue figure part (hero, anatomy, library pairs, counter-evidence, thin-data figure, quote player, lightbox) carries data-annotate="dialogue-<figure>/<part>". Kept our CaseStudyLightbox (live children), CaseStudyFigure narrow handling and the BruinLease caption stopgap, with their annotate attributes added.
- Why: Mudit wants Agentation on the Dialogue preview.
- Preview: https://portfolio-mb2mxeofa-mudits-projects-d560e6b3.vercel.app (deployment of 5ebac65, code identical to later script-only commits)
- Image: none this round.

## 40e417f, Oct 22 2026 (DLG-56 critique fixes)
- Changed: chat cards keep their full radius and shadow (16px room under uncropped cards in the shared scale viewport, clip margin at the sides), the empty chart slot is a 123px dashed placeholder at the hero chart height with the line centered in muted ink, the two source chips stay on one row at 390 (10px chip padding, 12px body padding at 600px and below) and wrap only at 360, caption confirmed visible at 390 and 360.
- Why: Mudit's DLG-56 critique of the screenshots. Cropped figures at 390 (hero, anatomy, full answer) still clip by design.
- Preview: https://portfolio-64yzxi9bb-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 13b138e, Oct 22 2026 (DLG-56, after r15)
- Changed: the thin-data pair is now one full-width figure on the standard well, with one chat card (question, "2 of 24 interviews" panel, summary, two source chips, the held-back-chart line) and the caption "Thin data. A finding from two interviews must not reach a roadmap as a trend." New section lead, and a pointer under "One answer, start to finish". Chips use the DLG-48 owners. STD-09 was reverted on this branch (a separate agent builds it on review/agentation).
- Why: Mudit approved the replacement (DLG-56, DLG-20).
- Preview: https://portfolio-r010xatx8-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 6bb5f1b, Oct 22 2026 (r15)
- Changed: merged origin/main (includes the mobile fixes from PR #106), closing line now reads "Limit: the chat has to hold summary, chart, and clips without feeling crowded." with the DLG-47 spacing kept, and the ledger records Needs Mudit 7 as done and 8 and 9 as declined. The BruinLease caption source is not edited yet.
- Why: Mudit approved my calls Oct 22, DLG-55 and BRL-01. The Sanity edit needs a write token this environment does not have.
- Preview: https://portfolio-1f4bxn31y-mudits-projects-d560e6b3.vercel.app
- Image: none this round.

## 80b31f8, Oct 22 2026 (r14)
- Changed: one owner per timestamp in every figure, one outlined pink Chosen tag, full-width counter-evidence, equal 32px lightbox well padding, 16px overlap on the 390 hero card, library intro trimmed to "Each pair puts the common choice next to mine, on the same data.", problem section figure removed, preview check extended (DLG-48 owners, DLG-52 hero overlap).
- Why: r13 audit and outside review, DLG-48 to DLG-54 and M11.
- Preview: https://portfolio-ow64oer70-mudits-projects-d560e6b3.vercel.app/dialogue (mudits-projects team preview, READY; `npm run check:dialogue-preview` passed against it)
- Image: none this round. The r13 entry's before and after image was removed because its "before" did not show the pre-r13 state.

## a3f5f0a, Oct 22 (r13)
- Changed: lightbox Close with fixed light-on-dark styling, quieter neutral pill outline in dark, hero sources grid filling its card, section spacing above the closing Outcome line, preview check extended (open-lightbox sweep, dark Close clicks, no-trigger assert, SELFTEST).
- Why: r13 audit, DLG-44 to DLG-47 and M10.
- Preview: https://portfolio-my31xb62i-mudits-projects-d560e6b3.vercel.app/dialogue (mudits-projects team preview, the only team this account can reach; READY)

## 226dd8d, Oct 22 (r12)
- Changed: lightbox portaled to document.body with Close anchored to the dialog corner (same 600px cutoff for BruinLease), theme-aware counter-evidence pills, hero sources as a 2x2, one caption token, 390 fixed-structure figure fits, preview check script.
- Why: r12 audit, DLG-31 and DLG-39 to DLG-43.
- Preview: https://portfolio-392868ixu-mudits-projects-d560e6b3.vercel.app (deployment of 226dd8d, protected; `npm run check:dialogue-preview` passed against it)
- Image: ![r12](img/r12-counter-dark.webp) dark counter-evidence after the fix; no before image because the audit preview of 695eaa3 could not be reopened.

## 56f4d73, Oct 22 (r11)
- Changed: theme-aware ink on figure wells, hero sources card with trimmed chat gaps, caption contrast, 600px lightbox cutoff, audit screenshots removed; the lightbox-above-header fix did not take on the preview (Close still hit the nav, fixed in r12).
- Why: r11 audit, DLG-31 to DLG-38.
- Preview: https://portfolio-ehe50danl-mudits-projects-d560e6b3.vercel.app (deployment of ea29e31, the tip that carried 56f4d73; code identical to later log-only commits)
- Image: ![r11](img/r11-hero.webp) hero before (r10) left, after right.

## 183a03d, Oct 22 (r10)
- Changed: transcript on a light card in the quote frame, lightbox safe area, opaque backdrop and hidden contents list, lightbox off at phone width, hero funnel at natural row spacing, BruinLease caption em dash normalised in code.
- Why: r10 audit (dark transcript 1.04:1, lightbox overlap, stretched funnel rows); DLG-07, DLG-15, STD-02.
- Preview: https://portfolio-fj7d2xfn2-mudits-projects-d560e6b3.vercel.app
- Image: ![r10](img/r10-dark-quote.webp) before (r9) left, after right.

## a3ce008, Oct 22 (r9, restore plus lightbox)
- Changed: quote player restored from 657337d with a still-aspect frame and blur box, hero thumbs 3 x 120px, figure well tokens in both themes, library specimens per brief, figure lightbox.
- Why: r9 audit, DLG-17 (Misses M5), DLG-13, DLG-15, DLG-18, DLG-19.
- Preview: https://portfolio-j0swh7ms0-mudits-projects-d560e6b3.vercel.app (tip 03b843b, includes a3ce008)
- Image: ![r9](img/a3ce008-quote.webp) before left, after right.

## 826bc80, Oct 22 (v2 build)
- Changed: straight hero, restored-style quote player, chart library, low-coverage compare, #EEEDEB wells, single-line search status.
- Why: dialogue-v2 brief, DLG-14 to DLG-20, DLG-26.
- Preview: https://portfolio-n6p0w6bow-mudits-projects-d560e6b3.vercel.app (tip 9f220ec, includes 826bc80)
- Image: ![v2](img/826bc80-hero.webp) after only, no before captured.
