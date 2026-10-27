"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { afterIntroIdle } from "@/lib/introReady";
import type { SanityProject } from "@/lib/sanity/queries";

// The Work grid (hero, Mux cards, popups, CD/PS3 embeds) is only in the
// first-load JS of "/". Elsewhere it mounts hidden once the page has loaded
// and gone idle, keeping the instant return to Work, or at once if the Work
// tab is shown first.
const PersistentWorkShellImpl = dynamic(() => import("@/components/PersistentWorkShell"));


export function PersistentWorkShell({ projects }: { projects: SanityProject[] }) {
  const pathname = usePathname();
  const visible = useResolvedPrimaryTab(pathname) === "work";
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (mounted) return;
    return afterIntroIdle(() => setMounted(true), 1500);
  }, [mounted]);

  return mounted ? <PersistentWorkShellImpl projects={projects} /> : null;
}
