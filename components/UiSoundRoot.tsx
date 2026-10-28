"use client";

import { useEffect } from "react";
import { playUiSound, resolveUiSoundFromEventTarget, uiSoundsCached, unlockUiSounds, warmUiSounds } from "@/lib/uiSound";
import { afterIntroIdle } from "@/lib/introReady";

/**
 * Global pointer → PS3 UI sound bridge.
 * Capture-phase so we hear the intent even if a handler stops propagation
 * later. Kept out of embeds via data-ui-sound="off" when needed.
 *
 * Mouse / pen: play on pointerdown (same frame as press / nav morph).
 * Touch: defer until pointerup, and only if the gesture stayed short and
 * still (< ~10px / < ~500ms) so scroll and drag stay silent. Click remains
 * a keyboard fallback (and a safety net if pointerup was cancelled).
 *
 * UI ticks unlock on the first pointerdown (gesture) and play even when
 * ambient music is muted. prefers-reduced-motion disables UI ticks.
 */
export default function UiSoundRoot() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fetch audio files ahead of the first gesture when idle without instantiating
    // AudioContext, so the first gesture unlocks and plays with zero console warnings.
    // Wait for the intro and load to settle, and stay off the network while
    // a first-seconds card click is fetching its route.
    const leaving = () => Boolean((window as Window & { __leavingHome?: number }).__leavingHome);
    let idleTimeout: ReturnType<typeof setTimeout> | null = null;
    const idleWarm = () => {
      if (leaving() && performance.now() < 8000) {
        idleTimeout = setTimeout(idleWarm, 1500);
        return;
      }
      warmUiSounds({ allowContext: false });
    };
    const cancelIdle = afterIntroIdle(idleWarm, 1500);
    const holdColdTick = (t: EventTarget | null) =>
      leaving() && !uiSoundsCached() && performance.now() < 8000 &&
      !(t as Element | null)?.closest?.("a.nav-link");

    // After a pointer play, skip the synthetic click for the same gesture
    // so we don't double-fire option/push.
    let suppressClickUntil = 0;

    type TouchCandidate = {
      pointerId: number;
      x: number;
      y: number;
      t: number;
      target: EventTarget | null;
    };
    let touchCandidate: TouchCandidate | null = null;

    const MAX_TOUCH_MOVE_PX = 10;
    const MAX_TOUCH_MS = 500;

    const playFromTarget = (target: EventTarget | null) => {
      if (reducedMotion || holdColdTick(target)) return;
      const id = resolveUiSoundFromEventTarget(target);
      if (!id) return;
      playUiSound(id);
      suppressClickUntil = performance.now() + 450;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      // A cold first-seconds card press is leaving the page: its tick isn't
      // in memory yet and would only land after the route anyway, so don't
      // spend the connection on it. The next gesture warms them.
      if (holdColdTick(e.target)) return;

      if (!reducedMotion) unlockUiSounds();
      warmUiSounds({ allowContext: true });

      if (reducedMotion) return;

      // Touch: wait for a completed tap — scroll/drag start on pointerdown.
      if (e.pointerType === "touch") {
        touchCandidate = {
          pointerId: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          t: performance.now(),
          target: e.target,
        };
        return;
      }

      playFromTarget(e.target);
    };

    const clearTouchCandidate = (pointerId: number) => {
      if (touchCandidate?.pointerId === pointerId) touchCandidate = null;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const candidate = touchCandidate;
      if (!candidate || candidate.pointerId !== e.pointerId) return;
      touchCandidate = null;

      const dt = performance.now() - candidate.t;
      const dist = Math.hypot(e.clientX - candidate.x, e.clientY - candidate.y);
      if (dt > MAX_TOUCH_MS || dist > MAX_TOUCH_MOVE_PX) return;

      // Prefer the release target; fall back to the press target if the
      // finger lifted on a text node / detached node mid-nav.
      playFromTarget(e.target ?? candidate.target);
    };

    const onPointerCancel = (e: PointerEvent) => {
      clearTouchCandidate(e.pointerId);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (performance.now() < suppressClickUntil) return;
      // Keyboard / assistive activation — no preceding pointerdown —
      // or a touch tap whose pointerup was swallowed before we heard it.
      playFromTarget(e.target);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("pointerup", onPointerUp, { capture: true, passive: true });
    document.addEventListener("pointercancel", onPointerCancel, { capture: true, passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      cancelIdle();
      if (idleTimeout != null) clearTimeout(idleTimeout);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
