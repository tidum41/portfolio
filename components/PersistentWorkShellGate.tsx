"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useResolvedPrimaryTab } from "@/lib/usePrimaryTab";
import { afterIntroIdle, onIntroDoneAndLoaded } from "@/lib/introReady";
import type { SanityProject } from "@/lib/sanity/queries";

// The Work grid (hero, Mux cards, popups, CD/PS3 embeds) is only in the
// first-load JS of "/". Elsewhere it mounts hidden once the page has loaded
// and gone idle, keeping the instant return to Work, or at once if the Work
// tab is shown first.
// Keep the import inline in dynamic(): Next only adds the SSR-rendered
// chunk to "/"'s HTML when it can see `dynamic(() => import("..."))`.
const PersistentWorkShellImpl = dynamic(() => import("@/components/PersistentWorkShell"));
const loadImpl = () => import("@/components/PersistentWorkShell");


export function PersistentWorkShell({ projects }: { projects: SanityProject[] }) {
  const pathname = usePathname();
  const visible = useResolvedPrimaryTab(pathname) === "work";
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  // Fetch the chunk as soon as the page has loaded (without mounting it), so
  // an early Work click on a slow network only waits for the mount, not the
  // download. Only the mount waits for idle.
  useEffect(() => {
    if (mounted) return;
    return onIntroDoneAndLoaded(() => void loadImpl());
  }, [mounted]);

  useEffect(() => {
    if (mounted) return;
    return afterIntroIdle(() => setMounted(true), 1500);
  }, [mounted]);

  return mounted ? <PersistentWorkShellImpl projects={projects} /> : null;
}
