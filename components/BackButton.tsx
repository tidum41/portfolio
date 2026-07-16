"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const COLOR_ACTIVE   = "rgb(46, 46, 46)";   // #2E2E2E
const COLOR_INACTIVE = "rgb(173, 173, 173)"; // #ADADAD

// 20px chevron back arrow. Source: BackButton.tsx (Framer).
export default function BackButton({ href = "/" }: { href?: string }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => router.push(href)}
      onMouseEnter={() => {
        // Touch devices fire mouseenter on tap with no matching mouseleave,
        // which would otherwise leave this stuck in its "hovered" color.
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      aria-label="Back to home"
      className="back-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: "10px 4px 10px 0",
        cursor: "pointer",
        color: hovered ? COLOR_ACTIVE : COLOR_INACTIVE,
        fontSize: 14,
        letterSpacing: "-0.25px",
        fontWeight: 400,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      back
    </button>
  );
}
