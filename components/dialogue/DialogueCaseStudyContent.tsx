"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueHeroMoment from "@/components/dialogue/DialogueHeroMoment";
import CountsFigure from "@/components/dialogue/product/scenarios/CountsFigure";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
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

/** Round N (checkable answers): one decision per section, TOC per the plan. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "context", label: "Context" },
  { id: "problem", label: "Problem" },
  { id: "evidence", label: "Evidence" },
  { id: "counts", label: "Counts" },
  { id: "clips", label: "Clips" },
  { id: "thin-data", label: "Thin data" },
  { id: "next", label: "Next" },
];

function Section({
  id,
  children,
  noReveal = false,
  separated = false,
}: {
  id: string;
  children: React.ReactNode;
  noReveal?: boolean;
  /** Round N: the Next section sits after a divider with a larger gap. */
  separated?: boolean;
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
        ...(separated
          ? {
              marginTop: "calc(var(--dialogue-section-gap) * 0.5)",
              borderTop: "1px solid var(--color-border-subtle)",
              paddingTop: "calc(var(--dialogue-section-gap) * 0.5)",
            }
          : {}),
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

/** A live product figure that is not a DialogueProductFigure scenario. */
function LiveFigureBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame label={label} tone="system">
        <div
          className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
        >
          {children}
        </div>
      </DialogueRachelFrame>
    </figure>
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
                label="Overview"
                sentence="One answer in the study chat, with the sources it came from."
              />
            </>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="context">
              <H2>Context</H2>
              <CaseStudyBody>
                Dialogue runs AI-moderated interviews for UX research teams and turns them into
                a study site with a chat. I designed how that chat answers, so a team can see
                who said something and watch them say it.
              </CaseStudyBody>
            </Section>

            <Section id="problem">
              <H2>The chat gave answers you couldn&rsquo;t check</H2>
              <CaseStudyBody>
                An answer came back as a confident paragraph. A stakeholder reading it would
                ask how many people said that, and the paragraph had no way to show them.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="problem-paragraphs"
                title="Study chat answer as it was: a prose paragraph over collapsed quote cards, with no count"
                wrapRaster={wrap}
                frameLabel="Problem: the answer as it was, a paragraph over collapsed quote cards, and no count."
              />
            </Section>

            <Section id="evidence">
              <H2>Bringing more depth to answers</H2>
              <CaseStudyBody>
                I put one question through three formats. Text only was quick to read but went
                nowhere, while direct quotes kept people&rsquo;s words but lost the overview.
                Answer and evidence kept both.
              </CaseStudyBody>
              <DialogueLeadAnswerCompare
                question={HERO_QUESTION}
                chosenId="structured"
                annotateRaster={wrap}
                options={[
                  {
                    id: "paragraphs",
                    label: "Text only",
                    title: "Text only",
                    productScenario: "decision-paragraphs",
                    rasterAssetId: "D-04",
                  },
                  {
                    id: "quote-list",
                    label: "Direct quotes",
                    title: "Direct quotes",
                    productScenario: "decision-quotes",
                    rasterAssetId: "D-05",
                  },
                  {
                    id: "structured",
                    label: "Answer and evidence",
                    title: "Answer and evidence",
                    productScenario: "decision-structured",
                    rasterAssetId: "D-06",
                  },
                ]}
              />
            </Section>

            <Section id="counts">
              <H2>Counts you can open</H2>
              <CaseStudyBody>
                With 24 interviews a percent hides how few people sit behind it, so the bar
                reads 18 of 24. Each segment opens the people inside it, including the 6 of 24
                who did not struggle.
              </CaseStudyBody>
              <LiveFigureBlock label="Counts: the 6 of 24 did not segment is selected, and its panel is open under the bar.">
                <CountsFigure />
              </LiveFigureBlock>
            </Section>

            <Section id="clips">
              <H2>Watching the moment without leaving the chat</H2>
              <CaseStudyBody>
                Tapping a response plays that clip inside the answer, starting at the moment
                the participant says it. The transcript highlights along with it, so checking a
                claim takes seconds and you never leave the conversation.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="inline-clip"
                title="Clip playing inside the chat answer, with the speaker's line highlighted in the synced transcript"
                wrapRaster={wrap}
                frameLabel="Clips: the clip plays inside the answer, with the transcript line lit under it."
              />
            </Section>

            <Section id="thin-data">
              <H2>Flagging answers that rest on little</H2>
              <CaseStudyBody>
                Only 4 of 24 interviews mention autofill skipping the apartment field on
                mobile. The answer says so under its count, so a lead isn&rsquo;t read as a
                trend.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data-slim"
                title="Thin-data answer with a plain text count reading Based on 4 of 24 interviews"
                wrapRaster={wrap}
                frameLabel="Thin data: the answer states its count in plain text."
              />
            </Section>

            <Section id="next" separated>
              <H2>What I&rsquo;d test next</H2>
              <CaseStudyBody>
                I don&rsquo;t have outcome numbers yet. I&rsquo;d test whether stakeholders
                who can open the evidence stop asking who said that, and whether thin-data flags
                change what teams study next.
              </CaseStudyBody>
              <div className="cs-test-grid" data-annotate-part="test-grid">
                <div className="cs-test-grid__head" aria-hidden>
                  <span>Test</span>
                  <span>Signal</span>
                </div>
                <div className="cs-test-grid__row">
                  <p>Stakeholders who can open the evidence</p>
                  <p>They stop asking who said that</p>
                </div>
                <div className="cs-test-grid__row">
                  <p>Thin-data flags on answers</p>
                  <p>What teams choose to study next changes</p>
                </div>
              </div>
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
