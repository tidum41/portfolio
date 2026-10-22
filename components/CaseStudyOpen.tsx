"use client";

import type { CSSProperties, ReactNode } from "react";
import MuxHero from "@/components/MuxHero";

type Meta = {
  _key?: string;
  label: string;
  values: ReactNode[];
  /** Span the full meta row on small screens (long collaborator lists). */
  wide?: boolean;
};

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
  posterWidth,
  posterHeight,
  subtitle,
  children,
  annotate = "case-study-hero",
}: {
  tagline?: ReactNode;
  title: string;
  metadata: Meta[];
  muxPlaybackId?: string;
  heroBg?: string;
  posterWidth?: number;
  posterHeight?: number;
  subtitle?: ReactNode;
  children?: ReactNode;
  annotate?: string;
}) {
  return (
    <header className="cs-hero-header">
      {tagline ? (
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
      ) : null}
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
            margin: subtitle ? "0 0 12px" : "0 0 var(--space-4)",
          }}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p
          className="cs-open-type"
          style={{
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            letterSpacing: "0.1px",
            color: "var(--color-text-secondary)",
            margin: "0 0 var(--space-4)",
          }}
        >
          {subtitle}
        </p>
      )}
      <div className="cs-hero-media-wrap">
        {muxPlaybackId ? (
          <div className="cs-hero-media-frame" data-annotate={`${annotate}/media`} style={{ background: heroBg }}>
            <MuxHero
              playbackId={muxPlaybackId}
              posterWidth={posterWidth}
              posterHeight={posterHeight}
            />
          </div>
        ) : (
          children
        )}
      </div>
      {metadata.length > 0 && (
        <div className="cs-meta-grid cs-open-type cs-open-type-meta">
          {metadata.map(({ _key, label, values, wide }) => (
            <div key={_key ?? label} className={wide ? "cs-meta-item cs-meta-wide" : "cs-meta-item"}>
              <p className="cs-meta-label">{label}</p>
              {values.map((v, i) => (
                <p key={i} className="cs-meta-value">
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
