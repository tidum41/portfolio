"use client";

import CdPlayerApp from "@/components/embeds/cd-player/CdPlayerApp";

export default function CDPlayer({ style, active = true, variant = "work" }: { style?: React.CSSProperties; active?: boolean; variant?: "work" | "about" }) {
  return (
    <div
      style={{
        // aspectRatio is only a fallback for callers with no height-defined
        // ancestor (e.g. the About page) — it's a no-op wherever a parent
        // already supplies a real height (the work-grid tile/popup slots),
        // since aspect-ratio only resolves dimensions left as `auto`.
        aspectRatio: "1296 / 1080",
        ...style,
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <CdPlayerApp active={active} variant={variant} />
    </div>
  );
}
