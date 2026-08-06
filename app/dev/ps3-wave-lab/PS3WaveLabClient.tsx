"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DialRoot, DialStore } from "dialkit";
import PS3SilkLab from "@/components/PS3SilkLab";

/**
 * DialKit panels are `position: fixed; z-index: 9999` (portaled to body).
 * Keep the lab canvas under that so dials stay visible/clickable.
 *
 * Site chrome (Cursor, Entrance, Nav, production PS3Silk, …) also registers
 * DialKit panels via the root layout. On this page we prune the store so
 * DialRoot only shows the pattern panel — nothing else.
 *
 * Import PS3SilkLab directly (no next/dynamic ssr:false) — that bailout was
 * what Next DevTools was surfacing as an "Error" overlay on this page.
 */
const LAB_Z = 50;
/** Must match useDialKit `id` in PS3SilkLab */
const WAVE_LAB_PANEL_ID = "ps3-wave-lab-v9";

function pruneForeignDialPanels() {
  for (const panel of DialStore.getPanels()) {
    if (panel.id !== WAVE_LAB_PANEL_ID) {
      DialStore.unregisterPanel(panel.id);
    }
  }
}

export default function PS3WaveLabClient() {
  // Keep DialKit scoped to this lab’s pattern panel only. Other mounted
  // site components may re-register (e.g. on dial config HMR); re-prune.
  useEffect(() => {
    document.documentElement.setAttribute("data-ps3-wave-lab", "1");
    pruneForeignDialPanels();
    const unsub = DialStore.subscribeGlobal(pruneForeignDialPanels);
    return () => {
      unsub();
      document.documentElement.removeAttribute("data-ps3-wave-lab");
    };
  }, []);

  return (
    <>
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
            maxWidth: 280,
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
            PS3 WAVE LAB · v9
          </div>
          <p style={{ margin: "0 0 6px" }}>
            DialKit (top-right) is <strong style={{ fontWeight: 500 }}>pattern-only</strong> on
            this page — silk / print / plate. Dot cursor on; no trail glow.
          </p>
          <p style={{ margin: "0 0 8px", opacity: 0.65, fontSize: 11 }}>
            Visual reference preset. Morph off (cheap). Hard-refresh once (persist{" "}
            <strong style={{ fontWeight: 500 }}>v9</strong>).
          </p>
          <Link href="/" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
            ← work
          </Link>
        </div>
      </div>

      <DialRoot defaultOpen position="top-right" theme="dark" />
    </>
  );
}
