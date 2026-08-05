"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { DialRoot } from "dialkit";

const PS3SilkLab = dynamic(() => import("@/components/PS3SilkLab"), { ssr: false });

export default function PS3WaveLabClient() {
  return (
    <div
      data-theme="dark"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999997,
        background: "#101214",
        overflow: "hidden",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        color: "rgba(255,255,255,0.72)",
      }}
    >
      <PS3SilkLab />

      {/* Hint card — DialKit mounts on top via DialRoot */}
      <div
        style={{
          position: "absolute",
          left: 24,
          bottom: 24,
          maxWidth: 340,
          padding: "14px 16px",
          borderRadius: 8,
          background: "rgba(16,18,20,0.72)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          fontSize: 13,
          lineHeight: 1.5,
          pointerEvents: "auto",
          zIndex: 2,
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: "0.04em", opacity: 0.55, marginBottom: 6 }}>
          PS3 WAVE LAB · DEV ONLY
        </div>
        <p style={{ margin: "0 0 8px" }}>
          Open DialKit (<strong style={{ fontWeight: 500 }}>PS3 Wave Lab</strong>) and play.
          Try style → <em>variable dots</em> or <em>gooey</em>, then nudge cursor / goo folders.
        </p>
        <p style={{ margin: "0 0 10px", opacity: 0.7, fontSize: 12 }}>
          Click the canvas for a pulse ring. Save DialKit presets when you land on something good.
          Production hero is untouched.
        </p>
        <Link href="/" style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
          ← back to work
        </Link>
      </div>

      <DialRoot defaultOpen />
    </div>
  );
}
