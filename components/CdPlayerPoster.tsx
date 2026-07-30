"use client";

import { EASE_OPACITY, PANEL_DURATION } from "@/lib/motion";
import styles from "./CdPlayerPoster.module.css";

const EASE_CSS = `cubic-bezier(${EASE_OPACITY.join(", ")})`;

/**
 * Grid-tile stand-in while the live CDPlayer is portaled into the modal.
 * Theme follows html[data-theme] via CSS — no React state, so the poster
 * always matches the live embed's card backdrop without hydration risk.
 *
 * `fade` is close-only; open snaps opaque so the blurred card doesn't morph.
 */
export default function CdPlayerPoster({
  opacity = 1,
  fade = true,
}: {
  opacity?: number;
  fade?: boolean;
}) {
  return (
    <div
      className={styles.poster}
      style={{
        opacity,
        transition: fade ? `opacity ${PANEL_DURATION.embed.enter}s ${EASE_CSS}` : "none",
      }}
    />
  );
}
