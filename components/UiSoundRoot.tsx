"use client";

import { useEffect } from "react";
import { playUiSound, resolveUiSoundFromEventTarget, unlockUiSounds, warmUiSounds } from "@/lib/uiSound";

/**
 * Global click → PS3 UI sound bridge.
 * Capture-phase so we hear the intent even if a handler stops propagation
 * later. Kept out of embeds via data-ui-sound="off" when needed.
 *
 * UI ticks unlock on the first pointerdown (gesture) and play even when
 * ambient music is muted. prefers-reduced-motion disables UI ticks.
 */
export default function UiSoundRoot() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onPointerDown = () => {
      if (!reducedMotion) unlockUiSounds();
      warmUiSounds();
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const id = resolveUiSoundFromEventTarget(e.target);
      if (!id) return;
      void playUiSound(id);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true, once: true });
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
