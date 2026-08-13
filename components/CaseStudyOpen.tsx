"use client";

import type { CSSProperties, ReactNode } from "react";
import { EntranceStagger, EntranceItem } from "@/components/ScrollReveal";
import { CASE_STUDY_ENTRANCE_DEFAULTS } from "@/lib/motion";

type Meta = { _key?: string; label: string; values: string[] };

/**
 * Case-study above-the-fold open: type fades in (short XMB settle), media
 * does not. Animating the hero video hides it from autoplay and reads as a
 * loading skeleton — the opposite of a fast, readable open.
 */
export default function CaseStudyOpen({
  tagline,
  title,
  metadata,
  media,
}: {
  tagline: string;
  title: string;
  metadata: Meta[];
  media: ReactNode;
}) {
  return (
    <header className="cs-hero-header">
      <EntranceStagger
        active
        dialKitName="Case Study Entrance"
        defaults={CASE_STUDY_ENTRANCE_DEFAULTS}
      >
        <EntranceItem className="cs-hero-tagline-wrap">
          <p
            className="cs-hero-tagline"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-2)",
            }}
          >
            {tagline}
          </p>
        </EntranceItem>
        <EntranceItem className="cs-hero-title-wrap">
          <h1
            className="cs-hero-title"
            style={{
              fontFamily: "var(--font-doc-title)",
              fontSize: "var(--fs-hero)",
              fontWeight: "var(--fw-hero)" as CSSProperties["fontWeight"],
              lineHeight: 1.1,
              letterSpacing: "var(--ls-hero)",
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-4)",
            }}
          >
            {title}
          </h1>
        </EntranceItem>
      </EntranceStagger>
      <div className="cs-hero-media-wrap">{media}</div>
      {metadata.length > 0 && (
        <EntranceStagger
          active
          delay={0.08}
          dialKitName="Case Study Entrance"
          defaults={CASE_STUDY_ENTRANCE_DEFAULTS}
        >
          <EntranceItem>
            <div
              className="cs-meta-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${metadata.length}, 1fr)`,
                marginTop: "var(--space-4)",
              }}
            >
              {metadata.map(({ _key, label, values }) => (
                <div key={_key ?? label} style={{ padding: "0 24px 0 0" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans-medium)",
                      fontSize: 14,
                      fontWeight: 500,
                      letterSpacing: "normal",
                      color: "var(--color-text-tertiary)",
                      margin: "0 0 8px",
                    }}
                  >
                    {label}
                  </p>
                  {values.map((v) => (
                    <p
                      key={v}
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "var(--color-text-primary)",
                        margin: 0,
                        lineHeight: 1.45,
                        letterSpacing: "-0.1px",
                      }}
                    >
                      {v}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </EntranceItem>
        </EntranceStagger>
      )}
    </header>
  );
}
