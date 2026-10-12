"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { SanityProject } from "@/lib/sanity/queries";
import LabMedia from "./LabMedia";
import { EDGE_TILE, FRAMED_INSET, TEXT_FIRST } from "./tokens";

const LINK_STYLE: CSSProperties = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
  cursor: "pointer",
};

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

type LinkHandlers = {
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseMove?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function ProjectLink({
  href,
  children,
  className,
  style,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
} & LinkHandlers) {
  const handlers = { onMouseEnter, onMouseMove, onMouseLeave, onClick };

  if (isExternal(href) || href === "#") {
    return (
      <a
        href={href === "#" ? undefined : href}
        target={href === "#" ? undefined : "_blank"}
        rel={href === "#" ? undefined : "noopener noreferrer"}
        className={className}
        style={{ ...LINK_STYLE, ...style }}
        {...handlers}
        onClick={(e) => {
          if (href === "#") e.preventDefault();
          onClick?.(e);
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch className={className} style={{ ...LINK_STYLE, ...style }} {...handlers}>
      {children}
    </Link>
  );
}

function TitleMeta({
  title,
  meta,
  titleSize,
  metaSize,
  titleWeight = 500,
  titleFont = "var(--font-sans-medium)",
  metaFont = "var(--font-sans)",
  gap = 4,
}: {
  title: string;
  meta?: string;
  titleSize: number;
  metaSize: number;
  titleWeight?: number;
  titleFont?: string;
  metaFont?: string;
  gap?: number;
}) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontFamily: titleFont,
          fontWeight: titleWeight,
          fontSize: titleSize,
          lineHeight: 1.35,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </p>
      {meta && (
        <p
          style={{
            margin: `${gap}px 0 0`,
            fontFamily: metaFont,
            fontWeight: 400,
            fontSize: metaSize,
            lineHeight: 1.4,
            color: "var(--color-text-tertiary)",
          }}
        >
          {meta}
        </p>
      )}
    </div>
  );
}

/* ─── 1. Framed inset ─────────────────────────────────────────────── */

export function FramedInsetGrid({ projects }: { projects: SanityProject[] }) {
  return (
    <div
      className="cl-fi-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "var(--cl-fi-gutter)",
        alignItems: "start",
      }}
    >
      {projects.map((p) => (
        <FramedInsetCard key={p._id} project={p} />
      ))}
      <style>{`
        @media (max-width: 640px) {
          .cl-fi-grid { grid-template-columns: 1fr !important; }
        }
        .cl-fi-card {
          --cl-fi-surface: color-mix(in srgb, var(--color-text-primary) 4%, var(--color-bg));
          --cl-fi-edge: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
          --cl-fi-hover-bg: color-mix(in srgb, var(--color-text-primary) 7%, var(--color-bg));
          background: var(--cl-fi-surface);
          border: 1px solid var(--cl-fi-edge);
          border-radius: var(--cl-fi-outer-r);
          padding: var(--cl-fi-pad);
          padding-bottom: calc(var(--cl-fi-pad) + 2px);
          transition:
            background var(--cl-fi-hover) ease,
            border-color var(--cl-fi-hover) ease;
        }
        html[data-theme="dark"] .cl-fi-card {
          --cl-fi-surface: color-mix(in srgb, var(--color-text-primary) 6%, var(--color-bg));
          --cl-fi-edge: color-mix(in srgb, var(--color-text-primary) 14%, transparent);
          --cl-fi-hover-bg: color-mix(in srgb, var(--color-text-primary) 10%, var(--color-bg));
        }
        @media (hover: hover) and (pointer: fine) {
          .cl-fi-card:hover {
            background: var(--cl-fi-hover-bg);
            border-color: color-mix(in srgb, var(--color-text-primary) 22%, transparent);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-fi-card { transition: none; }
        }
      `}</style>
    </div>
  );
}

function FramedInsetCard({ project }: { project: SanityProject }) {
  return (
    <ProjectLink href={project.href} className="cl-fi-card">
      <LabMedia
        project={project}
        borderRadius="var(--cl-fi-inner-r)"
      />
      <div style={{ padding: `var(--cl-fi-label-gap) 2px 4px` }}>
        <TitleMeta
          title={project.title}
          meta={project.subtitle}
          titleSize={FRAMED_INSET.titleSize}
          metaSize={FRAMED_INSET.metaSize}
          titleWeight={FRAMED_INSET.titleWeight}
        />
      </div>
    </ProjectLink>
  );
}

/* ─── 2. Edge-to-edge tile ────────────────────────────────────────── */

export function EdgeTileGrid({ projects }: { projects: SanityProject[] }) {
  return (
    <div
      className="cl-et-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "var(--cl-et-gutter)",
        alignItems: "start",
      }}
    >
      {projects.map((p) => (
        <EdgeTileCard key={p._id} project={p} />
      ))}
      <style>{`
        @media (max-width: 640px) {
          .cl-et-grid { grid-template-columns: 1fr !important; }
        }
        .cl-et-card {
          display: flex;
          flex-direction: column;
          gap: var(--cl-et-label-gap);
        }
        .cl-et-media {
          background: color-mix(in srgb, var(--color-text-primary) 3%, var(--color-bg));
          transition: opacity var(--cl-et-hover) ease, filter var(--cl-et-hover) ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .cl-et-card:hover .cl-et-media {
            filter: brightness(1.04);
          }
          html[data-theme="dark"] .cl-et-card:hover .cl-et-media {
            filter: brightness(1.08);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-et-media { transition: none; }
        }
      `}</style>
    </div>
  );
}

function EdgeTileCard({ project }: { project: SanityProject }) {
  return (
    <ProjectLink href={project.href} className="cl-et-card">
      <LabMedia
        project={project}
        className="cl-et-media"
        borderRadius="var(--cl-et-r)"
      />
      <TitleMeta
        title={project.title}
        meta={project.subtitle}
        titleSize={EDGE_TILE.titleSize}
        metaSize={EDGE_TILE.metaSize}
        titleWeight={EDGE_TILE.titleWeight}
        titleFont="var(--font-mono)"
        metaFont="var(--font-mono)"
        gap={2}
      />
    </ProjectLink>
  );
}

/* ─── 3. Text-first row ───────────────────────────────────────────── */

export function TextFirstList({ projects }: { projects: SanityProject[] }) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  /** True when the UA claims real hover; used only for the touch expand path. */
  const [touchExpand, setTouchExpand] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setTouchExpand(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = projects.find((p) => p._id === hoverId) ?? null;

  return (
    <div ref={listRef} className="cl-tf-list" style={{ position: "relative", maxWidth: 580 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--cl-tf-row-gap)" }}>
        {projects.map((p) => {
          const open = expandedId === p._id;
          return (
            <div key={p._id} className="cl-tf-row-wrap">
              <ProjectLink
                href={p.href}
                className="cl-tf-row"
                style={{
                  display: "block",
                  padding: "4px 0",
                  transition: `opacity var(--cl-tf-hover) ease, color var(--cl-tf-hover) ease`,
                  opacity: hoverId && hoverId !== p._id ? 0.35 : 1,
                }}
                onMouseEnter={(e) => {
                  // Event-driven: show floating preview whenever a mouse enters,
                  // even if matchMedia lies (common in headless / some hybrid UAs).
                  setHoverId(p._id);
                  setPreviewPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  if (hoverId !== p._id) return;
                  setPreviewPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoverId(null)}
                onClick={(e) => {
                  if (!touchExpand) return;
                  // Touch: first tap reveals inline poster; second follows link
                  if (expandedId !== p._id) {
                    e.preventDefault();
                    setExpandedId(p._id);
                    setHoverId(null);
                  }
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                    fontWeight: TEXT_FIRST.titleWeight,
                    fontSize: "var(--cl-tf-title)",
                    lineHeight: 1.4,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {p.title}
                </p>
                {p.subtitle && (
                  <p
                    style={{
                      margin: `var(--cl-tf-title-desc-gap) 0 0`,
                      fontFamily: "var(--font-sans)",
                      fontWeight: 400,
                      fontSize: "var(--cl-tf-desc)",
                      lineHeight: 1.45,
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {p.subtitle}
                  </p>
                )}
              </ProjectLink>

              {/* Touch / non-hover fallback: inline poster under the row */}
              {touchExpand && open && (
                <div style={{ marginTop: 12, maxWidth: 280 }}>
                  <LabMedia
                    project={p}
                    play={false}
                    borderRadius="var(--cl-tf-preview-r)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover preview — opacity only, never scale the media ancestor */}
      {active && (
        <div
          aria-hidden
          className="cl-tf-preview"
          style={{
            position: "fixed",
            left: Math.min(previewPos.x + 28, (typeof window !== "undefined" ? window.innerWidth : 1440) - TEXT_FIRST.previewWidth - 24),
            top: Math.min(Math.max(88, previewPos.y - 80), (typeof window !== "undefined" ? window.innerHeight : 900) - 240),
            width: "var(--cl-tf-preview-w)",
            pointerEvents: "none",
            zIndex: 60,
            opacity: 1,
            transition: `opacity var(--cl-tf-hover) ease`,
          }}
        >
          <LabMedia
            project={active}
            play
            borderRadius="var(--cl-tf-preview-r)"
            style={{
              boxShadow: "0 12px 40px color-mix(in srgb, #000 22%, transparent)",
            }}
          />
        </div>
      )}

      <style>{`
        .cl-tf-row:hover p:first-child {
          color: var(--color-text-secondary);
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-tf-row, .cl-tf-preview { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
