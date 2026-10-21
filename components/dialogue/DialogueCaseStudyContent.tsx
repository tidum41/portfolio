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
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "system";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "why-it-matters", label: "Why it matters" },
  { id: "one-structure", label: "One structure" },
  { id: "fitted-charts", label: "Fitted charts" },
  { id: "clips", label: "Clips" },
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
      style={{
        scrollMarginTop: 120,
        paddingBottom: "var(--section-pb)",
        marginBottom: "var(--section-gap)",
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
            metadata={[
              { _key: "role", label: "Role", values: ["Product designer (contract)"] },
              { _key: "timeline", label: "Timeline", values: ["Dec 2025 to March 2026"] },
              {
                _key: "team",
                label: "Team",
                wide: true,
                values: [
                  <>
                    Benjamin Lo{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>Co-founder, CEO</span>
                  </>,
                  <>
                    Justin Hoang{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>Co-founder, CPO</span>
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
                    priorityLine: "The priority is prose over evidence.",
                    howeverLine:
                      "However, you still cannot see who said what, or how many interviews agree.",
                    productScenario: "decision-paragraphs",
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    label: "Quotes only",
                    title: "Quote list",
                    priorityLine: "The priority is fidelity over synthesis.",
                    howeverLine: "However, there is no answer line. You still do the counting.",
                    productScenario: "decision-quotes",
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    label: "Answer + evidence",
                    title: "Structured answer",
                    priorityLine: "The priority is clarity over raw quotes.",
                    howeverLine:
                      "However, the chat still has to carry summary, evidence, and clips in one answer.",
                    selectionNote: "We went with this",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="why-it-matters">
              <H2>A finding only travels if you can point to the interview behind it</H2>
              <CaseStudyBody>
                I heard the same trust gap in conversations with Benjamin and Justin, Dialogue&apos;s
                product team, and students in interview sessions (not Dialogue research customers).
              </CaseStudyBody>
            </Section>

            <Section id="one-structure">
              <H2>Every answer gets one fixed structure</H2>
              <CaseStudyBody>
                Only the chart changes. Sources, summary, chart, clips, and follow-ups stay in order.
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
                I grouped real chat questions by type and gave each a chart shape that fits the
                question.
              </CaseStudyBody>
              {wrap ? wrap("D-09", <DialogueChartGallery />) : <DialogueChartGallery />}
            </Section>

            <Section id="clips">
              <H2>A quote with no context</H2>
              <CaseStudyBody>The clip opens at the exact second with the transcript in sync.</CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                assetId="D-10"
                wrapRaster={wrap}
                frameLabel="Solution: the clip opens at 01:38 with the speaker row highlighted"
              />
            </Section>

            <Section id="placement">
              <H2>Instead of a docked sidebar, I kept the floating chat</H2>
              <CaseStudyBody>
                I compared a persistent sidebar with the pop-up chat pattern Dialogue already used on
                study pages.
              </CaseStudyBody>
              <div style={{ marginTop: 24 }}>
                {wrap ? wrap("D-13", <DialoguePlacementCompare />) : <DialoguePlacementCompare />}
              </div>
            </Section>

            <Section id="full-answer">
              <H2>One answer, start to finish</H2>
              <CaseStudyBody>Question, chart, and every supporting clip in one drawer.</CaseStudyBody>
              <ProductFigureBlock
                scenario="full-answer"
                title="Structured answer card beside a drawer listing every clip behind the answer"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: the full answer, with every supporting clip in one drawer"
              />
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
