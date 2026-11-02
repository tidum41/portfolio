"use client";

/**
 * Dev-only DialKit gate. In `next dev`, `dialkit` resolves here (see
 * next.config.mjs) so the panel only lists what's being tuned right now:
 * the PS3Silk panel everywhere, plus every panel on its own /dev/* lab route.
 * Set NEXT_PUBLIC_DIALKIT_ALL=1 to show every panel again. Gated panels
 * still return their config defaults, so components behave the same.
 */
import { useState } from "react";
import * as Real from "dialkit-real";
import { useDialKit as useStub, useDialKitController as useStubController } from "./dialkit-prod";

export * from "dialkit-real";

const ALWAYS = new Set(["PS3Silk"]);

function allowed(name: string) {
  if (process.env.NEXT_PUBLIC_DIALKIT_ALL === "1" || ALWAYS.has(name)) return true;
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/dev");
}

// Decision is frozen per instance at mount so hook order never changes.
export function useDialKit(name: string, config: any, options?: any): any {
  const [on] = useState(() => allowed(name));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return on ? Real.useDialKit(name, config, options) : useStub(name, config, options);
}

export function useDialKitController(name: string, config: any, options?: any): any {
  const [on] = useState(() => allowed(name));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return on ? Real.useDialKitController(name, config, options) : useStubController(name, config, options);
}
