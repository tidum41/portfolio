"use client";

import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import XmbColumn from "@/components/XmbColumn";
import { useKeepAliveInstant } from "@/lib/useKeepAliveInstant";
import { useKeepAliveVisit } from "@/lib/useKeepAliveVisit";
import { useColumnFocus } from "@/lib/useColumnFocus";

/**
 * Session keep-alive for /about. Mounts on first visit; later visits are
 * display toggles. The shell fades in; inner copy stays at rest.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const hasVisited = useKeepAliveVisit(onAbout);
  const snap = useKeepAliveInstant(onAbout);
  const phase = useColumnFocus(onAbout, { snap, playMountEnter: true });

  if (!hasVisited) return null;

  return (
    <XmbColumn phase={phase}>
      <AboutPageContent active={onAbout} instant />
    </XmbColumn>
  );
}
