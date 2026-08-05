"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DialRoot } from "dialkit";

const PS3SilkLab = dynamic(() => import("@/components/PS3SilkLab"), { ssr: false });

export default function PS3WaveLabClient() {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "ps3-wave-lab-dialkit";
    el.style.cssText = "position:relative;z-index:1000001;";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      el.remove();
    };
  }, []);

  return (
    <>
      <div
        data-theme="dark"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999997,
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
            maxWidth: 260,
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
            WAVE LAB
          </div>
          <p style={{ margin: "0 0 6px" }}>
            Same silk as production. Dial <strong style={{ fontWeight: 500 }}>flare</strong> for
            quiet cursor scale on the halftone.
          </p>
          <Link href="/" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
            ← work
          </Link>
        </div>
      </div>

      {portalEl && createPortal(<DialRoot defaultOpen />, portalEl)}
    </>
  );
}
