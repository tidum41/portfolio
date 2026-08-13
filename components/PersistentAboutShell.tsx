"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import { peekSoftNav } from "@/lib/instantNav";

/**
 * Session keep-alive for /about. First visit mounts; later visits toggle display.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const [hasVisited, setHasVisited] = useState(onAbout);
  const softLatched = useRef(false);
  if (onAbout && peekSoftNav()) softLatched.current = true;

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
      <AboutPageContent active={onAbout} softArrival={softLatched.current} />
    </div>
  );
}
