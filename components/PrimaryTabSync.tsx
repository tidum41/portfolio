"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  clearPendingPrimaryTab,
  pathnameToPrimaryTab,
  peekPendingPrimaryTab,
  usePendingPrimaryTab,
} from "@/lib/instantNav";

/**
 * URL is the sync target, not the paint trigger. Clear the optimistic tab
 * once Next.js catches up, or drop a stale pending after 1.5s so a failed
 * push cannot pin the wrong shell.
 */
export default function PrimaryTabSync() {
  const pathname = usePathname();
  const pending = usePendingPrimaryTab();

  useLayoutEffect(() => {
    if (!pending) return;
    if (pathnameToPrimaryTab(pathname) === pending) {
      clearPendingPrimaryTab();
    }
  }, [pathname, pending]);

  useEffect(() => {
    if (!pending) return;
    const expected = pending;
    const t = window.setTimeout(() => {
      if (peekPendingPrimaryTab() !== expected) return;
      if (pathnameToPrimaryTab(window.location.pathname) !== expected) {
        clearPendingPrimaryTab();
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [pending]);

  return null;
}
