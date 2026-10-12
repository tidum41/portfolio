"use client";

import { useSyncExternalStore } from "react";
import { DialRoot } from "dialkit";
import { usePathname } from "next/navigation";

function subscribe() {
  return () => {};
}

function isTopWindow() {
  return window.self === window.top;
}

/**
 * Single DialRoot for local `next dev`. Hidden on Vercel/production
 * (DialKit's default) and in iframes. Most labs (`/dev/*`) open the
 * panel; card-lab starts collapsed so DialKit never covers the cards.
 */
export default function DevDialRoot() {
  const pathname = usePathname();
  const top = useSyncExternalStore(subscribe, isTopWindow, () => true);
  if (!top) return null;
  const openByDefault =
    pathname.startsWith("/dev") && !pathname.startsWith("/dev/card-lab");
  return <DialRoot defaultOpen={openByDefault} />;
}
