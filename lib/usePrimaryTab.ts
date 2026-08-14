"use client";

import { useSyncExternalStore } from "react";
import {
  peekPendingPrimaryTab,
  pathnameToPrimaryTab,
  subscribePrimaryTab,
  type PrimaryTab,
} from "@/lib/instantNav";

export function usePendingPrimaryTab(): PrimaryTab | null {
  return useSyncExternalStore(
    subscribePrimaryTab,
    peekPendingPrimaryTab,
    () => null,
  );
}

export function useResolvedPrimaryTab(pathname: string): PrimaryTab | null {
  const pending = usePendingPrimaryTab();
  return pending ?? pathnameToPrimaryTab(pathname);
}
