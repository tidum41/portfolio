"use client";

import Link from "next/link";
import PS3SilkLab from "@/components/PS3SilkLab";

/**
 * DialKit panels are `position: fixed; z-index: 9999` (portaled to body).
 * Keep the lab canvas under that so dials stay visible/clickable. Nav is ~40;
 * PersistentWorkShell is display:none off "/".
 *
 * Import PS3SilkLab directly (no next/dynamic ssr:false) — that bailout was
 * what Next DevTools was surfacing as an "Error" overlay on this page.
 * WebGL still only inits in useEffect on the client.
 */
const LAB_Z = 50;

export default function PS3WaveLabClient() {
  return (
    <>
      {/* Force DialKit (and its dropdowns) above anything else on this page */}
      <style>{`
        .dialkit-panel,
        .dialkit-select-dropdown,
        .dialkit-preset-dropdown,
        .dialkit-shortcuts-dropdown {
          z-index: 10050 !important;
        }
      `}</style>

      <div
        data-theme="dark"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: LAB_Z,
          background: "#101214",
          overflow: "hidden",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          color: "rgba(255,255,255,0.65)",
        }}
      >
        <PS3SilkLab />

        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            maxWidth: 300,
            padding: "10px 12px",
            borderRadius: 6,
            background: "rgba(16,18,20,0.55)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12,
            lineHeight: 1.45,
            pointerEvents: "auto",
            zIndex: 2,
          }}
        >
          <div style={{ opacity: 0.5, marginBottom: 4, letterSpacing: "0.04em", fontSize: 11 }}>
            XMB RIBBONS + PRINT · v5
          </div>
          <p style={{ margin: "0 0 6px" }}>
            Continuous wrapping silk first (real XMB physics). Halftone is a material on top —
            dial <strong style={{ fontWeight: 500 }}>print.silkMix</strong> (0 = pure ribbons,
            1 = dots only).
          </p>
          <p style={{ margin: "0 0 8px", opacity: 0.65, fontSize: 11 }}>
            Your print/morph numbers are the new defaults. Hard-refresh once (persist{" "}
            <strong style={{ fontWeight: 500 }}>v5</strong>).
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
              ← work
            </Link>
            <Link href="/dev/motion-lab" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
              motion lab
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
