"use client";

import { useEffect } from "react";
import { playUiSound, resolveUiSoundFromEventTarget, warmUiSounds } from "@/lib/uiSound";

/**
 * Global click → PS3 UI sound bridge.
 * Capture-phase so we hear the intent even if a handler stops propagation
 * later. Kept out of embeds via data-ui-sound="off" when needed.
 */
export default function UiSoundRoot() {
  useEffect(() => {
    const onPointerDown = () => {
      // Unlock AudioContext early on any gesture so the first nav click isn't silent.
      warmUiSounds();
    };

    const onClick = (e: MouseEvent) => {
      // Ignore non-primary / modified clicks that open new tabs without navigating this page's chrome feel.
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
