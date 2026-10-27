import type { ComponentType } from "react";
import type { SanityProject } from "@/lib/sanity/queries";

export type WorkShellComponent = ComponentType<{ projects: SanityProject[] }>;

// A module reference (the same component for every request), not request data.
let registered: WorkShellComponent | null = null;
const waiters: ((c: WorkShellComponent) => void)[] = [];

/** Called at module load by components/WorkShellPreload (imported on "/" only). */
export function registerWorkShell(component: WorkShellComponent): void {
  registered = component;
  for (const resolve of waiters.splice(0)) resolve(component);
}

/** Resolves with the registered shell, or null after `timeoutMs`. */
export function whenWorkShellRegistered(timeoutMs: number): Promise<WorkShellComponent | null> {
  if (registered) return Promise.resolve(registered);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    waiters.push((c) => {
      clearTimeout(timer);
      resolve(c);
    });
  });
}
