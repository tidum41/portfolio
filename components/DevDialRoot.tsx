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
 * Single DialRoot for local `next dev`. Hidden on Vercel/production
 * (DialKit's default) and in iframes. Labs (`/dev/*`) open the panel;
 * the rest of the site starts collapsed.
 */
export default function DevDialRoot() {
  const pathname = usePathname();
  const top = useSyncExternalStore(subscribe, isTopWindow, () => true);
  if (!top) return null;
  if (pathname.includes("/dev/dialogue-placement-export")) return null;
  // Comparison labs have their own controls. An open DialKit panel
  // would cover the thing being compared.
  const openDials =
    pathname.startsWith("/dev") &&
    !pathname.startsWith("/dev/card-lab") &&
    !pathname.startsWith("/dev/nav-morph");
  return <DialRoot defaultOpen={openDials} />;
}
