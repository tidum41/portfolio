"use client";

import type { CSSProperties, ReactNode } from "react";
import MuxHero from "@/components/MuxHero";

type Meta = { _key?: string; label: string; values: string[] };

/**
 * Case-study above-the-fold: media is instant (autoplay). Type is visible
 * by default; CSS animates a fade-up (CASE_STUDY_ENTRANCE_DEFAULTS) so a
 * skipped tween cannot leave the title gone.
 */
export default function CaseStudyOpen({
  tagline,
  title,
  metadata,
  muxPlaybackId,
  heroBg,
  children,
}: {
  tagline: string;
  title: string;
  metadata: Meta[];
  muxPlaybackId?: string;
  heroBg?: string;
  children?: ReactNode;
}) {
  return (
    <header className="cs-hero-header">
      <div className="cs-hero-tagline-wrap cs-open-type">
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
      </div>
      <div className="cs-hero-title-wrap cs-open-type">
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
      </div>
      <div className="cs-hero-media-wrap">
        {muxPlaybackId ? (
          <div style={{ background: heroBg, borderRadius: "var(--radius-card)", overflow: "hidden" }}>
            <MuxHero playbackId={muxPlaybackId} />
          </div>
        ) : (
          children
        )}
      </div>
      {metadata.length > 0 && (
        <div
          className="cs-meta-grid cs-open-type cs-open-type-meta"
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
      )}
    </header>
  );
}
