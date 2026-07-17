"use client";

import { useEffect, useId } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";

/**
 * Owns one continuous 0→1 progress value ("rest" → "fully activated") for a
 * halftone effect, driven by a spring that swaps stiffness/damping between
 * activating and deactivating — the same asymmetric-physics config every
 * halftone consumer already tunes via the shared "Nav Links" DialKit panel.
 *
 * Callers feed the returned `filterId` to HalftoneFilterDef and `t` to both
 * HalftoneFilterDef and their own opacity/scale bindings, so the layer's
 * crossfade and the filter's own dot-pitch/blur/threshold sweep move on
 * exactly the same timeline — this is what turns the effect from two static
 * end-states cross-fading into one continuously-morphing render.
 */
export function useHalftoneMorph(dk: any, active: boolean): { filterId: string; t: MotionValue<number> } {
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
    const stiffness = active ? (dk?.stiffnessIn ?? 150) : (dk?.stiffnessOut ?? 40);
    const damping = active ? (dk?.dampingIn ?? 15) : (dk?.dampingOut ?? 12);
    const controls = animate(t, target, { type: "spring", stiffness, damping });
    return () => controls.stop();
  }, [active, reduced, dk?.stiffnessIn, dk?.dampingIn, dk?.stiffnessOut, dk?.dampingOut, t]);

  return { filterId, t };
}
