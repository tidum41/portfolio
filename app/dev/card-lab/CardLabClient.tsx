"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { SanityProject } from "@/lib/sanity/queries";
import { EdgeTileGrid, FramedInsetGrid, TextFirstList } from "./cards";
import {
  DIRECTIONS,
  EDGE_TILE,
  FRAMED_INSET,
  TEXT_FIRST,
  tokensToCssVars,
  type DirectionId,
} from "./tokens";

/** Above site chrome; Nav is z-40 outside <main>, so we also hide it via CSS. */
const LAB_Z = 60;

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.classList.add("theme-switching");
  void html.offsetWidth;
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => html.classList.remove("theme-switching"));
  });
  return next;
}

export default function CardLabClient({ projects }: { projects: SanityProject[] }) {
  const [dir, setDir] = useState<DirectionId>("framed-inset");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [compare, setCompare] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTheme(saved === "light" ? "light" : "dark");
  }, []);

  // Mark the document so site Nav/Footer/DialKit can't sit over the lab.
  // Nav is a z-40 sibling of <main>; fixed children inside main cannot
  // paint above it without this (or a portal).
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-card-lab", "1");
    return () => root.removeAttribute("data-card-lab");
  }, []);

  const cycle = useCallback((delta: 1 | -1) => {
    setDir((current) => {
      const i = DIRECTIONS.findIndex((d) => d.id === current);
      const next = DIRECTIONS[(i + delta + DIRECTIONS.length) % DIRECTIONS.length];
      return next.id;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        cycle(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycle(-1);
      } else if (e.key === "1") setDir("framed-inset");
      else if (e.key === "2") setDir("edge-tile");
      else if (e.key === "3") setDir("text-first");
      else if (e.key === "t" || e.key === "T") {
        setTheme(toggleTheme() as "light" | "dark");
      } else if (e.key === "c" || e.key === "C") {
        setCompare((v) => !v);
      } else if (e.key === "?" || e.key === "h" || e.key === "H") {
        setHelpOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle]);

  const meta = DIRECTIONS.find((d) => d.id === dir) ?? DIRECTIONS[0];
  const index = DIRECTIONS.findIndex((d) => d.id === dir);

  return (
    <>
      <style>{`
        .card-lab-root {
          ${tokensToCssVars()}
        }
        /* Site Nav sits outside <main> at z-40 and would paint over the lab. */
        html[data-card-lab="1"] body > header.intro-hide,
        html[data-card-lab="1"] body > footer {
          display: none !important;
        }
        /* Keep DialKit closed/hidden — card-lab is for judging cards, not knobs. */
        html[data-card-lab="1"] .dialkit-panel,
        html[data-card-lab="1"] .dialkit-select-dropdown,
        html[data-card-lab="1"] .dialkit-preset-dropdown,
        html[data-card-lab="1"] .dialkit-shortcuts-dropdown {
          display: none !important;
        }
        .cl-btn {
          appearance: none;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          color: var(--color-text-primary);
          font: inherit;
          font-size: 12px;
          letter-spacing: 0.04em;
          padding: 7px 10px;
          border-radius: 4px;
          cursor: pointer;
          min-height: 36px;
        }
        .cl-btn:hover {
          background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
        }
        .cl-btn[data-active="true"] {
          background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
          border-color: color-mix(in srgb, var(--color-text-primary) 28%, transparent);
        }
        .cl-help-fab {
          appearance: none;
          width: 36px;
          height: 36px;
          border-radius: 4px;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          background: color-mix(in srgb, var(--color-bg) 92%, transparent);
          color: var(--color-text-primary);
          font: inherit;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .cl-help-fab:hover {
          background: color-mix(in srgb, var(--color-text-primary) 6%, var(--color-bg));
        }
        .cl-token-chip {
          font-family: var(--font-mono);
          font-size: 11px;
          line-height: 1.4;
          color: var(--color-text-tertiary);
          padding: 2px 0;
        }
        .cl-section {
          scroll-margin-top: 120px;
        }
        .cl-section + .cl-section {
          margin-top: 72px;
          padding-top: 48px;
          border-top: 1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent);
        }
      `}</style>

      <div
        className="card-lab-root"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: LAB_Z,
          background: "var(--color-bg)",
          color: "var(--color-text-primary)",
          overflow: "auto",
          fontFamily: "var(--font-sans)",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            padding: "14px 20px 12px",
            background: "color-mix(in srgb, var(--color-bg) 94%, transparent)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
          }}
        >
          <div style={{ maxWidth: 1100, marginInline: "auto" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.45,
                marginBottom: 2,
              }}
            >
              Card lab · {compare ? "compare" : `${index + 1} / ${DIRECTIONS.length}`}
            </div>
            <div style={{ fontSize: 15, letterSpacing: "-0.02em" }}>
              {compare ? "All three directions" : meta.label}
            </div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2, maxWidth: 560 }}>
              {compare
                ? "Stacked for side-by-side judgment · same projects · no production chrome"
                : meta.hint}
            </div>

            {/* Controls live under the title — never share the site nav corner */}
            <nav
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 12,
                alignItems: "center",
              }}
              aria-label="Directions"
            >
              {DIRECTIONS.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  className="cl-btn"
                  data-active={!compare && dir === d.id ? "true" : "false"}
                  onClick={() => {
                    setCompare(false);
                    setDir(d.id);
                  }}
                >
                  {i + 1}. {d.short}
                </button>
              ))}
              <button
                type="button"
                className="cl-btn"
                data-active={compare ? "true" : "false"}
                onClick={() => setCompare((v) => !v)}
              >
                Compare
              </button>
              <button
                type="button"
                className="cl-btn"
                onClick={() => setTheme(toggleTheme() as "light" | "dark")}
                aria-label="Toggle light/dark"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                type="button"
                className="cl-btn"
                data-active={helpOpen ? "true" : "false"}
                onClick={() => setHelpOpen((v) => !v)}
                aria-expanded={helpOpen}
                aria-controls="card-lab-help"
              >
                Help
              </button>
            </nav>
          </div>
        </header>

        <main
          style={{
            padding: "32px 24px 80px",
            paddingInline: "var(--page-px, 24px)",
            maxWidth: 1100,
            marginInline: "auto",
          }}
        >
          {projects.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No featured projects returned from Sanity.</p>
          ) : compare ? (
            <>
              <DirectionBlock id="framed-inset" projects={projects} />
              <DirectionBlock id="edge-tile" projects={projects} />
              <DirectionBlock id="text-first" projects={projects} />
            </>
          ) : (
            <DirectionBlock id={dir} projects={projects} showTokens />
          )}
        </main>

        {/* Collapsed by default — only a corner chip until Help / ? / H */}
        <div
          style={{
            position: "fixed",
            left: 16,
            bottom: 16,
            zIndex: 3,
            maxWidth: helpOpen ? 320 : undefined,
          }}
        >
          {helpOpen ? (
            <div
              id="card-lab-help"
              role="region"
              aria-label="Card lab help"
              style={{
                padding: "12px 12px 10px",
                borderRadius: 6,
                background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent)",
                fontSize: 12,
                lineHeight: 1.45,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div style={{ opacity: 0.5, letterSpacing: "0.04em", fontSize: 11 }}>
                  ← → cycle · 1–3 jump · T theme · C compare · H help
                </div>
                <button
                  type="button"
                  className="cl-help-fab"
                  style={{ width: 28, height: 28, fontSize: 14, flexShrink: 0 }}
                  onClick={() => setHelpOpen(false)}
                  aria-label="Close help"
                >
                  ×
                </button>
              </div>
              <p style={{ margin: "0 0 8px", opacity: 0.85 }}>
                Lab-only. Live homepage cards are untouched. Hover never scales — Mux letterboxes
                under transformed ancestors.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
                <Link href="/" style={{ color: "inherit" }}>
                  ← work
                </Link>
                <Link href="/dev/motion-lab" style={{ color: "inherit" }}>
                  motion lab
                </Link>
                <Link href="/dev/ps3-wave-lab" style={{ color: "inherit" }}>
                  wave lab
                </Link>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="cl-help-fab"
              onClick={() => setHelpOpen(true)}
              aria-label="Open help"
              title="Help (H)"
            >
              ?
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function DirectionBlock({
  id,
  projects,
  showTokens = true,
}: {
  id: DirectionId;
  projects: SanityProject[];
  showTokens?: boolean;
}) {
  const meta = DIRECTIONS.find((d) => d.id === id)!;
  return (
    <section id={id} className="cl-section" aria-labelledby={`${id}-heading`}>
      <div style={{ marginBottom: 28 }}>
        <h2
          id={`${id}-heading`}
          style={{
            margin: 0,
            fontFamily: "var(--font-sans-medium)",
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "-0.02em",
          }}
        >
          {meta.label}
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--color-text-tertiary)", maxWidth: 520 }}>
          {meta.hint}
        </p>
        {showTokens && <TokenReadout id={id} />}
      </div>
      {id === "framed-inset" && <FramedInsetGrid projects={projects} />}
      {id === "edge-tile" && <EdgeTileGrid projects={projects} />}
      {id === "text-first" && <TextFirstList projects={projects} />}
    </section>
  );
}

function TokenReadout({ id }: { id: DirectionId }) {
  const lines =
    id === "framed-inset"
      ? [
          `outer ${FRAMED_INSET.outerRadius} · pad ${FRAMED_INSET.pad} · inner ${FRAMED_INSET.innerRadius}`,
          `gutter ${FRAMED_INSET.gutter} · label gap ${FRAMED_INSET.labelGap}`,
          `title ${FRAMED_INSET.titleSize}/${FRAMED_INSET.titleWeight} · meta ${FRAMED_INSET.metaSize} · hover ${FRAMED_INSET.hoverMs}ms`,
        ]
      : id === "edge-tile"
        ? [
            `radius ${EDGE_TILE.radius} · gutter ${EDGE_TILE.gutter} · label gap ${EDGE_TILE.labelGap}`,
            `title ${EDGE_TILE.titleSize}/${EDGE_TILE.titleWeight} mono · meta ${EDGE_TILE.metaSize} · hover ${EDGE_TILE.hoverMs}ms`,
          ]
        : [
            `title/desc ${TEXT_FIRST.titleSize} · row gap ${TEXT_FIRST.rowGap} · title↔desc ${TEXT_FIRST.titleDescGap}`,
            `preview ${TEXT_FIRST.previewWidth} · radius ${TEXT_FIRST.previewRadius} · hover ${TEXT_FIRST.hoverMs}ms`,
          ];

  return (
    <div style={{ marginTop: 14 }} className="cl-token-chip">
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
