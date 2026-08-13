import type { CSSProperties } from "react";

/**
 * Park a persistent shell without `display: none`.
 * Hiding Mux/CD/WebGL with display:none on the click frame is what froze the
 * custom cursor (main-thread layout of video elements). Parking keeps the
 * tree mounted, takes it out of flow, and skips painting via content-visibility.
 */
export function parkShellStyle(onRoute: boolean): CSSProperties {
  if (onRoute) {
    return {
      display: "block",
      position: "relative",
      zIndex: 1,
      visibility: "visible",
      pointerEvents: "auto",
      height: "auto",
      overflow: "visible",
      contentVisibility: "visible",
    };
  }
  return {
    display: "block",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 0,
    height: 0,
    overflow: "hidden",
    visibility: "hidden",
    pointerEvents: "none",
    contentVisibility: "hidden",
  };
}
