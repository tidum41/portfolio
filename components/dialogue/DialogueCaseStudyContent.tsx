"use client";

import dynamic from "next/dynamic";
import CaseStudyBody from "@/components/CaseStudyBody";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import CaseStudyPager from "@/components/CaseStudyPager";
import DialogueRachelFrame, {
  DialogueCaption,
} from "@/components/dialogue/DialogueRachelFrame";
import HearthsideViewport from "@/components/dialogue/HearthsideViewport";
import { ScrollReveal } from "@/components/ScrollReveal";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import BeforeChatFigure from "@/components/dialogue/product/hearthside/BeforeChatFigure";
import ClipsFigure from "@/components/dialogue/product/hearthside/ClipsFigure";
import ComparisonRowsFigure from "@/components/dialogue/product/hearthside/ComparisonRowsFigure";
import CountsOpenFigure from "@/components/dialogue/product/hearthside/CountsOpenFigure";
import HeroLayeredFigure from "@/components/dialogue/product/hearthside/HeroLayeredFigure";
import LevelsFigure from "@/components/dialogue/product/hearthside/LevelsFigure";
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

const NEEDS = [
  "Comparisons",
  "Segments and funnel stage",
  "Non-researcher stakeholders",
  "Share-outs in hours",
  "Video evidence",
  "Quality checks",
] as const;

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
            <p className="cs-hero-meta-line">
              Dialogue&rsquo;s customers include Google, Meta, TikTok, Afterpay, Nextdoor and
              Wayfair.
            </p>
            <div className="cs-hero-media-frame dialogue-hero-media">
              <HearthsideViewport
                name="dialogue-hero"
                title="The study chat answer with its count bar and Mei's quote card open into the clip player"
                phoneCap={560}
              >
                <HeroLayeredFigure />
              </HearthsideViewport>
            </div>
            <DialogueCaption
              label="Hero answer"
              sentence="One answer with its count, the quote behind it, and the clip open."
            />
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem" marginTop={64}>
              <ClaimH2>The chat provided interactive insights, at a surface level</ClaimH2>
              <CaseStudyBody>
                Dialogue provides AI-moderated interviews for UX teams. The interactive chat is
                helpful, but didn&rsquo;t allow users to go deeper to the source.
              </CaseStudyBody>
              <p className="cs-needs-lead">
                Dialogue&rsquo;s case studies with Wayfair, Kalshi, Doctronic and Suno describe
                teams asking for:
              </p>
              <ul className="cs-needs">
                {NEEDS.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <CaseStudyBody>
                The deep dive for this direction was desk research: NN/g, Maze, User Interviews
                and IBM Carbon. I conducted no interviews, so the needs above come from published
                case studies and research, not from talking to Dialogue&rsquo;s users.
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
                The chat first answered questions about a single interview, so anything it said
                rested on one person&rsquo;s answers. I redesigned its scope so a question runs
                across every interview in the study, and the header says which scope is active. A
                wider scope makes a wrong answer easier to spread, which is why the counts in the
                next section had to open.
              </CaseStudyBody>
              <ProductFigure
                caption="The chat's scope, from one interview to all 24."
                name="dialogue-scope-pair"
                title="The per-interview chat header, muted, beside the study-wide header"
                innerWidth={640}
              >
                <ScopePairFigure />
              </ProductFigure>
            </Section>

            <Section id="counts" marginTop={64}>
              <ClaimH2>Answers carry a count that opens on both sides</ClaimH2>
              <StatusLine>Shipped</StatusLine>
              <CaseStudyBody>
                A count without the people behind it asks for trust the answer has not earned.
                Both segments of the bar open into the evidence behind them, including the
                shoppers who did not say it.
              </CaseStudyBody>
              <ProductFigure
                caption="The 18 of 24 bar with both segments open."
                name="dialogue-counts-open"
                title="The count bar with the 6 of 24 segment outlined and both segments' evidence open beneath"
              >
                <CountsOpenFigure />
              </ProductFigure>
            </Section>

            <Section id="comparison" marginTop={64}>
              <ClaimH2>Segments can be compared inside one answer</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                Teams asked for comparisons, so I designed an answer that holds two segments in
                one place, each with its count and a clip. It takes more room than a single
                answer, so it appears when a question names two segments.
              </CaseStudyBody>
              <NativeFigure caption="One row per segment, each with its count and clip.">
                <ComparisonRowsFigure />
              </NativeFigure>
            </Section>

            <Section id="levels" marginTop={64}>
              <ClaimH2>One answer works at three depths</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A summary is enough for a skim, and some readers need the person&rsquo;s own words
                or the moment itself. I kept all three depths in one answer so moving deeper
                never starts the question over.
              </CaseStudyBody>
              <NativeFigure caption="The same answer at three depths.">
                <LevelsFigure />
              </NativeFigure>
            </Section>

            <Section id="clips" marginTop={64}>
              <ClaimH2>Viewing responses directly within the chat window</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A quote can be trimmed until it agrees with anyone. Playing the clip inside the
                chat keeps the moment intact, with the transcript line lit as it plays, so the
                reader hears the hesitation the text leaves out.
              </CaseStudyBody>
              <ProductFigure
                caption="The clip plays inside the answer, its transcript line lit."
                phoneCap={470}
                name="dialogue-clips-in-chat"
                title="Aisha's quote card open into the clip playing in the chat, with her transcript line highlighted"
              >
                <ClipsFigure />
              </ProductFigure>
            </Section>

            <Section id="thin-data" marginTop={64}>
              <ClaimH2>Adding signals for unclear data and results</ClaimH2>
              <StatusLine>Concept</StatusLine>
              <CaseStudyBody>
                A finding from two people should travel as a lead, not as a result. The flag sits
                in the answer where the claim is made, and Add to my plan copies it into a
                follow-up prompt with its count attached. I would test next whether teams act on
                a flagged finding or quietly drop it.
              </CaseStudyBody>
              <ProductFigure
                caption="A thin finding flagged in the answer, then copied into the next study's prompt."
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
