# The root of the Dialogue story: who uses the answer, and why

Built Oct 27 2026 from PLATFORM.md, STORY.md, market-research.md, dialogue-site.md, the real product screenshots (`/workspace/research/dialogue-product/01..17`) and the practitioner findings (Reddit r/UXResearch, NN/g, ACM). Each line says whether it is **evidenced** (with source) or **assumed**. Assumed lines end in a [PLACEHOLDER] question for Mudit.

## 1. Who asks the chat, and in what moment?
- **Answer:** mostly a researcher, or a PM or designer acting as one, in the hours between the last interview and a share-out.
- Why? Dialogue's customers run studies fast and share within a day or two: Kalshi "Could we get a share-out by tomorrow morning, is the bar here"; Wayfair "surfacing insights in 36 hours"; Suno "under 48 hours". (evidenced, dialogue-site.md)
- Why does that moment matter? At that point the person has hundreds of interviews and no time to rewatch them. Dialogue's own pitch is "Research that traditionally took weeks now happens in hours." (evidenced)
- Why does it shape the answer? Whoever asks is also the person who will defend the finding in the share-out. Kalshi's researcher pulls "verbatims (and pre-clipped video reels) when stakeholders want evidence". So the asker needs something to read fast and something to hand over as proof. (evidenced)
- The stakeholder rarely asks the chat. They read what the researcher shares: Wayfair says "both researchers and non-researchers", and Kalshi says "stakeholders with varying research maturity". (evidenced that they read; assumed that they don't ask) [PLACEHOLDER: in Dialogue, did PMs and stakeholders open the chat themselves, or only read what researchers shared?]

## 2. One question or many? One finding or several?
- **Answer:** many questions per session, one finding per answer.
- Why many? The real summary page lists several insights grouped by objective (`01-insights-summary-top.png`). Kalshi "learned about 4 different segments and now we are adding 2 more", and the homepage's sample prompt is "Can you create an executive summary?". A share-out has several findings, so the person asks several questions. (evidenced)
- Why one finding per answer? The real chat answers in numbered prose sections ("6. Willingness to Recommend Depends on Demonstrable Value", `15-interview-chat-answer-with-quotes.png`), each with one quote card. Each section is one claim. (evidenced)
- Why does that matter for design? Across many answers the reader scans. They need the claim and its weight before they read on, which is the count. They dig into only the one or two findings they'll present or doubt. (scanning is assumed) [PLACEHOLDER: how many questions did a researcher ask in one sitting in your sessions or analytics, and did they reread earlier answers?]

## 3. What do they do with the answer?
- **Answer, in order:** check it, then share it, and sometimes plan the next study.
- Why check first? Practitioners don't trust AI synthesis. They report "hallucinated or misattributed user quotes" and "lack of traceability" (ACM, 21 practitioners), "quotes that were not in the original data set" (Reddit), and NN/g says AI "might miss, misinterpret, or even manufacture insights". (evidenced)
- Why does checking cost so much? "It eats most of the time the AI was supposed to save" (Reddit). So a check has to be cheap: one tap, inside the answer. (evidenced)
- Why share? Every customer story ends in a share-out or a decision: Doctronic "made messaging decisions that same day", Suno "directly influencing launch decisions". (evidenced)
- Why plan? Thin findings turn into the next study. Kalshi adds segments week to week. (evidenced that studies repeat; Add to my plan as the path is assumed) [PLACEHOLDER: did researchers actually carry a chat answer into the next study's plan, or is that only the concept?]

## 4. What breaks trust?
- A quote that doesn't exist, or exists but is pinned to the wrong person (Reddit, ACM). (evidenced)
- A claim with no weight. "Many found it unclear" can mean 5 people or 250. NN/g reports counts over percents ("1 out of the 6 participants"). (evidenced)
- A small finding dressed as a pattern. Maze's confidence bands put 1 to 4 sessions at low. (evidenced)
- Evidence that's a few pages away. In the real product, quotes sit on section pages and in a modal, away from the summary (`03`, `04`, `05`). Checking means leaving the answer. (evidenced)

## 5. Why would Mei's quote matter, and to whom?
- **To the researcher, it's a spot check.** The count says 75 shoppers were unsure. Opening that side and seeing a real line with a name and a timecode ("Mei, 18:27") proves the count points at real people and real moments. Researchers ask for attribution-first output because misattribution is the failure they fear (ACM, Reddit). (evidenced)
- **To the stakeholder, it's the proof they asked for.** Kalshi pulls verbatims "when stakeholders want evidence", and Wayfair ships "video clips and verbatims". A clip of a shopper saying "Friday which week?" settles a debate faster than a bar ("reducing internal debate", Kalshi). (evidenced)
- **Empathy is a side effect.** Hearing a shopper hesitate makes the finding real. Doctronic: "Data shows where users drop off; video interviews reveal why." (evidenced, secondary)
- **As a character, Mei matters to nobody.** The page used her as a recurring persona ("Mei was one of the six…"). That made the story about her rather than about checking a count.
- **Call: keep names, shrink their role.** Names and timecodes stay on quote rows, because the real product shows them ("Alan S., 22:51") and attribution is the trust fix. Mei stops being a character in the copy. The quotes are shown as a sample of the side they belong to ("2 of 75 shown, +73 more"), so the reader sees the quote as one checkable instance of the count. The sources row with "+N more" is already approved in TASTE §1. Anonymous labels like "Shopper 14" would read as less checkable and wouldn't match the product, so names stay.

## 6. Assumptions behind each design choice
| Design choice | Behaviour it assumes | Evidence |
|---|---|---|
| Count out of the whole study leads the answer | Readers scan several answers and need weight first | Evidenced for weight (NN/g); scanning assumed [PLACEHOLDER: did researchers skim answers or read each in full?] |
| Both sides of the count open | Researchers check the minority too, not only the majority | Assumed [PLACEHOLDER: did anyone open the smaller side in testing, or did you see the need in feedback?] |
| Quotes one tap below the sentence | Stakeholders read the sentence, researchers open the quotes | Evidenced for two readers (Kalshi, Wayfair); tap behaviour assumed |
| Clip starts at the moment, in place | Checking a quote means hearing it, and leaving the answer costs the check | Evidenced for the cost of checking (Reddit); clip use assumed [PLACEHOLDER: did researchers play clips from the chat, or only from section pages?] |
| AI picks a chart from templates | Comparing segments is a common question | Evidenced (Kalshi segments, Persona, Suno variants) |
| Thin finding labelled, no chart | Teams would otherwise present 2 people as a pattern | Evidenced as a risk (Maze bands); behaviour assumed [PLACEHOLDER: did you see a thin finding get overstated in a real share-out?] |
| Add to my plan | Thin findings feed the next study | Assumed (see §3) |

## 7. The picture (mock, labelled)
*Hearthside is a fictional retailer. Priya is a mock researcher. All numbers are illustrative.*

Priya runs UX research at Hearthside. Her checkout study closed with 300 AI-moderated interviews, and her PM wants a share-out by 9 tomorrow. She opens the study chat and asks how shoppers read "Arrives by Friday".
1. **Read.** The answer leads with "225 of 300 read it as this Friday" and a bar. She knows the weight before she reads another word. → *Counts.*
2. **Check.** She doesn't trust a number she can't open, so she taps the 75. Two quotes show with names and timecodes, plus "+73 more". → *Counts (both sides open), and the sample-of-a-side row.*
3. **Hear it.** One line, "Friday which week?", is the one she'll show. She plays it from that moment without leaving the answer. → *Clips.*
4. **Compare.** She asks whether first-time and repeat shoppers differ. The chart shows counts out of each group, so a group of nine reads as small. → *Data viz.*
5. **Hold back.** She asks about damaged orders. Two people mentioned it, so the answer says "Early signal, 2 people" and she doesn't put it on a slide. She adds it to the next study's plan. → *Thin data.*
6. **Share.** She pastes the answer into the share-out. Her PM reads the sentence and the count. A skeptical director taps through to the clip. → *Levels: one answer that serves both readers.*

**What this changes on the page.**
- The sections follow her steps: read, check, hear, compare, hold back, share. Levels moves from third to last, because it is the share step and it pays off the "by tomorrow" deadline.
- Each section gets a small kicker naming the step, so a skimmer follows Priya without reading the body.
- No section is cut. Measure stays as the closing "what shipped" beat.
- The problem section is told from Priya's moment: the deadline, the vague prose, no way to check.
- [PLACEHOLDER: is Priya's day close to what Dialogue's customers told you, and which step did they spend the most time on?]

## 8. Deferred Rachel Chen moves, judged against this picture
- **Kicker labels:** yes. They carry the scenario steps, and they reuse the caption-label type, so no new style.
- **Larger hero product image:** shown as an option. At full scale the hero text is readable, which serves step 1. It costs the problem heading its place above the 1440x900 fold. Mudit decides.
- **Paired before and after in the problem:** built as an option and not recommended. Levels already pairs prose against answer and evidence, so a second pair repeats it and spends the share step's payoff early.
