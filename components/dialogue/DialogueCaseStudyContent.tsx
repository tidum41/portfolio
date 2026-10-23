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
import type { DialogueProductScenario } from "@/components/dialogue/product/DialogueProductScenario";
import "@/components/dialogue/product/dialogue-product.css";
import DialogueRachelFrame, { type DialogueFrameTone } from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_SUBTITLE, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import { ANATOMY_LABELS, ANATOMY_PART_IDS } from "@/lib/dialogue/product/sampleData";

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
  { id: "one-structure", label: "Every answer gets one fixed structure" },
  { id: "clips", label: "A quote with no context" },
  { id: "chart-library", label: "A chart only when the data asks for one" },
  { id: "thin-data", label: "Say when the data is thin" },
  { id: "full-answer", label: "One answer, start to finish" },
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
            tagline="Dialogue, contract, 2026"
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
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem">
              <H2>The chat could answer anything, but not say which interview said it</H2>
              <CaseStudyBody>
                AI-moderated interviews for enterprise UX teams and startups. Teams could not see
                which interview said what, so a long answer felt like a guess.
              </CaseStudyBody>
            </Section>

            <Section id="why-it-matters">
              <H2>A finding only travels if you can point to the interview behind it</H2>
              <CaseStudyBody>
                In sessions with Benjamin and Justin, and with students running mock interviews,
                people asked who said that before they would trust a long answer. Those sessions
                stood in for research customers. The gap was the same either way: without a path
                back to the interview, the answer stayed a guess.
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
                      "Clearer in one glance, but the chat has to hold summary, chart, and clips without feeling crowded.",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="one-structure">
              <H2>Every answer gets one fixed structure</H2>
              <CaseStudyBody>
                Parts stay in order: 1 Summary, 2 Sources, 3 Chart, 4 Clips, 5 Follow-ups. Only
                the chart changes shape. A source that disagrees stays in the card, under Counter-evidence.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="anatomy"
                title="Study chat answer card with numbered callouts for summary through follow-ups"
                assetId="D-08"
                wrapRaster={wrap}
              />
              <ol className="dialogue-anatomy-list">
                {ANATOMY_LABELS.map((label, i) => (
                  <li key={label} data-anatomy-list-part={ANATOMY_PART_IDS[i]}>
                    <span>{i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="clips">
              <H2>A quote with no context</H2>
              <CaseStudyBody>
                A quote without a timestamp forces you to hunt the recording. The player opens at
                the exact second, with the transcript in sync.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                assetId="D-10"
                wrapRaster={wrap}
                frameLabel="Solution: clip starts at 01:38 so the card-failed quote can be checked in one click"
              />
            </Section>

            <Section id="chart-library">
              <H2>A chart only when the data asks for one</H2>
              <CaseStudyBody>
                Each pair puts the common choice next to mine, on the same data.
              </CaseStudyBody>
              <DialogueChartLibrary />
            </Section>

            <Section id="thin-data">
              <H2>Say when the data is thin</H2>
              <CaseStudyBody>
                A chart of four interviews looks like a trend. The warning makes the evidence size the
                first thing you see.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data"
                title="Study chat answer that leads with the interview count and holds the chart back"
                assetId="D-13"
                wrapRaster={wrap}
                frameLabel="Thin data: a finding from four interviews must not reach a roadmap as a trend."
              />
            </Section>

            <Section id="full-answer">
              <H2>One answer, start to finish</H2>
              <CaseStudyBody>
                You ask a follow-up, get a filtered answer, tap a source, and every supporting clip
                for that answer sits in one drawer. The structure does not reset when the question
                narrows.
              </CaseStudyBody>
              <CaseStudyBody>
                A second answer is already on this page: the payment question above, where the
                count leads and the chart is held back.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="full-answer"
                title="Follow-up answer for mobile only, with every supporting clip in one drawer"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: follow-up filter, sources, chart, and clips stay linked in one drawer"
              />
              <div className="dialogue-full-answer-outcome">
                <CaseStudyBody>
                  Limit: the chat has to hold summary, chart, and clips without feeling crowded.
                </CaseStudyBody>
              </div>
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
