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
 * (DialKit's default) and in iframes. Labs (`/dev/*`) open the panel;
 * the rest of the site starts collapsed.
 */
export default function DevDialRoot() {
  const pathname = usePathname();
  const top = useSyncExternalStore(subscribe, isTopWindow, () => true);
  if (!top) return null;
  return <DialRoot defaultOpen={pathname.startsWith("/dev")} />;
}
