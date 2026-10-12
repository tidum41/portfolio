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

const LAB_Z = 50;

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

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTheme(saved === "light" ? "light" : "dark");
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
        /* Cursor DialKit is noise on this page — hide while the lab is mounted. */
        body:has(.card-lab-root) .dialkit-panel,
        body:has(.card-lab-root) .dialkit-select-dropdown,
        body:has(.card-lab-root) .dialkit-preset-dropdown,
        body:has(.card-lab-root) .dialkit-shortcuts-dropdown {
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
        .cl-token-chip {
          font-family: var(--font-mono);
          font-size: 11px;
          line-height: 1.4;
          color: var(--color-text-tertiary);
          padding: 2px 0;
        }
        .cl-section {
          scroll-margin-top: 88px;
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
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "12px 20px",
            background: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 200px" }}>
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
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>
              {compare
                ? "Stacked for side-by-side judgment · same projects · no production chrome"
                : meta.hint}
            </div>
          </div>

          <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }} aria-label="Directions">
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
          </nav>
        </header>

        <main style={{ padding: "40px 24px 140px", paddingInline: "var(--page-px, 24px)", maxWidth: 1100, marginInline: "auto" }}>
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

        <div
          style={{
            position: "fixed",
            left: 20,
            bottom: 20,
            maxWidth: 340,
            padding: "10px 12px",
            borderRadius: 6,
            background: "color-mix(in srgb, var(--color-bg) 72%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
            fontSize: 12,
            lineHeight: 1.45,
            opacity: 0.8,
            zIndex: 2,
          }}
        >
          <div style={{ opacity: 0.5, marginBottom: 6, letterSpacing: "0.04em", fontSize: 11 }}>
            ← → cycle · 1–3 jump · T theme · C compare
          </div>
          <p style={{ margin: "0 0 8px" }}>
            Lab-only. Live homepage cards are untouched. Hover never scales — Mux letterboxes under
            transformed ancestors.
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
