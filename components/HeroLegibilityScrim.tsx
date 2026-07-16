"use client";

import { useDialKit } from "dialkit";

export default function HeroLegibilityScrim() {
  const dk = useDialKit("Hero Scrim", {
    opacity: [0.6, 0, 1, 0.01],
    width: [55, 20, 100, 1],
    height: [70, 20, 150, 1],
    x: [30, 0, 100, 1],
    y: [50, 0, 100, 1],
    feather: [70, 20, 100, 1],
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(ellipse ${dk.width}% ${dk.height}% at ${dk.x}% ${dk.y}%, var(--color-bg) 0%, transparent ${dk.feather}%)`,
        opacity: dk.opacity,
      }}
    />
  );
}
