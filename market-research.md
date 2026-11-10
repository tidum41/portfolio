# Dialogue's answer card against the AI research market

Prepared Oct 27, 2026 (PT) for the /dialogue case study. Research only; repo untouched. Dialogue site notes: dialogue-site.md.

## Top findings
1. Cited answers are table stakes. Dovetail, Marvin, Condens, Great Question, Looppanel, UserTesting and Listen Labs all trace AI answers back to quotes. Don't claim traceability as new.
2. Inline video in chat already exists. Dovetail plays cited clips in a carousel inside chat (May 2026). Marvin's "Open file" jumps to the clip. Clips in place is good craft, not a first.
3. Counts exist, but as coverage or citation tallies. Marvin shows "X citations" (files supporting a claim), Maze shows session coverage as a percent, Sprig and Listen give theme percentages and cross-tabs. None documents opening the other side of the count, the people who didn't say it. That's Mudit's strongest distinct move.
4. The market frames speed versus depth as a mode switch: Dovetail has Fast vs Deep research; Marvin shows a provisional Quick Answer and then a full one. Mudit puts depth inside one answer as layers. That's a real, citable contrast.
5. Thin data is handled at study level, not per claim. Maze gives a Low/Medium/High confidence rating by session count (1–4, 5–9, 10+). Outset advertises "transparent confidence scores" for digital twins. A quiet flag on the specific thin finding is rarer.
6. The pain researchers voice is checking quotes: hallucinated or misattributed quotes, and checking that "eats most of the time the AI was supposed to save" (Reddit). An ACM study of 21 practitioners found low trust from "hallucinated or misattributed user quotes". Dialogue's own beta chat misattributed a quote in Mudit's Oct 25 test.

## Tool by tool
| Tool | Who / core job | Answering across interviews | Evidence | Quantification / confidence | Charts / sharing | Source |
|---|---|---|---|---|---|---|
| Dovetail | Repository + analysis for research, product, CX | Chat scoped to doc, project, workspace; Fast and Deep research modes; @mention multiple sources | Expandable citations; Show thinking; video clips inline in a carousel, downloadable | Examples ask "How many enterprise customers…"; no count UI documented | Full-page chat with persistent URL | https://docs.dovetail.com/help/chat ; https://docs.dovetail.com/help/chat/verify-answers ; https://dovetail.com/changelog/new-chat/ |
| Marvin | Repository for research and customer knowledge | Ask AI with parallel explorer agents; Quick Answer first, labeled provisional, then full answer | Numbered citations per sentence, file, project, date, timestamp; Open file goes to the exact line or clip | "X citations" per insight = files supporting it, "so you can decide how much weight" | Charts, slides built into answers; share link; post to Slack | https://help.heymarvin.com/en/articles/10130400-how-do-i-use-ask-ai ; https://help.heymarvin.com/en/articles/10130397-a-guide-to-citations-in-ask-ai |
| Condens | Repository; stakeholder Insights Magazine | Home AI chat scoped to Sessions, Highlights or Published Artifacts | Evidence linked under the answer; answers become Artifacts | Says Condens AI "doesn't do its own interpretation"; stakeholder search only uses published artifacts, raw data excluded "to prevent cherry-picking" | Insights Magazine for stakeholders | https://condens.io/product-updates/home-ai-chat/ ; https://condens.io/help/using-condens/sharing-findings/research-magazine/ |
| Great Question | All-in-one research ops: recruit, moderate (incl. AI), repository | Ask AI across a study "up to 50 hours of interview data" or the whole repository | "links every quote to the exact moment someone said it" | Not documented | Highlight reels; MCP with 130+ actions | https://www.greatquestion.com/blog/introducing-great-question-ai ; https://greatquestion.co/support/repository/great-question-ai |
| Maze (AI moderator) | Product teams; testing + AI interviews | Thematic analysis across sessions | Themes carry highlights with video, transcript, timestamps | Session coverage %; confidence Low 1–4, Medium 5–9, High 10+ sessions | Auto report with exec summary, theme slides; reels by link, embed, download | https://help.maze.co/articles/9244710783-from-sessions-to-insights-analysis-and-reporting-for-ai-moderated-studies |
| Outset | AI-moderated interviews at scale | Themes, summaries, chat with data | Quotes and highlight reels | "transparent confidence scores" (digital twins); 500K+ interview hours, 10K+ studies | AI highlight reels "instead of long reports" | https://outset.ai/ ; https://outset.ai/platform%2Fsynthesis ; https://outset.ai/resources%2Fchangeblog%2Fai-generated-highlight-reels |
| Listen Labs | AI interviews at large N | Report, Details, Chat tabs; Research Agent | "every data point links back to the individual responses" | Quantitative breakdowns by theme; segment comparisons "with significance flagging"; outlier detection | Live charts, slides in brand template, reels | https://docs.listenlabs.com/interview-data/talk-to-your-data ; https://listenlabs.com/blog/research-agent |
| Strella | AI-moderated customer interviews | AI Chat across projects; insights board | Source-linked highlight reels | Not documented | Reels saved to insights | https://www.strella.io/education-hub/tutorial/chat-with-your-research |
| Looppanel | Analysis + repository | Smart Search answers across repository | Quote, participant, session; MCP promises "a clear answer when your research doesn't cover the question" | MCP example asks "how many participants raised each one" | Affinity maps, charts via MCP | https://www.looppanel.com/mcp ; https://www.looppanel.com/blog/ai-insider-2 |
| UserTesting | Enterprise testing | AI Insight Summary; Insights Discovery | "View source" to video and timestamps | Not documented | Enterprise sharing | https://help.usertesting.com/hc/en-us/articles/13268691111453-AI-insight-summary |
| User Interviews | Recruiting; adding AI moderation | AI Moderation early access Oct 1, 2026; AI chat | Cited session breakdowns, clips | Cross-participant data grids | Shareable clips | https://www.userinterviews.com/product-announcements/recruit-participants-with-ai-moderation-early-access ; https://www.userinterviews.com/insights |
| Sprig | In-product surveys | Open-text AI themes; AI study reports | Responses behind each theme | Cross-tab theme counts and percentages by segment | Study reports | https://docs.sprig.com/docs/native-ai/cross-tab-analysis-across-themes |
| Notably | Synthesis workspace | Clustering, tagging, AI assistant | Highlights | Not documented | Insight reports | https://www.notably.ai/ |
| Grain / Gong | Call intelligence for sales and CS | Ask across meetings or a deal (Gong: up to 60 calls, 500 emails) | Citations to moments | n/a | CRM-centric | https://support.grain.com/en/articles/9189989-ask-grain-ai ; https://help.gong.io/docs/en/pipeline-review-ask-anything-about-a-deal-or-account |

Not reached this pass: G2 review pages and Lenny's commentary (no stats quoted from them).

## What makes the strongest ones powerful
- Scope control: Dovetail and Condens let you say exactly what the answer is drawn from.
- Visible process: Dovetail's Show thinking, Marvin's log of search terms and documents read.
- Evidence one click from the claim, ideally the moment in video (Dovetail, Great Question, UserTesting).
- Answers that become deliverables: Marvin slides and Slack posts, Listen decks, Condens artifacts.
- Stats at scale: Listen's significance flags and segment comparisons.

## Recurring pain points
- Fabricated quotes: "it gave me back quotes that were not in the original data set" (https://www.reddit.com/r/UXResearch/comments/19cflvf/using_ai_to_help_with_qualitative_coding/).
- Checking eats the savings: "it eats most of the time the AI was supposed to save" (https://www.reddit.com/r/UXResearch/comments/1vf5fr6/what_does_your_checking_step_look_like_when_ai/). A reply cites an unnamed study saying attribution-first output cut errors by 50%; unverified.
- Low trust in practice: 21 practitioners reported "hallucinated or misattributed user quotes" and "lack of traceability" (https://dl.acm.org/doi/10.1145/3742414.3794768).
- NN/g: AI "might miss, misinterpret, or even manufacture insights"; treat coding as an initial pass (https://www.nngroup.com/articles/research-with-ai/). AI interviewers "follow the script, not the insight" (https://www.nngroup.com/articles/ai-interviewers/).
- Vendors hedge too: Marvin "recommend[s] that you always verify all information" (https://help.heymarvin.com/en/articles/10130397-referencing-the-ai-citations-in-marvin).

## Dialogue's position
End-to-end AI interviewer (study design, 50M+ panel plus Prolific, 30+ languages, real-time synthesis, Insights Chat), sales-led, $6M seed led by Lightspeed. Direct rivals: Outset, Listen Labs, Strella, Maze AI moderator, Great Question and User Interviews moving in. Repositories (Dovetail, Marvin, Condens) are the analysis-side benchmark. Buyers: research ops and lone researchers (Kalshi), PMs and designers running studies themselves (Doctronic, Suno), stakeholders who only read (Wayfair "non-researchers").

UI must support: a fast share-out by tomorrow; a count a non-researcher can read; evidence a skeptic can check in one tap; segment and variant comparison; quality triage; export to decks and Slack.

## Distinct versus already done
| Element | Already done by | Distinct about Mudit's |
|---|---|---|
| Study-wide chat with citations | Dovetail, Marvin, Great Question, Listen, Condens | Nothing; table stakes |
| Counts "18 of 24" | Marvin citation counts, Maze coverage %, Sprig/Listen % | Raw n of N, not %, and both sides open, including the 6 who didn't |
| Levels of detail | Dovetail Fast/Deep, Marvin Quick Answer then full | One answer, layered, reader picks depth; not a mode chosen before asking |
| AI-chosen charts | Marvin, Listen, Looppanel MCP | Constrained templates from IBM Carbon with edge-case rules |
| Clips in place | Dovetail inline carousel | Plays from the moment, transcript follows, loads only on tap |
| Thin-data flags | Maze study-level confidence | Per-finding, in the answer, plus Add to my plan |

## Angles for the case study
- Framing line: "Every research tool now cites its sources. Few show how many people a finding rests on, and none I found let you open the people who didn't say it."
- Prior art to cite: Marvin's per-claim citation count; Maze's session-based confidence; Dovetail's inline clip carousel.
- Rejected options: a Fast/Deep mode toggle (Dovetail) and a provisional answer that gets replaced (Marvin) both make the reader choose depth before seeing the answer; percentages (Maze, Sprig) hide small n.
- The one special thing: the count is the door. "18 of 24" is both the summary and the way into the evidence, on both sides.

## Ideas to push the design
1. Split the count by segment ("6 of 9 crypto traders") since Kalshi, Persona and Wayfair all compare groups.
2. Make the 6 side typed: said the opposite vs didn't mention it. Silence isn't disagreement.
3. Attribution-first quote cards: name and timecode, then the words, matching the fix researchers ask for.
4. A "how I got this" line like Dovetail's thinking: 24 interviews read, 18 matched.
5. Share the card as a block with its count and clip intact, for the "share-out by tomorrow morning".
6. Exclude a participant and re-count, for Kalshi-style quality triage.
7. Tie thin flags to Maze-style thresholds so the cutoff is defensible.

## What Dialogue's customers value, and how the redesign maps
| Value | Exact words | Redesign |
|---|---|---|
| Speed to share-out | Kalshi "Could we get a share-out by tomorrow morning, is the bar here"; Wayfair "surfacing insights in 36 hours"; Suno "under 48 hours" | Sentence and count lead |
| Evidence stakeholders trust | Kalshi "pull verbatims (and pre-clipped video reels) when stakeholders want evidence"; Wayfair "video clips and verbatims" | Quotes one tap down; clips in place |
| Comparing groups | Kalshi "4 different segments and now we are adding 2 more"; Persona "segment-level insights in 2 weeks" | Counts are the base; segment split is next |
| Quality checks | Kalshi "ship studies constantly, quality-check quickly" | Both sides of the count open |
| Why behind a metric | Doctronic "Data shows where users drop off; video interviews reveal why" | Clips from the moment |
| Not overclaiming | /solutions/ux-researchers "real confidence in the findings" | Thin-data flag |
Sources: https://www.dialogueai.com/blog/kalshi-case-study , /wayfair-case-study , /suno-case-study , /doctronic-case-study , https://www.dialogueai.com/solutions/ux-researchers

Page: https://cursor.com/canvas/store-3fb06ea7-d551-46fa-94bc-c23cb879e3d7/e35ffaa2-8853-40e9-9c0d-4f0340f3678d
