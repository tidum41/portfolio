"use client";

import { useState, type CSSProperties } from "react";

/**
 * The BruinLease case study's pause and play control (from PhoneMockup), shared so other
 * case studies reuse it exactly: a 44px circle 8px from the top right, placeholder fill, an
 * inset muted ring on hover-capable devices, 11px icons in the secondary text colour.
 * Hit area is extended by .phone-mockup-play-btn::before in globals.css.
 */
export default function PlayPauseButton({ isPlaying, onToggle, style }: { isPlaying: boolean; onToggle: () => void; style?: CSSProperties }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isPlaying ? "Pause" : "Play"}
      className="phone-mockup-play-btn"
      style={{
        position: "absolute", top: 8, right: 8, zIndex: 10,
        width: 44, height: 44, borderRadius: "50%",
        background: "var(--color-placeholder)",
        boxShadow: isHovered ? "inset 0 0 0 1.5px var(--color-text-muted)" : "none",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        flexShrink: 0,
        transition: "box-shadow 150ms ease",
        ...style,
      }}
    >
      {isPlaying ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <rect x="1.5" y="1.5" width="3" height="8" rx="1" fill="var(--color-text-secondary)" />
          <rect x="6.5" y="1.5" width="3" height="8" rx="1" fill="var(--color-text-secondary)" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" style={{ marginLeft: 1 }}>
          <path d="M2 1.5 L9.5 5.5 L2 9.5 Z" fill="var(--color-text-secondary)" />
        </svg>
      )}
    </button>
  );
}
