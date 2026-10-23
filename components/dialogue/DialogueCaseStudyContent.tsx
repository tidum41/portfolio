"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueChartLibrary, { DialogueCoverageFigure } from "@/components/dialogue/DialogueChartLibrary";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import type { DialogueProductScenario } from "@/components/dialogue/product/DialogueProductScenario";
import "@/components/dialogue/product/dialogue-product.css";
import DialogueRachelFrame, {
  DialogueCaption,
  type DialogueFrameTone,
} from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_SUBTITLE, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "system";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Contents labels match the section H2s. */
export const DIALOGUE_TOC_ITEMS = [
  {
    id: "problem",
    label: "The chat could answer anything, but not say which interview said it",
  },
  {
    id: "why-it-matters",
    label: "A finding only travels if you can point to the interview behind it",
  },
  { id: "one-structure", label: "Every answer gets the same five parts, in the same order" },
  { id: "clips", label: "Every quote opens the recording at the second it was said" },
  { id: "chart-library", label: "A chart only when the data asks for one" },
  { id: "thin-data", label: "Say when the data is thin" },
  { id: "full-answer", label: "One answer, start to finish" },
  { id: "reflection", label: "What I did not solve" },
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
            tagline="Dialogue, contract, Dec 2025 to March 2026"
            title={DIALOGUE_TITLE}
            subtitle={DIALOGUE_SUBTITLE}
            metadata={[
              { _key: "role", label: "Role", values: ["Product designer (contract)"] },
              { _key: "timeline", label: "Timeline", values: ["Dec 2025 to March 2026"] },
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
                      <DialogueProductFigure
                        scenario="hero"
                        title="Study chat structured answer hero"
                        assetId="D-01"
                        className="dialogue-product-figure--hero-fill"
                      />
                    </div>,
                  )
                : (
                    <div className="cs-hero-media-frame dialogue-hero-media dialogue-hero-joola">
                      <DialogueProductFigure
                        scenario="hero"
                        title="Study chat structured answer hero"
                        assetId="D-01"
                        className="dialogue-product-figure--hero-fill"
                      />
                    </div>
                  )}
              <DialogueCaption
                label="The structured answer"
                sentence="The summary leads, and the sources, chart, and clips sit under it in the same order on every answer."
              />
            </>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <H2>The chat could answer anything, but not say which interview said it</H2>
              <CaseStudyBody>
                Dialogue runs AI moderated interviews for UX teams, and I designed its study chat.
                A researcher could ask a question about a study and get a long, confident answer,
                and the answer never said which interview it came from. The question I kept coming
                back to was who said that, and the chat could not answer it.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="problem-paragraphs"
                title="Study chat answer as paragraphs, with no source named for any claim"
                frameLabel="Problem: a long answer with no source named, so nothing in it can be checked."
              />
            </Section>

            <Section id="why-it-matters">
              <H2>A finding only travels if you can point to the interview behind it</H2>
              <CaseStudyBody>
                I tested with Benjamin and Justin, and with students running mock interviews. I did
                not have Dialogue customers to test with, and I will not pretend those sessions
                were that. What I had was the same reaction in both rooms: people asked who said
                that before they would trust a long answer, and without a path back to the
                interview, the answer stayed a guess. The structured answer below also keeps a
                source that disagrees inside the card, under counter evidence, because a split in
                the interviews is a finding too.
              </CaseStudyBody>
              <DialogueLeadAnswerCompare
                heading="Lead with the answer"
                subheading="Three ways the chat could answer the same question."
                chosenId="structured"
                annotateRaster={wrap}
                options={[
                  {
                    id: "paragraphs",
                    label: "Wall of text",
                    title: "Paragraphs",
                    costLine:
                      "Reads complete, but you still cannot name who said what before you act.",
                    productScenario: "decision-paragraphs",
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    label: "Quotes only",
                    title: "Quote list",
                    costLine: "Faithful to the footage, but you still count by hand.",
                    productScenario: "decision-quotes",
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    label: "Answer + evidence",
                    title: "Structured answer",
                    costLine:
                      "Clearer in one glance. The cost is room: summary, chart, and clips all have to fit inside one answer.",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="one-structure">
              <H2>Every answer gets the same five parts, in the same order</H2>
              <CaseStudyBody>
                Summary, sources, chart, clips, follow ups. I kept the order fixed so a reader
                learns the shape once and then only reads what changes. I study cognitive science,
                so I think about order as a memory problem: attention should go to the answer, not
                to relearning the layout. The cost of a fixed order is that a simple answer
                carries the same furniture as a hard one.
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
              <H2>Every quote opens the recording at the second it was said</H2>
              <CaseStudyBody>
                A quote without a timestamp forces you to hunt the recording, and a quote you
                cannot check is the chat asking to be trusted again. The player opens at the exact
                second, with the transcript in sync, so the line can be verified in one click. The
                cost is context: a clip that starts mid thought can mislead, so the transcript
                around the line stays visible.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                assetId="D-10"
                wrapRaster={wrap}
                frameLabel="Solution: clip starts at 01:38, on the line about the card that failed, so the quote can be checked in one click"
              />
            </Section>

            <Section id="chart-library">
              <H2>A chart only when the data asks for one</H2>
              <CaseStudyBody>
                This pair puts the chart I first reached for next to the one I kept, on the same
                data. The reader should find the step that matters without reading a legend, and a
                chart that cannot do that does not belong in the answer.
              </CaseStudyBody>
              <DialogueChartLibrary />
            </Section>

            <Section id="thin-data">
              <H2>Say when the data is thin</H2>
              <CaseStudyBody>
                A chart makes four interviews look like a trend. When the evidence is thin, the
                answer leads with the count and holds the chart back. The cost is a weaker
                looking answer, and I would rather the answer look weak than borrow confidence it
                has not earned.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data"
                title="Study chat answer that leads with the interview count and holds the chart back"
                assetId="D-13"
                wrapRaster={wrap}
                frameLabel="Thin data: a finding from four interviews must not reach a roadmap as a trend."
              />
              <CaseStudyBody>
                Coverage is the other side of the same rule: when the count behind a finding is
                large, the chart is allowed back in.
              </CaseStudyBody>
              <DialogueCoverageFigure />
            </Section>

            <Section id="full-answer">
              <H2>One answer, start to finish</H2>
              <CaseStudyBody>
                Ask a follow up and the question narrows, and the structure does not reset. The
                filtered answer keeps its sources, its chart, and every supporting clip in one
                drawer, so the reader never has to rebuild the evidence for a smaller question.
                The cost is that the drawer has to hold everything the full answer holds, in less
                room.
              </CaseStudyBody>
              <CaseStudyBody>
                A second answer is already on this page: the thin data answer above, where the
                count leads and the chart is held back.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="full-answer"
                title="Follow-up answer for mobile only, with every supporting clip in one drawer"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: follow-up filter, sources, chart, and clips stay linked in one drawer"
              />
            </Section>

            <Section id="reflection">
              <H2>What I did not solve</H2>
              <CaseStudyBody>
                Room. One answer has to hold a summary, a chart, and clips, and those parts still
                compete, so when something has to give, I cut a chart before I cut a source. The
                harder test is still ahead: researchers asking about their own studies, where
                they already know when an answer is wrong.
              </CaseStudyBody>
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
