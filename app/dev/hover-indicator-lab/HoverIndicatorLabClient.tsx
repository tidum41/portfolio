"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LabDemoCard from "./LabDemoCard";
import "./hilab.css";
import type { LabProject, VariantId } from "./types";
import { isVariantId, VARIANTS } from "./types";

const LAB_Z = 50;

export default function HoverIndicatorLabClient({ projects }: { projects: LabProject[] }) {
  const [variantId, setVariantId] = useState<VariantId>("dock-xmb-glow");
  const [morphActive, setMorphActive] = useState(false);

  const variantIndex = VARIANTS.findIndex((v) => v.id === variantId);
  const variantMeta = VARIANTS[variantIndex] ?? VARIANTS[0];

  const cycle = useCallback(
    (dir: 1 | -1) => {
      const next = VARIANTS[(variantIndex + dir + VARIANTS.length) % VARIANTS.length];
      setVariantId(next.id);
      setMorphActive(false);
    },
    [variantIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        cycle(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycle(-1);
      } else if (/^[1-9]$/.test(e.key) || e.key === "0") {
        const idx = e.key === "0" ? 9 : Number(e.key) - 1;
        const next = VARIANTS[idx];
        if (next) {
          setVariantId(next.id);
          setMorphActive(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle]);

  return (
    <div
      className="hilab-root"
      data-variant={variantId}
      data-morph-active={morphActive ? "true" : "false"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: LAB_Z,
        background: "var(--color-bg)",
        color: "var(--color-text-primary)",
        overflow: "auto",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "14px 20px",
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
            Hover indicator lab · {variantIndex + 1} / {VARIANTS.length}
          </div>
          <div style={{ fontSize: 15, letterSpacing: "-0.02em" }}>{variantMeta.label}</div>
          <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2, maxWidth: 520 }}>{variantMeta.hint}</div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ opacity: 0.5 }}>Direction</span>
          <select
            className="hilab-btn"
            style={{ minHeight: 40, padding: "6px 10px" }}
            value={variantId}
            onChange={(e) => {
              const v = e.target.value;
              if (isVariantId(v)) {
                setVariantId(v);
                setMorphActive(false);
              }
            }}
          >
            {VARIANTS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="hilab-btn" onClick={() => cycle(-1)} aria-label="Previous variant">
          ←
        </button>
        <button type="button" className="hilab-btn" onClick={() => cycle(1)} aria-label="Next variant">
          →
        </button>
        <ThemeToggle />
      </div>

      <div style={{ padding: "40px var(--page-px, 24px) 120px", maxWidth: 960, margin: "0 auto" }}>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--color-text-tertiary)",
            maxWidth: 640,
          }}
        >
          Three tiles: internal case study, external demo, and both. PS3/XMB dock labels lead the switcher
          (rise + fade, ≤180ms, no bounce). Cursor pills and other directions follow. Touch shows labels
          on-card; reduced motion skips trail lag and decode effects.
        </p>

        {projects.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>No project thumbnails loaded from Sanity.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--card-gap, 48px)",
              alignItems: "start",
            }}
          >
            {projects.map((p) => (
              <LabDemoCard
                key={`${p.id}-${p.kind}`}
                project={p}
                variant={variantId}
                onMorphActiveChange={setMorphActive}
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          maxWidth: 340,
          padding: "10px 12px",
          borderRadius: "var(--radius-mosaic)",
          background: "color-mix(in srgb, var(--color-bg) 72%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent)",
          fontSize: 12,
          lineHeight: 1.45,
          opacity: 0.8,
          zIndex: 2,
        }}
      >
        <div style={{ opacity: 0.5, marginBottom: 6, letterSpacing: "0.04em", fontSize: 11 }}>
          ← → cycle · 1–{Math.min(9, VARIANTS.length)} jump · switcher above
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11 }}>
          <Link href="/" style={{ color: "inherit" }}>
            ← work
          </Link>
          <Link href="/dev/motion-lab" style={{ color: "inherit" }}>
            motion lab
          </Link>
        </div>
      </div>
    </div>
  );
}
