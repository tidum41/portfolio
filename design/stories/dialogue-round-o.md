# Round O story arc: Dialogue case study

Thesis, in Mudit's framing: the goal was to pin down where insights come from, and to let a team move between levels of detail, from the summary down to the real moment, whether a finding rests on few responses or many. The pacing is uneven. The turning points are tradeoffs written as reasoning, with no invented feelings. Facts come only from TASTE.md. The only numbers are 24, 18 of 24, 6 of 24 and 4 of 24. There's no role line.

---

## Hero
**Interactive insights for UX research teams**

The goal of this project was to hone in on where insights come from. A team should be able to go from an answer down to the real moment someone said it.

Figure: the real study chat answer with "18 of 24 interviews" as text and one grey quote card (voice icon, "Jordan M., 14:03"). No bar.

## Context
Dialogue runs AI-moderated interviews for UX research teams and turns them into a study site with a chat you can ask questions in. I designed how that chat answers.

## The answers stopped at the surface
The chat answered in a confident paragraph with a couple of quotes cited underneath. It read well, but it only had one level of detail. There was no way to tell how many people an answer stood on, and no way to get from a quote to the moment it was said. "Most participants" could mean almost everyone or a handful.

Figure: the real prose answer under its question bubble, with real grey quote cards, unchanged. Caption: "The answer as it was. Quotes, but no count."

## Levels of detail
I wanted the answer to work at different depths. A summary is enough when you're skimming. A count tells you how much to trust it. Quotes give you people's words, and the clip gives you the moment itself. The idea was that you could stop at whichever level you need and go deeper from there.

## Moving from one interview to the whole study
The chat originally answered questions about a single interview. That's useful when you're reviewing one session, but the insights a team acts on usually come from across a study. Keeping the chat per interview would also mean a count could never be more than one person. So the chat moved up a level and answers across all 24 interviews. Everything after this depends on it, because once an answer covers a whole study, it has to say how much of the study it covers.

Figure: the real per-interview header "Answering questions about this interview", muted, beside the study-wide header "Checkout usability, 24 interviews".

## Bringing more depth to answers
I put the same question through a few formats. Text only was the fastest to read, but it gave you nowhere to go. Direct quotes kept people's actual words, but with enough of them the overview disappears and you do the summarizing yourself. Each one had the level the other was missing. The version I kept puts a short answer and its count on top, with the quotes underneath as evidence.

Figure: three equal-height cards built from the real quote card. The third adds only the count line and one 16:9 clip thumb.

## Watching the moment without leaving the chat
The deepest level is the clip. One option was linking out to the session page, which is the usual pattern. The tradeoff is that it pulls you away from the answer you were checking. Playing the clip inside the chat keeps the answer and its evidence in one place. Tapping a response plays it from where the participant says it, with the transcript highlighting along.

Figure: InlineClipFigure (kept from round N, header "Marcus W., 01:38").

## Counts you can open
The bar reads 18 of 24 instead of a percent, because with this few interviews a percent hides how few people are behind it. Tapping the 6 of 24 who didn't struggle opens their quotes too.

Figure: the one count bar, with the 6 of 24 segment outlined and its real grey quote cards (Alex P. among them) underneath.

## When a finding rests on few responses
Counts made a new problem visible. A finding can rest on many responses or very few, and the design has to work for both. One answer said 4 of 24 interviews mentioned autofill skipping the apartment field on mobile. Shown the same way as 18 of 24, it read like a trend. Four people is a lead, not a pattern. So answers that rest on little now say so right under the count, and the quotes and clips stay just as reachable, so a small finding can still be checked in depth.

Figure: ThinDataFigure (kept from round N).

## What happened
Dialogue's team adopted the study-wide chat and the count bars. The thin-data flags went in too. I don't have outcome numbers.

## What I'd test next
A thin finding is usually a reason to study something further. "Add to my plan" copies a prompt that can be pasted into any agent, and it carries the context of what the original plan was based on. I'd test whether teams use it to turn weak signals into their next study, and whether stakeholders who can open the evidence stop asking who said that.

Figure: the "Add to my plan" interaction. The thin-data answer, the tapped button, then the copied prompt with its plan context shown.

---
Body is about 620 words.
