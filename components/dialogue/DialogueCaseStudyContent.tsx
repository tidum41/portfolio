"use client";

import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import HearthsideViewport from "@/components/dialogue/HearthsideViewport";
import { ScrollReveal } from "@/components/ScrollReveal";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import BeforeChatFigure from "@/components/dialogue/product/hearthside/BeforeChatFigure";
import ClipsFigure from "@/components/dialogue/product/hearthside/ClipsFigure";
import ComparisonRowsFigure from "@/components/dialogue/product/hearthside/ComparisonRowsFigure";
import CountsOpenFigure from "@/components/dialogue/product/hearthside/CountsOpenFigure";
import HeroLayeredFigure from "@/components/dialogue/product/hearthside/HeroLayeredFigure";
import LevelsToggleFigure from "@/components/dialogue/product/hearthside/LevelsToggleFigure";
import ScopePairFigure from "@/components/dialogue/product/hearthside/ScopePairFigure";
import ThinPlanFigure from "@/components/dialogue/product/hearthside/ThinPlanFigure";
import { DIALOGUE_TITLE } from "@/lib/caseStudies/dialogue";
import "@/components/dialogue/product/dialogue-product.css";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

export type RasterAnnotator = (assetId: string, children: React.ReactNode) => React.ReactNode;

/** Short TOC labels (Rachel Chen style); the headings carry the full claims. */
export const DIALOGUE_TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "study-wide", label: "Study-wide chat" },
  { id: "counts", label: "Counts" },
  { id: "comparison", label: "Comparison" },
  { id: "levels", label: "Levels of detail" },
  { id: "clips", label: "Clips" },
  { id: "thin-data", label: "Thin data" },
  { id: "takeaway", label: "Takeaway" },
];

function Section({
  id,
  marginTop,
  children,
}: {
  id: string;
  marginTop: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: 96, marginTop }}>
      <ScrollReveal>{children}</ScrollReveal>
    </section>
  );
}

function ClaimH2({ children }: { children: React.ReactNode }) {
  return <h2 className="cs-claim-h2">{children}</h2>;
}

function StatusLine({ children }: { children: React.ReactNode }) {
  return <p className="cs-status-line">{children}</p>;
}

function ProductFigure({
  caption,
  name,
  title,
  innerWidth = 448,
  phoneCap = 520,
  children,
}: {
  caption: string;
  name: string;
  title: string;
  innerWidth?: number;
  phoneCap?: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame label={caption} tone="system">
        <HearthsideViewport name={name} title={title} innerWidth={innerWidth} phoneCap={phoneCap}>
          {children}
        </HearthsideViewport>
      </DialogueRachelFrame>
    </figure>
  );
}

/** A figure whose content is native column width (no scaled chat panel). */
function NativeFigure({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame label={caption} tone="system">
        <div className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}>
          {children}
        </div>
      </DialogueRachelFrame>
    </figure>
  );
}

export function DialogueCaseStudyContent({
  backHref = "/",
}: {
  annotateRaster?: RasterAnnotator;
  backHref?: string;
}) {
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
            subtitle="Product designer (contract), Dec 2025 to Mar 2026"
            metadata={[]}
          >
            <p className="cs-hero-body">
              Dialogue runs AI-moderated interviews and turns them into a study site with a chat.
              I redesigned how that chat answers, so a team can see who said something and how
              many people said it. Part of it shipped, and the rest is shown as concept.
            </p>
            <p className="cs-hero-meta-line">
              Dialogue&rsquo;s customers include Google, Meta, TikTok, Afterpay, Nextdoor and
              Wayfair.
            </p>
            <div style={{ marginTop: 28 }}>
              <DialogueRachelFrame label="Figure: the study chat answer with its count and the quote behind it">
                <HearthsideViewport
                  name="dialogue-hero"
                  title="The study chat answer with its count bar, Mei's quote card and its clip thumbnail"
                  phoneCap={560}
                >
                  <HeroLayeredFigure />
                </HearthsideViewport>
              </DialogueRachelFrame>
            </div>
            <p className="dialogue-caption">
              <span className="dialogue-caption__sentence">
                One answer, traced to the person who said it.
              </span>
            </p>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem" marginTop={64}>
              <ClaimH2>Teams needed to check an answer before sharing it</ClaimH2>
              <CaseStudyBody>
                I did a desk research deep dive on how UX research teams work, using NN/g, Maze,
                User Interviews and IBM Carbon, with no interviews. Dialogue&rsquo;s published
                case studies show teams comparing segments and funnel stages, and sharing
                findings with non-researchers within hours. The chat answered with a theme list,
                lost the subject on a follow-up, and summed up with a table of names.
              </CaseStudyBody>
              <ProductFigure
                caption="Recreated with invented data"
                name="dialogue-before-chat"
                title="The chat as it was: an emoji theme list, a follow-up it could not answer, and a raw-text table of names"
              >
                <BeforeChatFigure />
              </ProductFigure>
            </Section>

            <Section id="study-wide" marginTop={64}>
              <ClaimH2>I moved the chat from one interview to the whole study</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                The chat first answered about a single interview. Teams act on patterns across a
                study, so I moved it up to all 24 interviews. Every answer then had to say how
                much of the study it covered.
              </CaseStudyBody>
              <NativeFigure caption="The chat moved from one interview to the whole study.">
                <ScopePairFigure />
              </NativeFigure>
            </Section>

            <Section id="counts" marginTop={64}>
              <ClaimH2>Counts read as 18 of 24, and both sides open</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                With 24 interviews a percent hides how few people sit behind a claim. The bar
                reads 18 of 24, and tapping either side opens the quotes behind it.
              </CaseStudyBody>
              <ProductFigure
                caption="Tapping 18 or 6 opens the people behind the count."
                name="dialogue-counts-open"
                title="The count bar with the 6 of 24 segment outlined and both segments' evidence open beneath"
              >
                <CountsOpenFigure />
              </ProductFigure>
            </Section>

            <Section id="comparison" marginTop={64}>
              <ClaimH2>Comparisons answer with one row per segment</ClaimH2>
              <CaseStudyBody>
                Teams asked how first-time buyers differ from repeat buyers, so comparisons get
                one row per segment, each with its count and a clip. The rows measure different
                claims, free returns for first-time buyers and the Friday promise for repeat
                buyers, and both rest on the screener&rsquo;s segment tags being right.
              </CaseStudyBody>
              <NativeFigure caption="Each segment keeps its own count and its own evidence.">
                <ComparisonRowsFigure />
              </NativeFigure>
            </Section>

            <Section id="levels" marginTop={64}>
              <ClaimH2>Each answer lets a team stop at the depth it needs</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A stakeholder needs the sentence and a researcher needs the evidence. The answer
                leads with a sentence and its count, and quotes sit one tap below.
              </CaseStudyBody>
              <ProductFigure
                caption="One answer at three depths; the deepest keeps the count, the quote and the clip."
                name="dialogue-levels-toggle"
                title="One answer panel with a three-step depth toggle, shown at the deepest step"
              >
                <LevelsToggleFigure />
              </ProductFigure>
            </Section>

            <Section id="clips" marginTop={64}>
              <ClaimH2>Playing the clip in place kept the answer in view</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Linking a quote to its session page pulls you away from the answer you were
                checking, and the check usually stopped there. Mei was one of the six who asked
                which Friday, so her quote opens the clip in place from the moment she says it,
                with the transcript following. Video is heavy in a chat panel, so it loads only
                on tap.
              </CaseStudyBody>
              <ProductFigure
                caption="A quote opens its clip right where the answer is."
                phoneCap={470}
                name="dialogue-clips-in-chat"
                title="Mei's quote card open into the clip playing in the chat, with her transcript line highlighted"
              >
                <ClipsFigure />
              </ProductFigure>
            </Section>

            <Section id="thin-data" marginTop={64}>
              <ClaimH2>Thin findings say so and stay easy to check</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                2 of 5 lapsed buyers mentioned a damaged first order. Shown like 18 of 24 it
                would read as a pattern, so the answer carries a grey line, &lsquo;Early signal,
                2 people&rsquo;. &lsquo;Add to my plan&rsquo; copies the answer and its count
                into a prompt for the team&rsquo;s own tools. I have no outcome numbers, so next
                I&rsquo;d test whether flagged findings change what teams plan.
              </CaseStudyBody>
              <ProductFigure
                caption="A thin finding gets flagged, then becomes a prompt for the next study."
                name="dialogue-thin-plan"
                title="The thin-data answer with its Early signal flag and the Add to my plan prompt it copies"
              >
                <ThinPlanFigure />
              </ProductFigure>
            </Section>

            <section id="takeaway" className="cs-takeaway" style={{ scrollMarginTop: 96 }}>
              <ScrollReveal>
                <p className="cs-takeaway__text">
                  I study how UX research teams work, design inside Dialogue&rsquo;s own system,
                  and sweat the small decisions that shape a team&rsquo;s workflow.
                </p>
              </ScrollReveal>
            </section>
          </article>
          <CaseStudyPager href="/dialogue" />
        </div>
      </div>
    </div>
  );
}
