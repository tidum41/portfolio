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
  "Dialogue case study — visualizing qualitative interview data so UX researchers can trust study chat answers down to the second.";

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
  { id: "research", label: "Research" },
  { id: "process", label: "Process" },
  { id: "decision-structure", label: "Answer structure" },
  { id: "decision-evidence", label: "Evidence links" },
  { id: "decision-clips", label: "Timestamped clips" },
  { id: "decision-context", label: "In the product" },
  { id: "solution", label: "Solution" },
  { id: "shipped", label: "What shipped" },
  { id: "reflection", label: "Reflection" },
];

const CAPTION: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.72,
  color: "var(--color-text-muted)",
  margin: "8px 0 0",
  textAlign: "center",
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

function SectionLabel({ children, as: Tag = "p" }: { children: React.ReactNode; as?: "p" | "h2" }) {
  return (
    <Tag
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-section-label)",
        fontWeight: 400,
        letterSpacing: "0.02em",
        color: "var(--color-text-tertiary)",
        margin: "0 0 16px",
      }}
    >
      {children}
    </Tag>
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

function Body({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        letterSpacing: "0.1px",
        color: "var(--color-text-secondary)",
        margin: "0 0 16px",
        ...style,
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
        margin: "20px 0",
        padding: "16px 20px",
        borderRadius: 8,
        border: "1px dashed var(--color-text-muted)",
        background: "var(--color-accent-subtle)",
        fontSize: 14,
        lineHeight: 1.55,
        color: "var(--color-text-secondary)",
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

function StudyImage({
  src,
  alt,
  priority = false,
  aspectRatio = "8 / 5",
  sizes = "(max-width: 767px) calc(100vw - 48px), 750px",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  aspectRatio?: string;
  sizes?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        margin: "24px 0 0",
        boxShadow: "inset 0 0 0 1px var(--color-border-subtle)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />
    </div>
  );
}

function Figure({
  src,
  alt,
  caption,
  priority = false,
  wide = false,
}: {
  src: string;
  alt: string;
  caption: string;
  priority?: boolean;
  wide?: boolean;
}) {
  return (
    <figure style={{ margin: "0 0 28px", maxWidth: wide ? "none" : undefined }}>
      <StudyImage src={src} alt={alt} priority={priority} />
      <figcaption style={CAPTION}>{caption}</figcaption>
    </figure>
  );
}

function ProcessList({ items }: { items: string[] }) {
  return (
    <ol
      style={{
        margin: "0 0 16px",
        paddingLeft: 20,
        fontSize: "var(--fs-body)",
        lineHeight: "var(--lh-body)",
        color: "var(--color-text-secondary)",
      }}
    >
      {items.map((item) => (
        <li key={item} style={{ marginBottom: 12, paddingLeft: 4 }}>
          {item}
        </li>
      ))}
    </ol>
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
                alt="Dialogue study page with the research assistant panel open, showing a structured answer to a research question."
                width={1600}
                height={1000}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) calc(100vw - 48px), 750px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            <Section id="problem" noReveal>
              <SectionLabel>The problem</SectionLabel>
              <H2>Answers came back as walls of text</H2>
              <Body>
                Dialogue runs AI-moderated user interviews at scale for enterprise UX teams and
                startups. When a team asked the study chat a question, it got long paragraphs with
                no clear link to the interviews behind them.
              </Body>
              <Body>
                Dialogue&apos;s mission is making research accessible to every team, turning
                conversations into insights in hours, not weeks. That promise breaks down when
                researchers cannot see where an answer came from.
              </Body>
              <Figure
                src={DIALOGUE_IMAGES.problemBeforeAfter}
                alt="Side by side comparison of a dense text-only study chat answer and a structured answer with summary, chart, and clips."
                caption="Before and after, same question"
              />
            </Section>

            <Section id="research">
              <SectionLabel>Research insights</SectionLabel>
              <H2>Research is only useful if people trust it</H2>
              <Body>
                I learned from conversations with the founders, Dialogue&apos;s internal product
                team, and students who took part in interview sessions. These were not sessions
                with Dialogue&apos;s research customers, but they surfaced the same trust problem:
                teams needed evidence, not just a summary.
              </Body>
              <Placeholder>
                What specifically did Benjamin, Justin, or the product team tell you about how
                researchers use study chat today, and what felt broken?
              </Placeholder>
              <Body>
                Dialogue raised a $6M seed round led by Lightspeed to scale AI-moderated research.
                Trust in answers is what lets qualitative work move at that speed.
              </Body>
            </Section>

            <Section id="process">
              <SectionLabel>Process</SectionLabel>
              <H2>From question types to one answer pattern</H2>
              <ProcessList
                items={[
                  "Reviewed real questions teams asked the chat and grouped them by type.",
                  "Matched each type to the answer shape that fits it best.",
                  "Defined one structure every answer follows.",
                  "Prototyped in Cursor and Paper, then reviewed the prototypes with the founders.",
                ]}
              />
              <Placeholder>
                Are these four process steps accurate? Should anything be added, reordered, or
                renamed?
              </Placeholder>
              <Figure
                src={DIALOGUE_IMAGES.answerShapes}
                alt="Four study chat questions each paired with a different chart and clip layout."
                caption="Four kinds of questions, four answer shapes"
              />
            </Section>

            <Section id="decision-structure">
              <SectionLabel>Design decision</SectionLabel>
              <H2>One structure for every answer</H2>
              <Body>
                Each answer shows its sources, a summary, a chart built for the question,
                timestamped clips, and follow-ups. The chart changes, but the order never does.
              </Body>
              <figure style={{ margin: "0 0 28px" }}>
                <StudyImage
                  src={DIALOGUE_IMAGES.anatomy}
                  alt="Annotated study chat answer highlighting sources, summary, query chart, clips, and follow-ups."
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
                    <p
                      key={n}
                      style={{
                        ...CAPTION,
                        textAlign: "left",
                        margin: 0,
                      }}
                    >
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
                <figcaption style={{ ...CAPTION, marginTop: 12 }}>
                  Sources, summary, query chart, timestamped clips, follow-ups
                </figcaption>
              </figure>
            </Section>

            <Section id="decision-evidence">
              <SectionLabel>Design decision</SectionLabel>
              <H2>Every number links to its evidence</H2>
              <Body>
                Selecting a bar or data point filters the clips to the moments behind it, so a
                chart never floats on its own.
              </Body>
              <Figure
                src={DIALOGUE_IMAGES.chartToClips}
                alt="Bar chart selection filtering the timestamped clip list below."
                caption="From a data point to the clips behind it"
              />
            </Section>

            <Section id="decision-clips">
              <SectionLabel>Design decision</SectionLabel>
              <H2>Clips open at the exact second</H2>
              <Body>
                Each clip opens the recording at its timestamp. The transcript scrolls with the
                video, and the speaker&apos;s row stays highlighted so the quote shows up in
                context.
              </Body>
              <Figure
                src={DIALOGUE_IMAGES.clipPlayer}
                alt="Interview recording with synced transcript and highlighted speaker row."
                caption="Recording, synced transcript, highlighted speaker"
              />
            </Section>

            <Section id="decision-context">
              <SectionLabel>Design decision</SectionLabel>
              <H2>Same chat, same place</H2>
              <Body>
                The research assistant stays on the study page, in Dialogue&apos;s visual style.
                Only the answer changed.
              </Body>
              <Figure
                src={DIALOGUE_IMAGES.inProduct}
                alt="Full study page with the research assistant docked on the right."
                caption="The research assistant on a study page"
              />
            </Section>

            <Section id="solution">
              <SectionLabel>Solution</SectionLabel>
              <H2>Easy to trust and easy to use</H2>
              <Body>
                Same place, same five parts every time, and one click from a claim to the moment
                that proves it. That is what visualizing qualitative data for UX researchers
                looked like in this exploration.
              </Body>
              <Figure
                src={DIALOGUE_IMAGES.fullAnswer}
                alt="Full structured answer with a drawer listing every supporting clip."
                caption="A full answer with every clip in one drawer"
                wide
              />
            </Section>

            <Section id="shipped">
              <SectionLabel>Proposed vs. shipped</SectionLabel>
              <H2>What made it into the product</H2>
              <Body>
                I presented this exploration to the founders. It did not ship as designed, but it
                guided the study chat that did.
              </Body>
              <Placeholder>
                Which parts of this exploration influenced what shipped (answer structure, clips,
                charts, follow-ups, or something else)?
              </Placeholder>
              <Placeholder>
                Is there a cut exploration or alternate direction worth showing here, and why was
                it dropped?
              </Placeholder>
              <Placeholder>
                Any outcome, impact metric, or quote from the founders or team on how this work
                helped?
              </Placeholder>
            </Section>

            <Section id="reflection">
              <SectionLabel as="h2">Reflection</SectionLabel>
              <Placeholder>
                What are three short lessons from this project (for example: designing for trust in
                AI answers, one structure across chart types, or designing from secondhand customer
                insight)?
              </Placeholder>
            </Section>
          </article>
        </div>
      </div>
    </div>
  );
}
