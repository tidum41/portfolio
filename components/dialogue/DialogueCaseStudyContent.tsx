"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueChartGallery from "@/components/dialogue/DialogueChartGallery";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import type { DialogueProductScenario } from "@/components/dialogue/product/DialogueProductScenario";
import "@/components/dialogue/product/dialogue-product.css";
import DialoguePlacementCompare from "@/components/dialogue/DialoguePlacementCompare";
import DialogueRachelFrame, { type DialogueFrameTone } from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_SUBTITLE, DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "system";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Short forms of the section H2s for the left nav. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "why-it-matters", label: "Finding travels" },
  { id: "one-structure", label: "Fixed structure" },
  { id: "fitted-charts", label: "Chart fits" },
  { id: "clips", label: "Quote context" },
  { id: "placement", label: "Floating chat" },
  { id: "full-answer", label: "One answer" },
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
              <H2>Dialogue&apos;s study chat could answer anything…</H2>
              <CaseStudyBody>
                AI-moderated interviews for enterprise UX teams and startups.
              </CaseStudyBody>
              <H2>…but you couldn&apos;t tell which interview said it.</H2>
              <CaseStudyBody>
                Teams could not see which interview said what, so a long answer felt like a guess.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="problem-paragraphs"
                title="Study chat answer as three dense paragraphs with no linked sources"
                assetId="D-02"
                wrapRaster={wrap}
                frameLabel="Problem: three paragraphs, no sources"
              />
            </Section>

            <Section id="why-it-matters">
              <H2>A finding only travels if you can point to the interview behind it</H2>
              <CaseStudyBody>
                In sessions with Benjamin and Justin, and with students running mock interviews,
                people asked who said that before they would trust a long answer. Those sessions
                stood in for research customers. The gap was the same either way: without a path
                back to the interview, the answer stayed a guess.
              </CaseStudyBody>
              <blockquote className="dialogue-evidence-pull">
                <p className="dialogue-evidence-pull__quote">Who said that?</p>
                <footer className="dialogue-evidence-pull__meta">
                  Heard before anyone would act on a long answer
                </footer>
              </blockquote>

              <DialogueLeadAnswerCompare
                heading="Lead with the answer, back it with evidence"
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
                    costLine:
                      "Faithful to the footage, but you still count by hand. Nine quotes is not a finding.",
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
                This is the system everything else hangs on. Parts stay in order: 1 Sources, 2
                Summary, 3 Chart, 4 Clips, 5 Follow-ups. Only part 3 changes shape.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="anatomy"
                title="Study chat answer card with numbered callouts for sources through follow-ups"
                assetId="D-08"
                wrapRaster={wrap}
              />
            </Section>

            <Section id="fitted-charts">
              <H2>The chart fits the question</H2>
              <CaseStudyBody>
                Supporting part 3: I grouped real chat questions by type and gave each a chart
                shape. A question-type classifier picks the chart. If nothing fits, the answer stays
                text with sources and clips.
              </CaseStudyBody>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "var(--color-text-muted)",
                }}
              >
                Study data in these figures is illustrative.
              </p>
              {wrap ? wrap("D-09", <DialogueChartGallery />) : <DialogueChartGallery />}
            </Section>

            <Section id="clips">
              <H2>A quote with no context</H2>
              <CaseStudyBody>
                Supporting part 4: the clip opens at the exact second, with the transcript in sync.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                assetId="D-10"
                wrapRaster={wrap}
                frameLabel="Solution: clip starts at 01:38 so the apartment-field quote can be checked in one click"
              />
            </Section>

            <Section id="placement">
              <H2>Instead of a docked sidebar, I kept the floating chat</H2>
              <CaseStudyBody>
                I compared a persistent sidebar with the pop-up chat pattern Dialogue already used on
                study pages. The answer structure inside the chat stays the same either way.
              </CaseStudyBody>
              <div style={{ marginTop: 24 }}>
                {wrap ? wrap("D-13", <DialoguePlacementCompare />) : <DialoguePlacementCompare />}
              </div>
            </Section>

            <Section id="full-answer">
              <H2>One answer, start to finish</H2>
              <CaseStudyBody>
                Back to the same structure: after a part 5 follow-up, parts 1 through 4 still hold
                together for the new answer, with every supporting clip in one drawer.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="full-answer"
                title="Follow-up answer for mobile only, with every supporting clip in one drawer"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: a mobile-only follow-up still keeps every supporting clip in one drawer"
              />
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
