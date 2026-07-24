"use client";

import dynamic from "next/dynamic";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

export default function PS3PreviewClient() {
  return (
    <div
      data-theme="dark"
      style={{
        position: "fixed",
        inset: 0,
        // PersistentWorkShell (nav, footer, the real homepage hero) stays
        // mounted on every route — this needs to sit visually above all of
        // it, not just alongside it, to actually isolate the pattern.
        zIndex: 999997,
        background: "#101214", // --color-bg, dark mode
        overflow: "hidden",
      }}
    >
      <PS3Silk
        active
        mode={1}
        intensity={0.18}
        waveColor="#ffffff"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
