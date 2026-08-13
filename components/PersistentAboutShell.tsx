"use client";

import { usePathname } from "next/navigation";
import AboutPageContent from "@/components/AboutPageContent";
import XmbColumn from "@/components/XmbColumn";
import { useKeepAliveInstant } from "@/lib/useKeepAliveInstant";
import { useKeepAliveVisit } from "@/lib/useKeepAliveVisit";
import { useColumnFocus } from "@/lib/useColumnFocus";
import { onWarmAbout, wasAboutWarmed } from "@/lib/keepAliveWarm";

/**
 * Session keep-alive for /about. The shell plays XMB column focus;
 * inner copy stays at rest so it doesn't double-spawn.
 */
export default function PersistentAboutShell() {
  const pathname = usePathname();
  const onAbout = pathname === "/about";
  const hasVisited = useKeepAliveVisit(onAbout, wasAboutWarmed(), onWarmAbout);
  const snap = useKeepAliveInstant(onAbout);
  const phase = useColumnFocus(onAbout, { snap, playMountEnter: true });

  if (!hasVisited) return null;

  return (
    <XmbColumn phase={phase}>
      <AboutPageContent active={phase !== "hidden"} instant />
    </XmbColumn>
  );
}
