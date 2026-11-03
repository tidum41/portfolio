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
import ScopeFigure from "@/components/dialogue/product/scenarios/ScopeFigure";
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

/** Direction A (decision log): one decision per section, TOC labels per the outline. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "evidence", label: "Evidence" },
  { id: "clips", label: "Clips" },
  { id: "scope", label: "Scope" },
  { id: "counts", label: "Counts" },
  { id: "thin-data", label: "Thin data" },
  { id: "next", label: "Next" },
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
            tagline="Dialogue"
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
                sentence="A study chat answer that shows its count and the quote behind it."
              />
            </>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="overview">
              <CaseStudyBody>
                Dialogue runs AI-moderated interviews for UX research teams and synthesizes
                them into a study site. I designed answers for its study chat that show the
                count and the quotes behind every claim. Research is never linear, so each
                answer is built to set up the next question. Dialogue&rsquo;s team adopted the
                study-wide chat and its count bars.
              </CaseStudyBody>
              <CaseStudyBody>Product designer (contract), Dec 2025 to Mar 2026.</CaseStudyBody>
            </Section>

            <Section id="problem">
              <H2>The chat provided interactive insights, at a surface level</H2>
              <CaseStudyBody>
                Dialogue&rsquo;s interactive chat is helpful, but didn&rsquo;t allow users to go
                deeper to the source. A stakeholder reading an answer asks who said that and
                how many, and a paragraph can&rsquo;t tell them. It also gives the researcher
                nowhere to go next.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="problem-paragraphs"
                title="Study chat answer as it was: a prose paragraph above cited quote cards, with no count"
                wrapRaster={wrap}
                frameLabel="Problem: the answer as it was, a paragraph over cited quote cards, and no count anywhere."
              />
            </Section>

            <Section id="evidence">
              <H2>Answers lead with evidence you can check</H2>
              <CaseStudyBody>
                I put the same question through three formats. Text only is condensed and easy
                to read, but it allows no further interaction. Direct quotes keep the
                participants&rsquo; own words, but they don&rsquo;t give a higher-level
                overview. Answer and evidence won: a sentence and an easy-to-glance count, with
                the responses embedded so you can view them directly.
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

            <Section id="clips">
              <H2>Viewing responses directly within the chat window</H2>
              <CaseStudyBody>
                If we linked each quote out to its section page, people would get the full
                context of the interview. But every check would pull them out of the
                conversation they were building. So the clip plays under the answer, starting
                at the exact moment the participant says it, and a &ldquo;view session&rdquo;
                action opens the full interview for anyone who needs more.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="clip-player"
                title="Interview player in the chat window with the speaker's line highlighted in the synced transcript"
                wrapRaster={wrap}
                frameLabel="Clips: the player sits in the chat window under the answer, opened at the moment the participant says it."
              />
            </Section>

            <Section id="scope">
              <H2>One chat answers across the whole study</H2>
              <CaseStudyBody>
                Dialogue&rsquo;s chat already existed for single interviews, and keeping it
                there would have kept answers tightly scoped. The questions teams ask, though,
                run across people: how many hit this, and did anyone disagree. A per-interview
                chat can&rsquo;t count. I moved the chat to the study level so every answer can
                draw on all 24 interviews.
              </CaseStudyBody>
              <LiveFigureBlock label="Scope: the same question in a chat scoped to one interview, and in the study chat.">
                <ScopeFigure />
              </LiveFigureBlock>
            </Section>

            <Section id="counts">
              <H2>Counts come first, percents second</H2>
              <CaseStudyBody>
                With 24 interviews, a percent hides how few people sit behind it. The bar reads
                &ldquo;18 of 24 interviews&rdquo; with the answer as its title and values on the
                marks. Counter-evidence stays in the same bar, so the 6 who had no trouble are
                weighed instead of averaged away. Each bar opens the quotes behind its count.
              </CaseStudyBody>
              <LiveFigureBlock label="Counts: one bar for the split, with the quotes behind each side open under it.">
                <CountsFigure />
              </LiveFigureBlock>
            </Section>

            <Section id="thin-data">
              <H2>Adding signals for unclear data and results</H2>
              <CaseStudyBody>
                Some answers rest on very little. Only 4 of 24 interviews mention autofill
                skipping the apartment field on mobile, which is a lead and not yet a trend. I
                flag it in the answer instead of hiding it, because a researcher deciding what
                to study next needs to see where the evidence is thin. Dialogue&rsquo;s team
                adopted these flags too.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data"
                title="Thin-data answer with a muted note reading Based on 4 of 24 interviews"
                wrapRaster={wrap}
                frameLabel="Thin data: the answer flags its own count instead of hiding it."
              />
            </Section>

            <Section id="next">
              <H2>Structuring responses to set up further inquiry</H2>
              <CaseStudyBody>
                UX research and design are never linear. Organizing every answer the same way
                helps a team build a mental model of the study and invites the next question,
                through follow-up chips and an &ldquo;Add to my plan&rdquo; action that copies a
                prompt for a new study. I don&rsquo;t have outcome numbers yet. Next I&rsquo;d
                test whether stakeholders who can open the evidence ask fewer &ldquo;who said
                that&rdquo; questions, and whether thin-data flags change what teams choose to
                research next.
              </CaseStudyBody>
              <ProductFigureBlock
                scenario="thin-data-plan"
                title="Thin-data answer with Add to my plan tapped, showing the copied prompt"
                wrapRaster={wrap}
                frameLabel="Next: Add to my plan, tapped, with the prompt it copies."
              />
            </Section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
