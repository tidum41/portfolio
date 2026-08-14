"use client";

import { useEffect } from "react";
import { playUiSound, resolveUiSoundFromEventTarget, unlockUiSounds, warmUiSounds } from "@/lib/uiSound";

/**
 * Global pointer → PS3 UI sound bridge.
 * Capture-phase so we hear the intent even if a handler stops propagation
 * later. Kept out of embeds via data-ui-sound="off" when needed.
 *
 * Plays on pointerdown (same frame as press / nav morph) rather than click,
 * which lagged — especially on touch nav that commits on pointerup and may
 * drop the ghost click after route change. Click remains a keyboard fallback.
 *
 * UI ticks unlock on the first pointerdown (gesture) and play even when
 * ambient music is muted. prefers-reduced-motion disables UI ticks.
 */
export default function UiSoundRoot() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Decode ahead of the first gesture when idle so the first tick only
    // needs AudioContext.resume + BufferSource.start.
    let idleHandle: number | null = null;
    let idleTimeout: ReturnType<typeof setTimeout> | null = null;
    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(() => warmUiSounds(), { timeout: 1500 });
    } else {
      idleTimeout = setTimeout(() => warmUiSounds(), 400);
    }

    // After a pointerdown play, skip the synthetic click for the same gesture
    // so we don't double-fire option/push.
    let suppressClickUntil = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      if (!reducedMotion) unlockUiSounds();
      warmUiSounds();

      if (reducedMotion) return;
      const id = resolveUiSoundFromEventTarget(e.target);
      if (!id) return;

      playUiSound(id);
      suppressClickUntil = performance.now() + 450;
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (performance.now() < suppressClickUntil) return;
      // Keyboard / assistive activation — no preceding pointerdown.
      if (reducedMotion) return;
      const id = resolveUiSoundFromEventTarget(e.target);
      if (!id) return;
      playUiSound(id);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      if (idleHandle != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (idleTimeout != null) clearTimeout(idleTimeout);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
