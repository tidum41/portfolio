import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import CaseStudyOpen from "@/components/CaseStudyOpen";
import MuxMediaSlot from "@/components/MuxMediaSlot";
import {
  JOOLA_HERO_SRC,
  JOOLA_META,
  JOOLA_SECTIONS,
  JOOLA_TITLE,
  type CaseStudyBlock,
  type CaseStudyMeta,
} from "@/lib/caseStudies/joola";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

/** A whole field that is only a bracketed gap note. Never render these. */
function isGap(text: string) {
  return /^\s*\[[\s\S]*\]\s*$/.test(text);
}

function visibleLines(lines: string[] | undefined) {
  return (lines ?? []).map((line) => line.trim()).filter((line) => line && !isGap(line));
}

function visibleMeta(meta: CaseStudyMeta[]) {
  return meta
    .map((item) => ({ ...item, values: visibleLines(item.values) }))
    .filter((item) => item.values.length > 0 && !isGap(item.label));
}

function visibleSections(sections: CaseStudyBlock[]) {
  return sections.flatMap((section) => {
    const heading = section.heading && !isGap(section.heading) ? section.heading : undefined;
    const paragraphs = visibleLines(section.paragraphs);
    if (!heading && paragraphs.length === 0 && !section.film) return [];
    return [{ ...section, heading, paragraphs }];
  });
}

/**
 * Same chrome as /ucla-sublease: 750px column, eyebrow, 48px title above
 * the media, meta row, then labeled sections.
 */
export default function ProductCaseStudy() {
  const meta = visibleMeta(JOOLA_META);
  const sections = visibleSections(JOOLA_SECTIONS);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout">
        <aside className="cs-aside">
          <CaseStudyTOC
            items={sections.map((section) => ({ id: section.id, label: section.toc }))}
            backHref="/"
          />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          <CaseStudyOpen
            tagline={<Eyebrow />}
            title={JOOLA_TITLE}
            metadata={meta.map((item, i) => ({ _key: String(i), label: item.label, values: item.values }))}
            metaColumns={4}
          >
            <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden" }}>
              <Image
                src={JOOLA_HERO_SRC}
                alt="Quick order screen from the JOOLA wholesale prototype, with tier pricing, a saved order, Net 30 credit, and an order marked ship date pending."
                width={2400}
                height={1600}
                priority
                fetchPriority="high"
                sizes="(max-width: 767px) calc(100vw - 48px), 750px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </CaseStudyOpen>

          <article style={{ minWidth: 0 }}>
            {sections.map((section, index) => (
              <Section key={section.id} id={section.id} noReveal={index === 0}>
                <SectionLabel>{section.label}</SectionLabel>
                {section.heading && <H2>{section.heading}</H2>}
                {section.paragraphs.map((paragraph) => (
                  <Body key={paragraph}>{paragraph}</Body>
                ))}
                {section.film && <CaseFilm playbackId={section.film.playbackId} />}
              </Section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

function Eyebrow() {
  const parts = ["Product Design", "Case Study", "2026"];
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: 16, rowGap: 4 }}>
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
    </span>
  );
}

function CaseFilm({ playbackId }: { playbackId: string }) {
  return (
    <div data-case-film={playbackId} style={{ margin: "32px 0" }}>
      <MuxMediaSlot
        playbackId={playbackId}
        thumbnailTime={0}
        posterWidth={1280}
        posterHeight={960}
        className="mux-media-slot--contain"
        style={{ background: "#F4F4F4", borderRadius: "var(--radius-card)" }}
      />
    </div>
  );
}

function Section({
  id,
  children,
  noReveal = false,
}: {
  id: string;
  children: ReactNode;
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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
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
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans-medium)",
        fontSize: "var(--fs-h2)",
        fontWeight: "var(--fw-h2)" as CSSProperties["fontWeight"],
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

function Body({ children }: { children: ReactNode }) {
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
