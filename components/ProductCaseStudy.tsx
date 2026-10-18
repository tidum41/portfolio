import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import MuxMediaSlot from "@/components/MuxMediaSlot";
import type { CaseStudyBlock, ProductCaseStudyContent } from "@/lib/caseStudies/joola";

const CaseStudyTOC = dynamic(() => import("@/components/CaseStudyTOC"));

/**
 * Essay case study: hero image, one-sentence summary, stacked meta,
 * then problem / process / solution / outcome / next.
 * Body measure is 680px; media uses the 720px column.
 */
export default function ProductCaseStudy({
  content,
}: {
  content: ProductCaseStudyContent;
}) {
  const toc = content.sections.map((section) => ({
    id: section.id,
    label: section.label,
  }));

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="cs-layout cs-layout--essay">
        <aside className="cs-aside">
          <CaseStudyTOC items={toc} backHref="/" />
        </aside>

        <div className="cs-content cs-essay">
          <div className="cs-mobile-back">
            <CaseStudyTOC items={[]} backHref="/" mobileBackOnly />
          </div>

          <header className="cs-hero-header">
            <div
              className="cs-hero-media-wrap"
              style={{
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                background: "var(--color-placeholder)",
                marginBottom: "var(--space-4)",
              }}
            >
              <Image
                src={content.hero.src}
                alt={content.hero.alt}
                width={content.hero.width}
                height={content.hero.height}
                priority
                sizes="(max-width: 767px) calc(100vw - 48px), 720px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div className="cs-essay-prose">
              <h1
                className="cs-open-type"
                data-case-summary
                style={{
                  fontFamily: "var(--font-sans-medium)",
                  fontSize: "var(--fs-h2)",
                  fontWeight: "var(--fw-h2)" as CSSProperties["fontWeight"],
                  lineHeight: 1.25,
                  letterSpacing: "var(--ls-h2)",
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-4)",
                  textWrap: "balance",
                }}
              >
                {content.summary}
              </h1>
            </div>

            <dl
              className="cs-meta-grid cs-open-type cs-open-type-meta"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${content.meta.length}, minmax(0, 1fr))`,
                margin: 0,
              }}
            >
              {content.meta.map((item) => (
                <div key={item.label} style={{ padding: "0 20px 0 0", minWidth: 0 }}>
                  <dt
                    style={{
                      fontFamily: "var(--font-sans-medium)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text-tertiary)",
                      margin: "0 0 8px",
                    }}
                  >
                    {item.label}
                  </dt>
                  <dd
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "var(--color-text-primary)",
                      margin: 0,
                      lineHeight: 1.45,
                      letterSpacing: "-0.1px",
                    }}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          <article style={{ minWidth: 0 }}>
            {content.sections.map((section, index) => (
              <Section key={section.id} id={section.id} noReveal={index === 0}>
                <SectionLabel>{section.label}</SectionLabel>
                <H2>{section.heading}</H2>
                <div className="cs-essay-prose">
                  {section.paragraphs.map((paragraph) => (
                    <Body key={paragraph}>{paragraph}</Body>
                  ))}
                  {section.decisions && section.decisions.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 28, margin: "8px 0 16px" }}>
                      {section.decisions.map((decision) => (
                        <div key={decision.title}>
                          <h3
                            style={{
                              fontFamily: "var(--font-sans-medium)",
                              fontSize: 18,
                              fontWeight: 500,
                              color: "var(--color-text-primary)",
                              margin: "0 0 8px",
                              lineHeight: 1.35,
                              letterSpacing: "-0.2px",
                            }}
                          >
                            {decision.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "var(--fs-body)",
                              lineHeight: "var(--lh-body)",
                              color: "var(--color-text-secondary)",
                              margin: 0,
                            }}
                          >
                            {decision.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {section.film && <CaseFilm film={section.film} />}
              </Section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

function CaseFilm({ film }: { film: NonNullable<CaseStudyBlock["film"]> }) {
  // Same URL MuxMediaSlot uses. Built here because that helper is client-only.
  const poster = `https://image.mux.com/${film.playbackId}/thumbnail.webp?time=0&width=1280`;
  return (
    <figure style={{ margin: "28px 0 0" }} data-case-film={film.playbackId}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          background: "var(--color-placeholder)",
        }}
      >
        {/* Same stack as a homepage Mux card: still underneath, silent player on top. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          aria-hidden
          width={1280}
          height={960}
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
        <MuxMediaSlot
          playbackId={film.playbackId}
          fill
          thumbnailTime={0}
          className="mux-media-slot--silent"
        />
      </div>
      <figcaption
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          textAlign: "center",
          margin: "8px 0 0",
        }}
      >
        {film.caption}
      </figcaption>
    </figure>
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
        fontSize: "var(--fs-h3)",
        fontWeight: 500,
        lineHeight: 1.35,
        letterSpacing: "-0.2px",
        color: "var(--color-text-primary)",
        margin: "0 0 16px",
        maxWidth: 680,
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
