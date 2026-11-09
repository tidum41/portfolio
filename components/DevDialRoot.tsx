"use client";

import { useSyncExternalStore } from "react";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { usePathname } from "next/navigation";

function subscribe() {
  return () => {};
}

function isTopWindow() {
  return window.self === window.top;
}

/**
 * Single DialRoot for local `next dev` and Vercel preview. Hidden on
 * production (DialKit's default / our dialkit-prod stub) and in iframes.
 * Labs (`/dev/*`) open the panel; the rest of the site starts collapsed.
 *
 * Use `versions="menu"` (not the 2.1+ thumbnail default). Thumbnail capture
 * DOM→SVG→canvas clones the whole viewport, including the PS3 silk WebGL
 * canvas (ReadPixels stalls) and Mux videos (blob: srcs that 404 mid-capture).
 * With many panels, missing/stale thumbs also re-capture on open via
 * captureMissingSoon — that froze/crashed the preview. The classic menu still
 * saves, lists, and restores versions without capturing the page.
 */
export default function DevDialRoot() {
  const pathname = usePathname();
  const top = useSyncExternalStore(subscribe, isTopWindow, () => true);
  if (!top) return null;
  // Comparison labs have their own controls. An open DialKit panel
  // would cover the thing being compared.
  const openDials =
    pathname.startsWith("/dev") &&
    !pathname.startsWith("/dev/card-lab") &&
    !pathname.startsWith("/dev/nav-morph");
  // This component is only bundled when NEXT_PUBLIC_DIALKIT=1 (dev / Vercel
  // preview). Preview builds still have NODE_ENV=production, so DialRoot
  // needs productionEnabled or it returns null.
  return (
    <DialRoot
      defaultOpen={openDials}
      versions="menu"
      productionEnabled
    />
  );
}
