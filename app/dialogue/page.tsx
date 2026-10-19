import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import dynamic from "next/dynamic";
import { preload } from "react-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import {
  DIALOGUE_DRAFT,
  DIALOGUE_HERO_SRC,
  DIALOGUE_IMAGES,
  DIALOGUE_TITLE,
} from "@/lib/caseStudies/dialogue";
import { CASE_STUDY_LCP } from "@/lib/caseStudyNav";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

const description =
  "Dialogue case study on visualizing qualitative interview data so UX researchers can trust study chat answers down to the second.";

export const metadata: Metadata = {
  title: "Dialogue",
  description,
  alternates: { canonical: `${SITE_URL}/dialogue` },
  robots: DIALOGUE_DRAFT ? { index: false, follow: false } : undefined,
  openGraph: {
    title: `${DIALOGUE_TITLE} — mudit mahajan`,
    description,
    url: `${SITE_URL}/dialogue`,
  },
};

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

const TOC_ITEMS = [
  { id: "problem", label: "Problem" },
  { id: "why-it-matters", label: "Why it matters" },
  { id: "one-structure", label: "One structure" },
  { id: "fitted-charts", label: "Fitted charts" },
  { id: "proof", label: "Proof" },
  { id: "clips", label: "Clips" },
  { id: "placement", label: "Placement" },
  { id: "full-answer", label: "Full answer" },
  { id: "outcome", label: "Outcome" },
  { id: "reflection", label: "Reflection" },
];

const CAPTION: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.72,
  color: "var(--color-text-muted)",
  margin: "8px 0 0",
  textAlign: "left",
};

const ANATOMY_PARTS = [
  { n: 1, label: "Sources" },
  { n: 2, label: "Summary" },
  { n: 3, label: "Query chart" },
  { n: 4, label: "Timestamped clips" },
  { n: 5, label: "Follow-ups" },
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

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        letterSpacing: "0.1px",
        color: "var(--color-text-secondary)",
        margin: "0 0 16px",
      }}
    >
      {children}
    </p>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dialogue-placeholder"
      style={{
        margin: "0",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px dashed var(--color-text-muted)",
        background: "var(--color-accent-subtle)",
        fontSize: 14,
        lineHeight: 1.55,
        color: "var(--color-text-secondary)",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans-medium)",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          margin: "0 0 8px",
        }}
      >
        To fill
      </p>
      {children}
    </div>
  );
}

function FrameImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 767px) calc(50vw - 30px), 375px",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px var(--color-border-subtle)",
        background: "var(--color-bg-secondary)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        style={{ objectFit: "contain", objectPosition: "center" }}
      />
    </div>
  );
}

function FrameColumn({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
      {children}
      <p style={CAPTION}>{caption}</p>
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

function SingleFrame({
  src,
  alt,
  caption,
  width = "100%",
}: {
  src: string;
  alt: string;
  caption: string;
  width?: string;
}) {
  return (
    <figure style={{ margin: "24px auto 0", width, maxWidth: "100%" }}>
      <FrameImage src={src} alt={alt} sizes="(max-width: 767px) calc(100vw - 48px), 750px" />
      <figcaption style={CAPTION}>{caption}</figcaption>
    </figure>
  );
}

export default function DialogueCaseStudyPage() {
  const lcp = CASE_STUDY_LCP["/dialogue"];
  if (lcp) preload(lcp, { as: "image" });

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC items={TOC_ITEMS} backHref="/" />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          <CaseStudyOpen
            title={DIALOGUE_TITLE}
            metaColumns={2}
            metadata={[
              { _key: "role", label: "Role", values: ["Product Designer (contract)"] },
              { _key: "timeline", label: "Timeline", values: ["Dec 2025 to March 2026"] },
              {
                _key: "tools",
                label: "Tools",
                values: ["Cursor", "Paper", "Figma", "Granola"],
              },
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
            ]}
          >
            <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}>
              <Image
                src={DIALOGUE_HERO_SRC}
                alt="Structured study chat answer with a summary line and checkout funnel chart showing a 38 percent drop at shipping address."
                width={1500}
                height={1088}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) calc(100vw - 48px), 750px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="context" noReveal>
              <H2>AI-moderated interviews for UX teams</H2>
              <Body>
                Dialogue runs AI-moderated interviews for enterprise UX teams and startups, and
                its study chat answered in paragraphs.
              </Body>
            </Section>

            <Section id="problem">
              <H2>Answers came back as walls of text</H2>
              <Body>
                Teams could not see which interview said what, so a long answer felt like a guess.
              </Body>
              <PairRow>
                <FrameColumn caption="Before: three paragraphs, no sources">
                  <FrameImage
                    src={DIALOGUE_IMAGES.problemBefore}
                    alt="Study chat answer as three dense paragraphs with no linked sources."
                  />
                </FrameColumn>
                <FrameColumn caption="After: one claim, one chart, linked moments">
                  <FrameImage
                    src={DIALOGUE_IMAGES.problemAfter}
                    alt="Study chat answer with a summary line, funnel chart, and linked interview moments."
                  />
                </FrameColumn>
              </PairRow>
            </Section>

            <Section id="why-it-matters">
              <H2>Researchers only repeat a finding they can point to</H2>
              <Body>
                I heard the same trust gap in conversations with Benjamin and Justin, Dialogue&apos;s
                product team, and students in interview sessions (not Dialogue research customers).
              </Body>
              <Placeholder>
                One concrete thing Benjamin, Justin, the product team, or a student said about study
                chat or trusting an answer.
              </Placeholder>
            </Section>

            <Section id="one-structure">
              <H2>Every answer gets one fixed structure</H2>
              <Body>Only the chart changes. Sources, summary, chart, clips, and follow-ups stay in order.</Body>
              <figure style={{ margin: "24px auto 0", width: "80%", maxWidth: "100%" }}>
                <FrameImage
                  src={DIALOGUE_IMAGES.anatomy}
                  alt="Study chat answer card with numbered callouts for sources through follow-ups."
                  sizes="(max-width: 767px) calc(100vw - 48px), 600px"
                />
                <div
                  className="dialogue-anatomy-captions"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: "8px 12px",
                    marginTop: 12,
                  }}
                >
                  {ANATOMY_PARTS.map(({ n, label }) => (
                    <p key={n} style={{ ...CAPTION, margin: 0 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-sans-medium)",
                          fontWeight: 500,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {n}
                      </span>
                      {" "}
                      {label}
                    </p>
                  ))}
                </div>
              </figure>
            </Section>

            <Section id="fitted-charts">
              <H2>The chart fits the question</H2>
              <Body>
                I grouped real chat questions by type and gave each a chart shape that fits the
                question.
              </Body>
              <SingleFrame
                src={DIALOGUE_IMAGES.answerShapes}
                alt="Four study chat questions each shown with a different chart and clip layout."
                caption="Four question types, four chart shapes"
              />
            </Section>

            <Section id="proof">
              <H2>A number with no proof</H2>
              <Body>Selecting a bar filters the clips to the moments behind it.</Body>
              <PairRow>
                <FrameColumn caption="Problem: chart bar with no linked clips">
                  <Placeholder>
                    Export a crop of the selected bar before the clips block appears (matching the
                    solution frame).
                  </Placeholder>
                </FrameColumn>
                <FrameColumn caption="Solution: selecting a bar filters the clips to that step">
                  <FrameImage
                    src={DIALOGUE_IMAGES.proofSolution}
                    alt="Selected checkout step with a clips list tied to that bar."
                  />
                </FrameColumn>
              </PairRow>
            </Section>

            <Section id="clips">
              <H2>A quote with no context</H2>
              <Body>The clip opens at the exact second with the transcript in sync.</Body>
              <PairRow>
                <FrameColumn caption="Problem: quote without the moment behind it">
                  <Placeholder>
                    Export a crop of the quote or transcript before the player opens at the timestamp
                    (matching the solution frame).
                  </Placeholder>
                </FrameColumn>
                <FrameColumn caption="Solution: the clip opens at 01:38 with the speaker row highlighted">
                  <FrameImage
                    src={DIALOGUE_IMAGES.clipsSolution}
                    alt="Interview player at 01:38 with Marcus W. highlighted in the synced transcript."
                  />
                </FrameColumn>
              </PairRow>
            </Section>

            <Section id="placement">
              <H2>Explored a docked sidebar, kept the floating bubble</H2>
              <Body>
                I compared a persistent sidebar with the pop-up chat pattern Dialogue already used on
                study pages.
              </Body>
              <Placeholder>
                The real reason the bubble beat the sidebar for researchers on study pages.
              </Placeholder>
              <PairRow>
                <FrameColumn caption="Explored: docked sidebar">
                  <FrameImage
                    src={DIALOGUE_IMAGES.dockedSidebar}
                    alt="Study page with a docked research assistant sidebar on the right."
                  />
                </FrameColumn>
                <FrameColumn caption="Kept: floating bubble">
                  <FrameImage
                    src={DIALOGUE_IMAGES.floatingBubble}
                    alt="Study page with the research assistant as a floating pop-up chat."
                  />
                </FrameColumn>
              </PairRow>
            </Section>

            <Section id="full-answer">
              <H2>The full answer</H2>
              <Body>Question, chart, and every supporting clip in one drawer.</Body>
              <SingleFrame
                src={DIALOGUE_IMAGES.fullAnswer}
                alt="Structured answer card beside a drawer listing every clip behind the answer."
                caption="The full answer, with every supporting clip in one drawer"
              />
            </Section>

            <Section id="outcome">
              <H2>Presented to the founders, guided what shipped</H2>
              <Body>
                I walked Benjamin and Justin through this exploration. It did not ship as designed,
                but it shaped the study chat that did.
              </Body>
              <Placeholder>
                Which parts of this exploration influenced what shipped (structure, clips, charts,
                follow-ups, or something else)?
              </Placeholder>
            </Section>

            <Section id="reflection">
              <H2>Reflection</H2>
              <Placeholder>
                Two or three lessons from this project, each a one-line claim plus one sentence.
              </Placeholder>
            </Section>
          </article>
        </div>
      </div>
    </div>
  );
}
