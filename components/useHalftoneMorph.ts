"use client";

import { useEffect, useId } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";

/**
 * Owns one continuous 0→1 progress value ("rest" → "fully activated") for a
 * halftone effect, driven by a spring that swaps stiffness/damping between
 * activating and deactivating — the same asymmetric-physics config every
 * halftone consumer already tunes via the shared "Nav Links" DialKit panel.
 *
 * Callers feed the returned `filterId` to HalftoneDotField and `t` to both
 * HalftoneDotField and their own scale bindings, so the dot field's per-dot
 * sweep and goo morph stay driven by real spring physics (the part that
 * should feel physical).
 *
 * The base-text/overlay-dots opacity crossfade is deliberately NOT derived
 * from `t` (a prior version of this file computed it from `t` via two
 * independent ramp thresholds) — a value riding a spring inherits the
 * spring's velocity profile, which is heavily front-loaded (fast initial
 * motion, a long asymptotic tail), so a "fast handoff" window expressed as a
 * fraction of `t`'s 0..1 range actually completed within a tiny fraction of
 * *real time*, reading as an instant snap rather than a transition — and
 * during the underdamped out-spring's negative overshoot, a version of that
 * curve using Math.abs(t) re-closed the base layer right after it had just
 * recovered, producing a real gap where neither layer was visible.
 *
 * Each consumer instead drives its own base/overlay opacity directly off
 * `active` via a plain fixed-duration tween (see HalftoneNavLink.tsx /
 * ThemeToggle.tsx / VolumeControl.tsx: `animate={{opacity: active?0:1}}`),
 * using this hook's `active`-derived crossfade is what guarantees
 * continuity: base and overlay opacity are a strict complementary pair
 * (`opacity: active ? 0 : 1` vs `active ? 1 : 0`, same duration, started at
 * the same instant) — mathematically, something is always at least ~50%
 * visible at every instant of the crossfade, by construction, independent
 * of the spring entirely. There is no `t`-derived, spring-coupled opacity
 * value left to get this wrong.
 */
export function useHalftoneMorph(
  dk: any,
  active: boolean
): { filterId: string; t: MotionValue<number> } {
  const rawId = useId();
  const filterId = "halftone-" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const t = useMotionValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const target = active ? 1 : 0;
    if (reduced) {
      t.set(target);
      return;
    }
    // Debug-only: stretches the whole animation's time axis by `slowMotion`
    // while preserving its exact normalized shape (same % overshoot, same
    // relative timing of the goo peak, etc.) — for a spring, settling time
    // scales with 1/sqrt(stiffness), so dividing stiffness by slowMotion^2
    // slows time by slowMotion; damping is then divided by slowMotion (not
    // slowMotion^2) to hold the damping RATIO constant, since ratio depends
    // on damping/sqrt(stiffness). At the default of 1 this is a no-op.
    const slowMotion = Math.max(1, dk?.showHideSpeed?.slowMotion ?? 1);
    const stiffness = (active ? (dk?.bouncePhysics?.activateSpeed ?? 150) : (dk?.bouncePhysics?.settleSpeed ?? 40)) / (slowMotion * slowMotion);
    const damping = (active ? (dk?.bouncePhysics?.activateSmoothness ?? 15) : (dk?.bouncePhysics?.settleWobbleControl ?? 12)) / slowMotion;
    const controls = animate(t, target, { type: "spring", stiffness, damping });
    return () => controls.stop();
  }, [active, reduced, dk?.bouncePhysics?.activateSpeed, dk?.bouncePhysics?.activateSmoothness, dk?.bouncePhysics?.settleSpeed, dk?.bouncePhysics?.settleWobbleControl, dk?.showHideSpeed?.slowMotion, t]);

  return { filterId, t };
}
