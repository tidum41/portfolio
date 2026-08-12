"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";

/**
 * Session keep-alive for /about — same contract as PersistentWorkShell.
 * First visit mounts the tree (budget-split inside AboutPageContent); later
 * soft-navs only toggle display so DialKit/images/CD aren't rebuilt.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const [hasVisited, setHasVisited] = useState(onAbout);

  useLayoutEffect(() => {
    if (onAbout) setHasVisited(true);
  }, [onAbout]);

  if (!hasVisited) return null;

  return (
    <div
      style={{ display: onAbout ? "block" : "none", position: "relative", zIndex: 1 }}
      aria-hidden={!onAbout}
      inert={!onAbout}
      {...(!onAbout ? { "data-nosnippet": true } : {})}
    >
      <AboutPageContent active={onAbout} />
    </div>
  );
}
