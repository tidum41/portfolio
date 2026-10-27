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
  // Comparison labs and archive-lab mount their own DialRoot.
  if (
    pathname.startsWith("/dev/card-lab") ||
    pathname.startsWith("/dev/nav-morph") ||
    pathname.startsWith("/dev/archive-lab")
  ) {
    return null;
  }
  const openDials = pathname.startsWith("/dev");
  return <DialRoot defaultOpen={openDials} />;
}
