"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import CaseStudyPlaceholder from "@/components/CaseStudyPlaceholder";
import DecisionBlock from "@/components/DecisionBlock";
import DialogueChartGallery from "@/components/dialogue/DialogueChartGallery";
import DialogueLiveFigure from "@/components/dialogue/DialogueLiveFigure";
import DialoguePlacementCompare from "@/components/dialogue/DialoguePlacementCompare";
import DialogueRachelFrame, { type DialogueFrameTone } from "@/components/dialogue/DialogueRachelFrame";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import type { DialogueFigureTier } from "@/lib/caseStudies/dialogueFigureTiers";

function frameToneFromLabel(label: string): DialogueFrameTone {
  if (label.startsWith("Problem:")) return "problem";
  if (label.startsWith("Solution:")) return "solution";
  return "neutral";
}

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "why-it-matters", label: "Why it matters" },
  { id: "one-structure", label: "One structure" },
  { id: "fitted-charts", label: "Fitted charts" },
  { id: "proof", label: "Proof" },
  { id: "clips", label: "Clips" },
  { id: "imperfect-evidence", label: "Messy research" },
  { id: "share-finding", label: "Copy as card" },
  { id: "placement", label: "Floating chat" },
  { id: "full-answer", label: "One answer" },
  { id: "outcome", label: "Outcome" },
  { id: "reflection", label: "Reflection" },
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

function LiveFigureBlock({
  exportRoute,
  title,
  tier,
  assetId,
  wrapRaster,
  frameLabel,
  frameTone,
}: {
  exportRoute: string;
  title: string;
  tier: DialogueFigureTier;
  assetId?: string;
  wrapRaster?: RasterAnnotator;
  frameLabel?: string;
  frameTone?: DialogueFrameTone;
}) {
  const tone = frameTone ?? (frameLabel ? frameToneFromLabel(frameLabel) : "neutral");
  const media = (
    <DialogueRachelFrame label={frameLabel} tone={tone}>
      <DialogueLiveFigure
        exportRoute={exportRoute}
        title={title}
        tier={tier}
        assetId={assetId}
      />
    </DialogueRachelFrame>
  );
  const wrapped = assetId && wrapRaster ? wrapRaster(assetId, media) : media;
  return <figure className="cs-figure dialogue-live-block">{wrapped}</figure>;
}

function LivePairColumn({
  frameLabel,
  exportRoute,
  title,
  rasterId,
  wrapRaster,
}: {
  frameLabel: string;
  exportRoute: string;
  title: string;
  rasterId?: string;
  wrapRaster?: RasterAnnotator;
}) {
  const media = (
    <DialogueRachelFrame label={frameLabel} tone={frameToneFromLabel(frameLabel)}>
      <DialogueLiveFigure exportRoute={exportRoute} title={title} tier="pair" assetId={rasterId} />
    </DialogueRachelFrame>
  );
  return (
    <div className="dialogue-pair-cell" style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
      {rasterId && wrapRaster ? wrapRaster(rasterId, media) : media}
    </div>
  );
}

function PlaceholderColumn({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
      {children}
      <p className="cs-figcaption">{caption}</p>
    </div>
  );
}

function PairRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dialogue-pair"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 24,
        alignItems: "stretch",
      }}
    >
      {children}
    </div>
  );
}

function VisualPending() {
  return (
    <div
      className="dialogue-visual-pending"
      style={{
        marginTop: 24,
        padding: "48px 24px",
        borderRadius: "var(--radius-card)",
        border: "1px dashed var(--color-border-subtle)",
        background: "var(--color-accent-subtle)",
        textAlign: "center",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-text-muted)",
        letterSpacing: "0.02em",
      }}
    >
      Visual pending
    </div>
  );
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
                  <div className="cs-hero-media-frame dialogue-hero-media">
                    <div className="dialogue-hero-breakout">
                      <DialogueRachelFrame tone="neutral">
                        <DialogueLiveFigure
                          exportRoute="hero"
                          title="Study chat structured answer hero"
                          tier="full"
                          assetId="D-01"
                        />
                      </DialogueRachelFrame>
                    </div>
                  </div>,
                )
              : (
                  <div className="cs-hero-media-frame dialogue-hero-media">
                    <div className="dialogue-hero-breakout">
                      <DialogueRachelFrame tone="neutral">
                        <DialogueLiveFigure
                          exportRoute="hero"
                          title="Study chat structured answer hero"
                          tier="full"
                          assetId="D-01"
                        />
                      </DialogueRachelFrame>
                    </div>
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
              <PairRow>
                <LivePairColumn
                  rasterId="D-02"
                  wrapRaster={wrap}
                  frameLabel="Problem: three paragraphs, no sources"
                  exportRoute="section-1"
                  title="Study chat answer as three dense paragraphs with no linked sources"
                />
                <LivePairColumn
                  rasterId="D-03"
                  wrapRaster={wrap}
                  frameLabel="Solution: one claim, one chart, linked moments"
                  exportRoute="section-4"
                  title="Study chat answer with summary, chart, and linked moments"
                />
              </PairRow>

              <DecisionBlock
                heading="Lead with the answer, back it with evidence"
                subheading="Three ways the chat could answer the same question."
                chosenId="structured"
                annotateRaster={wrap}
                options={[
                  {
                    id: "paragraphs",
                    title: "Paragraphs",
                    priorityLine: "The priority is prose over evidence.",
                    howeverLine:
                      "However, you still cannot see who said what, or how many interviews agree.",
                    liveExport: {
                      exportRoute: "section-1",
                      title: "Study chat answer as three paragraphs of prose with no structure",
                    },
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    title: "Quote list",
                    priorityLine: "The priority is fidelity over synthesis.",
                    howeverLine: "However, there is no answer line. You still do the counting.",
                    liveExport: {
                      exportRoute: "section-2",
                      title: "Study chat answer as a list of interview quotes without a summary",
                    },
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    title: "Structured answer",
                    priorityLine: "The priority is clarity over raw quotes.",
                    selectionNote: "We went with this",
                    reasonLines: ["Finding first", "The number behind it", "Clips one tap away"],
                    liveExport: {
                      exportRoute: "section-4",
                      title: "Study chat answer with a summary line, chart, and linked clips",
                    },
                    rasterAssetId: "D-06",
                  },
                ]}
              />

              <div style={{ marginTop: 24 }}>
                <LiveFigureBlock
                  exportRoute="section-4"
                  title="Selected checkout step with a clips list tied to that bar"
                  tier="full"
                  assetId="D-07"
                  wrapRaster={wrap}
                  frameLabel="Solution: selecting a bar filters the clips behind it"
                />
              </div>
            </Section>

            <Section id="why-it-matters">
              <H2>A finding only travels if you can point to the interview behind it</H2>
              <CaseStudyBody>
                I heard the same trust gap in conversations with Benjamin and Justin, Dialogue&apos;s
                product team, and students in interview sessions (not Dialogue research customers).
              </CaseStudyBody>
              <CaseStudyPlaceholder>
                One concrete thing Benjamin, Justin, the product team, or a student said about study
                chat or trusting an answer.
              </CaseStudyPlaceholder>
            </Section>

            <Section id="one-structure">
              <H2>Every answer gets one fixed structure</H2>
              <CaseStudyBody>
                Only the chart changes. Sources, summary, chart, clips, and follow-ups stay in order.
              </CaseStudyBody>
              <div style={{ marginTop: 24 }}>
                <LiveFigureBlock
                  exportRoute="section-3"
                  title="Study chat answer card with numbered callouts for sources through follow-ups"
                  tier="full"
                  assetId="D-08"
                  wrapRaster={wrap}
                />
              </div>
            </Section>

            <Section id="fitted-charts">
              <H2>The chart fits the question</H2>
              <CaseStudyBody>
                I grouped real chat questions by type and gave each a chart shape that fits the
                question.
              </CaseStudyBody>
              {wrap ? wrap("D-09", <DialogueChartGallery />) : <DialogueChartGallery />}
            </Section>

            <Section id="proof">
              <H2>A number with no proof</H2>
              <CaseStudyBody>Selecting a bar filters the clips to the moments behind it.</CaseStudyBody>
              <PlaceholderColumn caption="Problem: a number with nothing behind it">
                <CaseStudyPlaceholder>
                  Export a crop of the selected bar before the clips block appears (matching the
                  solution frame).
                </CaseStudyPlaceholder>
              </PlaceholderColumn>
            </Section>

            <Section id="clips">
              <H2>A quote with no context</H2>
              <CaseStudyBody>The clip opens at the exact second with the transcript in sync.</CaseStudyBody>
              <PairRow>
                <PlaceholderColumn caption="Problem: quote without the moment behind it">
                  <CaseStudyPlaceholder>
                    Export a crop of the quote or transcript before the player opens at the timestamp
                    (matching the solution frame).
                  </CaseStudyPlaceholder>
                </PlaceholderColumn>
                <LivePairColumn
                  rasterId="D-10"
                  wrapRaster={wrap}
                  frameLabel="Solution: the clip opens at 01:38 with the speaker row highlighted"
                  exportRoute="section-5"
                  title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
                />
              </PairRow>
            </Section>

            <Section id="imperfect-evidence">
              <H2>When the research doesn&apos;t settle it</H2>
              <CaseStudyBody>
                Real studies are messy. Some answers rest on four interviews, some on none, and some
                participants disagree. Stating every answer with the same confidence would mislead the
                teams who plan from them, so each answer shows how strong its evidence is.
              </CaseStudyBody>
              {wrap ? wrap("D-11", <VisualPending />) : <VisualPending />}
              <p className="cs-figcaption" style={{ marginTop: 8 }}>
                Counter-evidence shows who disagreed. Low coverage hides the chart and calls the
                answer a lead. With no match, the chat suggests a question the interviews did cover.
              </p>
            </Section>

            <Section id="share-finding">
              <H2>A finding has to leave the chat</H2>
              <CaseStudyBody>
                Findings usually end up in a slide or a Slack thread, retyped and stripped of their
                proof. Copy as card exports the finding with its chart, two clips and its coverage, so
                the evidence travels with it.
              </CaseStudyBody>
              {wrap ? wrap("D-12", <VisualPending />) : <VisualPending />}
              <p className="cs-figcaption" style={{ marginTop: 8 }}>
                One action copies a ready-to-paste card. A thin finding keeps its low-coverage note,
                so it can&apos;t pass as solid.
              </p>
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
              <LiveFigureBlock
                exportRoute="section-7"
                title="Structured answer card beside a drawer listing every clip behind the answer"
                tier="full"
                assetId="D-15"
                wrapRaster={wrap}
                frameLabel="Solution: the full answer, with every supporting clip in one drawer"
              />
            </Section>

            <Section id="outcome">
              <H2>It didn&apos;t ship as drawn, but it shaped what did</H2>
              <CaseStudyBody>
                I walked Benjamin and Justin through this exploration. It did not ship as designed,
                but it shaped the study chat that did.
              </CaseStudyBody>
              <CaseStudyPlaceholder>
                Which parts of this exploration influenced what shipped (structure, clips, charts,
                follow-ups, or something else)?
              </CaseStudyPlaceholder>
            </Section>

            <Section id="reflection">
              <H2>Reflection</H2>
              <CaseStudyPlaceholder>
                Two or three lessons from this project, each a one-line claim plus one sentence.
              </CaseStudyPlaceholder>
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
