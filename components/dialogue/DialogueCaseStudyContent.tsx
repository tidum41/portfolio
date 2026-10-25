"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueQueryMoment from "@/components/dialogue/DialogueQueryMoment";
import DialogueVersionTable from "@/components/dialogue/DialogueVersionTable";
import DialogueHeroMoment from "@/components/dialogue/DialogueHeroMoment";
import CounterEvidence from "@/components/dialogue/product/CounterEvidence";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import type { DialogueProductScenario } from "@/components/dialogue/product/DialogueProductScenario";
import "@/components/dialogue/product/dialogue-product.css";
import DialogueRachelFrame, {
  DialogueCaption,
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_SUBTITLE, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import {
  ADDRESS_FOLLOWUP,
  CHECKOUT_QUESTION,
  CLIPS,
  COVERAGE_ADDRESS,
  SEGMENT_ADDRESS,
} from "@/lib/dialogue/product/sampleData";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "system";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Contents labels match the section H2s. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "what-dialogue-is", label: "Dialogue" },
  { id: "problem", label: "Problem" },
  { id: "why-it-was-hard", label: "Why it was hard" },
  { id: "my-role", label: "My role" },
  { id: "counter-evidence", label: "Counter-evidence" },
  { id: "more-depth", label: "More depth" },
  { id: "chart-library", label: "Data visualization" },
  { id: "one-structure", label: "Structure" },
  { id: "clips", label: "Clips" },
  { id: "thin-data", label: "Thin data" },
  { id: "full-answer", label: "Follow-ups" },
  { id: "learning-room", label: "Room" },
  { id: "learning-changed-my-mind", label: "Changing my mind" },
  { id: "the-win", label: "The win" },
];

function Section({
  id,
  children,
  noReveal = false,
}: {
  id: string;
  children: React.ReactNode;
  noReveal?: boolean;
}) {
  const inner = noReveal ? <>{children}</> : <ScrollReveal>{children}</ScrollReveal>;
  return (
    <section
      id={id}
      className="dialogue-cs-section"
      style={{
        scrollMarginTop: 96,
        paddingBottom: 0,
        marginBottom: "var(--dialogue-section-gap)",
      }}
    >
      {inner}
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-h2)",
        fontWeight: "var(--fw-h2)" as React.CSSProperties["fontWeight"],
        lineHeight: "var(--lh-h2)",
        letterSpacing: "var(--ls-h2)",
        color: "var(--color-text-primary)",
        margin: "0 0 24px",
        maxWidth: 640,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </h2>
  );
}

function ProductFigureBlock({
  scenario,
  title,
  assetId,
  wrapRaster,
  frameLabel,
  frameTone,
}: {
  scenario: DialogueProductScenario;
  title: string;
  assetId?: string;
  wrapRaster?: RasterAnnotator;
  frameLabel?: string;
  frameTone?: DialogueFrameTone;
}) {
  const tone = frameTone ?? (frameLabel ? frameToneFromLabel(frameLabel) : "system");
  const media = (
    <DialogueRachelFrame label={frameLabel} tone={tone}>
      <DialogueProductFigure scenario={scenario} title={title} assetId={assetId} />
    </DialogueRachelFrame>
  );
  const wrapped = assetId && wrapRaster ? wrapRaster(assetId, media) : media;
  return <figure className="cs-figure dialogue-live-block">{wrapped}</figure>;
}

export function DialogueCaseStudyContent({
  annotateRaster,
  backHref = "/",
}: {
  annotateRaster?: RasterAnnotator;
  backHref?: string;
}) {
  const wrap = annotateRaster;

  return (
    <div className="dialogue-case-study" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={DIALOGUE_TOC_ITEMS} backHref={backHref} />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref={backHref} mobileBackOnly />
          </div>

          <CaseStudyOpen
            tagline="Dialogue, contract, December 2025 to March 2026"
            title={DIALOGUE_TITLE}
            subtitle={DIALOGUE_SUBTITLE}
            metadata={[
              { _key: "role", label: "Role", values: ["Product designer (contract)"] },
              { _key: "timeline", label: "Timeline", values: ["December 2025 to March 2026"] },
              {
                _key: "team",
                label: "Team",
                wide: true,
                values: [
                  <>
                    <span className="cs-meta-name">Benjamin Lo</span>
                    <span className="cs-meta-role">Co-founder, CEO</span>
                  </>,
                  <>
                    <span className="cs-meta-name">Justin Hoang</span>
                    <span className="cs-meta-role">Co-founder, CPO</span>
                  </>,
                ],
              },
              {
                _key: "scope",
                label: "Scope",
                values: ["Interaction design", "Visual design", "Prototyping"],
              },
            ]}
          >
            <>
              {wrap
                ? wrap(
                    "D-01",
                    <div className="cs-hero-media-frame dialogue-hero-media dialogue-hero-joola">
                      <DialogueHeroMoment />
                    </div>,
                  )
                : (
                    <div className="cs-hero-media-frame dialogue-hero-media dialogue-hero-joola">
                      <DialogueHeroMoment />
                    </div>
                  )}
              <DialogueCaption
                label="One question, the whole answer"
                sentence="The funnel and the interviews behind it, the three who disagreed, and the slice that stays thin, in one card."
              />
            </>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <div style={{ marginBottom: "var(--dialogue-section-gap)" }}>
              <CaseStudyBody>
                That is the finished card, version eight of the answer. This page rewinds to{" "}
                <a href="#problem">version one, a plain markdown table</a>. Everything after it
                is how that answer got its shape.
              </CaseStudyBody>
              <CaseStudyBody>
                One rule survived all eight versions: the evidence count decides whether a chart
                appears at all. A chart can sound certain on four interviews, and nothing in the
                answer said so.
              </CaseStudyBody>
            </div>

            <Section id="what-dialogue-is">
              <H2>Dialogue runs AI-moderated interviews for research teams</H2>
              <CaseStudyBody>
                Participants talk to an AI interviewer, and the team gets back recordings and
                transcripts. The study chat is where researchers ask questions across those
                interviews in plain language. The running example is a checkout study,
                24 interviews for a store the study called Northline.
              </CaseStudyBody>
            </Section>

            <Section id="problem">
              <H2>The chat provided interactive insights, at a surface level</H2>
              <CaseStudyBody>
                Dialogue provides AI-moderated interviews for UX teams. The interactive chat is
                helpful, but didn't allow users to go deeper to the source. Its first version
                answered the way any LLM would: a plain black and white markdown table, long and
                hard to glance at, with no story in it. Version one is below, recreated from the
                study's own numbers.
              </CaseStudyBody>
              <DialogueVersionTable />
            </Section>

            <Section id="why-it-was-hard">
              <H2>I grouped the answer before I touched its charts</H2>
              <CaseStudyBody>
                A model can write a fluent answer from transcripts, so writing was never the hard
                part. The move was grouping: summary, sources, chart, clips, follow-ups, so every
                claim sits next to the interviews behind it. I held off redesigning the data viz
                until what existed had that structure. Quotes went first because the transcript
                interaction was already built, so a quote could open the recording at the second
                it was said. The first version shipped with the data and none of that attached.
                [PLACEHOLDER: why the first version shipped without sources]
              </CaseStudyBody>
            </Section>

            <Section id="my-role">
              <H2>I designed the study chat and owned the shape of its answers</H2>
              <CaseStudyBody>
                I was the product designer on Dialogue from December 2025 to March 2026, working
                with Benjamin Lo and Justin Hoang. The decisions here are mine: the shape every
                answer carries, and what an answer does when its evidence is thin. I designed in
                Figma and built prototypes to test the answers with people.
              </CaseStudyBody>
            </Section>

            <Section id="counter-evidence">
              <H2>
                Three people had no trouble at the address step, and their quotes stay in the
                answer
              </H2>
              <CaseStudyBody>
                The address finding is not unanimous. Three participants had no trouble, and a
                card that quotes only the 18 who struggled would oversell it. So every answer keeps
                a counter-evidence block with the names and lines of the people it does not fit. A
                split in the interviews is a finding too.
              </CaseStudyBody>
              <figure className="cs-figure dialogue-live-block">
                <DialogueRachelFrame
                  label="Counter-evidence: three participants had no trouble at the address step, and the answer keeps their lines."
                  tone="system"
                >
                  <div
                    className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
                  >
                    <CounterEvidence />
                  </div>
                </DialogueRachelFrame>
              </figure>
            </Section>

            <Section id="more-depth">
              <H2>Bringing more depth to answers</H2>
              <CaseStudyBody>
                The table above was version one. The three below answered the same question,
                where did people drop off in checkout, and each added a layer the last one
                lacked: the words alone, the words verbatim, and the answer with its evidence
                attached.
              </CaseStudyBody>
              <DialogueLeadAnswerCompare
                heading="Versions two, three and eight"
                subheading="The same question, in the order I tried them."
                question={CHECKOUT_QUESTION}
                chosenId="structured"
                annotateRaster={wrap}
                options={[
                  {
                    id: "paragraphs",
                    label: "Text only",
                    title: "Version two",
                    costLine:
                      "Very simple text responses are condensed and easy to understand, but don't allow further interaction.",
                    productScenario: "decision-paragraphs",
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    label: "Direct quotes",
                    title: "Version three",
                    costLine:
                      "Viewing responses verbatim can be helpful, but may not give researchers a higher-level overview.",
                    productScenario: "decision-quotes",
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    label: "Answer and evidence",
                    title: "Version eight",
                    costLine:
                      "An easier-to-glance data visualization with embedded responses to view directly.",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="chart-library">
              <H2>Data visualization</H2>
              <CaseStudyBody>
                The chart rules lean on IBM Carbon's data visualization guidance, named here
                because the page uses it. Bars start at zero. A line may crop instead: the
                sentiment line runs 2.4, 3.1, 3.6 across the study, and its axis crops to the
                climb. Values are labeled on the marks, so no shipped chart carries a legend.
                The sentence above a chart is the answer itself, and the peak is annotated in
                words, the largest drop, without covering any data.
              </CaseStudyBody>
              <CaseStudyBody>
                A research team reads a chart on its way into a deck, in seconds, often on a
                projector across a room. What they need to see is the step that matters and the
                count behind it, with nothing to decode first. These rules serve that read.
              </CaseStudyBody>
              <CaseStudyBody>
                Two things depart from Carbon. Its categorical palette runs to 14 colors; these
                charts stay on stone neutrals with one cherry mark on the step or group that
                matters. And Carbon has no rule for whether a chart should exist at all. Here the
                evidence count decides that, which is the thin data rule further down.
              </CaseStudyBody>
              <CaseStudyBody>
                The library below is the working set, in the order research teams reach for
                charts: themes counted by participant first, then the funnel for task flows,
                group comparisons, change over time, and the split of who raised a point and who
                did not. Counts come before percentages in a study this size, and the
                denominator stays in view. Under the library, the segment question shows the
                rules inside a full answer.
              </CaseStudyBody>
              <DialogueChartLibrary />
              <DialogueQueryMoment
                frameLabel="Inside an answer: the segment question gets a breakdown chart, and the mobile bar keeps its clip."
                question={SEGMENT_ADDRESS.question}
                summary={SEGMENT_ADDRESS.summary}
                chartTitle={SEGMENT_ADDRESS.title}
                chartCaption={SEGMENT_ADDRESS.caption}
                rows={SEGMENT_ADDRESS.rows.map((r) => ({
                  label: r.label,
                  value: r.pct,
                  display: formatChartPercent(r.pct),
                  focal: Boolean(r.focal),
                }))}
                max={100}
                selectedParticipant="Priya K."
                clip={CLIPS[2]}
                evidenceCount={24}
              />
            </Section>

            <Section id="one-structure">
              <H2>Structuring responses to set up further inquiry</H2>
              <CaseStudyBody>
                Research and design questions do not arrive in a straight line. A follow-up can
                start from any part of the last answer, so every answer carries the same five
                parts in the same order: summary, sources, chart, clips, follow-ups. The shared
                shape builds a mental model of where things live, and once it is learned, only
                the content changes. I put sources ahead of the chart: a reader should meet the
                interviews before the shape drawn from them.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="anatomy"
                title="Study chat answer card with numbered callouts for summary through follow-ups"
                assetId="D-08"
                wrapRaster={wrap}
                frameLabel="One structure: the same five parts in the same order on every answer, so the shape is learned once."
              />
            </Section>

            <Section id="clips">
              <H2>Viewing responses directly within the chat window</H2>
              <CaseStudyBody>
                A quote can be exact and still leave a reader unsure which moment it came from.
                Viewing the response directly removes that ambiguity: the clip opens the recording
                at the second the words were said, inside the chat window the answer already
                lives in. The tradeoff is context: a clip that starts mid-thought can mislead, so
                the transcript stays visible.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                assetId="D-10"
                wrapRaster={wrap}
                frameLabel="Clips: the player sits in the chat window under the answer, opened at 01:38, the moment the participant describes the card that failed."
              />
              <CaseStudyBody>
                Ruled out: a quote card that stops at the speaker's name. It scans faster, and it
                leaves a claim with no way back to the recording.
              </CaseStudyBody>
            </Section>

            <Section id="thin-data">
              <H2>Adding signals for unclear data and results</H2>
              <CaseStudyBody>
                Four interviews cannot carry a chart. A chart would give the slice the same
                weight as a finding built on eighteen, so when the evidence is thin the answer
                leads with the count and holds the chart back: 4 of 24 reads as thin at a glance.
              </CaseStudyBody>
              <CaseStudyBody>
                Under the answer, Add to my plan copies a ready-to-paste prompt for the follow-up
                study. The lead can then be checked against more interviews from the doc the team
                is already working in, instead of staying as a loose end in the chat.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data"
                title="Study chat answer that leads with the interview count and holds the chart back"
                assetId="D-13"
                wrapRaster={wrap}
                frameLabel="Thin data: a finding from four interviews must not reach a roadmap as a trend."
              />
              <CaseStudyBody>
                The rule cuts the other way at 18 of 24. When that many interviews mention address
                friction, the finding earned its chart, and the answer below is the same system
                with the chart let back in.
              </CaseStudyBody>
              <DialogueQueryMoment
                frameLabel="Coverage as an answer: 18 of 24 interviews mention address friction, so the chart is allowed back in."
                question={COVERAGE_ADDRESS.question}
                summary={
                  <>
                    {COVERAGE_ADDRESS.headline}. {COVERAGE_ADDRESS.detail}.
                  </>
                }
                searchStep={{ searched: 24, found: 18 }}
                chartTitle={COVERAGE_ADDRESS.title}
                rows={COVERAGE_ADDRESS.rows.map((r) => ({
                  label: r.label,
                  value: r.count,
                  display: String(r.count),
                  focal: Boolean(r.focal),
                }))}
                max={24}
                fillMode="magnitude"
                selectedParticipant="Jordan M."
                selectedTime="14:03"
                clip={ADDRESS_FOLLOWUP.clips[0]}
                evidenceCount={24}
              />
              <CaseStudyBody>
                Where thin starts, between 4 and 18: [PLACEHOLDER: why
                the cutoff sits where it does] What would move it is just as open. [PLACEHOLDER:
                what would change my mind about the cutoff] Until then, the count stays in the
                lead, where a reader can argue with it.
              </CaseStudyBody>
            </Section>

            <Section id="full-answer">
              <H2>A follow-up keeps the evidence of the answer it came from</H2>
              <CaseStudyBody>
                Ask a follow-up and the question narrows, and the structure does not reset. The
                filtered answer keeps the first answer's evidence in one drawer, so the thread
                from question to footage never breaks. The drawer holds everything the full
                answer holds, in less room. The second screen below is the same answer after a
                source is tapped: the tap is marked, and the drawer opens on that interview's
                clip.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="full-answer"
                title="Follow-up answer for the address step only, with every supporting clip in one drawer"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: follow-up filter, sources, chart, and clips stay linked in one drawer"
              />
              <CaseStudyBody>
                Ruled out: a follow-up that starts over with a fresh answer. Simpler to build, and
                it makes the reader check the answer from zero, as if the first one never
                happened.
              </CaseStudyBody>
            </Section>

            <Section id="learning-room">
              <H2>When room runs out, a chart goes before a source</H2>
              <CaseStudyBody>
                Room is the problem I did not solve. Every part of an answer competes for the
                same space, and that has not changed. The lesson is the order to cut in: a chart is a
                summary of the evidence, and a source is the evidence, so when something has to
                give, the chart goes first.
              </CaseStudyBody>
            </Section>

            <Section id="learning-changed-my-mind">
              <H2>I changed my mind about how much a chart should carry</H2>
              <CaseStudyBody>
                My first reach on the drop-off question was the full-detail chart: two series, a
                legend, gridlines, a drop figure on every step. It showed everything and pointed
                at nothing, so the largest drop hid in the detail. The plainer chart, one bar per
                step and one cherry mark, carries less and proves more, and I reach for it first
                now.
              </CaseStudyBody>
            </Section>
            <Section id="the-win">
              <H2>The card at the top is the win</H2>
              <CaseStudyBody>
                Version eight is the card this page opened on. It answers with the evidence
                showing: the funnel, the 18 interviews behind it, the three who disagreed, and
                the four that stay thin. Version one's table could only list the numbers. What
                the eight versions bought is an answer a researcher can check as fast as they
                can read it, and it still takes more room than I would like.
              </CaseStudyBody>
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
