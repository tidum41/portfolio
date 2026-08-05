"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { DialRoot } from "dialkit";

const PS3SilkLab = dynamic(() => import("@/components/PS3SilkLab"), { ssr: false });

/**
 * DialKit panels are `position: fixed; z-index: 9999` (portaled to body).
 * Keep the lab canvas under that so dials stay visible/clickable. Nav is ~40;
 * PersistentWorkShell is display:none off "/".
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
            VINTAGE HALFTONE · MORPH
          </div>
          <p style={{ margin: "0 0 6px" }}>
            Silk is only the plate. What you see is print dots — move the cursor to melt them
            (morphism), then they settle back to ink.
          </p>
          <p style={{ margin: "0 0 8px", opacity: 0.65, fontSize: 11 }}>
            DialKit (<strong style={{ fontWeight: 500 }}>Vintage Halftone</strong>) should be
            top-right — open <strong style={{ fontWeight: 500 }}>print</strong> +{" "}
            <strong style={{ fontWeight: 500 }}>morph</strong>.
          </p>
          <Link href="/" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
            ← work
          </Link>
        </div>
      </div>

      <DialRoot defaultOpen />
    </>
  );
}
