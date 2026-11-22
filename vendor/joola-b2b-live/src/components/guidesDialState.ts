import { useSyncExternalStore } from "react";

/** Set from PlaygroundDial when the DialKit panel is mounted. */
let guidesDialEnabled = false;
const listeners = new Set<() => void>();

export function setGuidesDialEnabled(on: boolean) {
  if (guidesDialEnabled === on) return;
  guidesDialEnabled = on;
  listeners.forEach((fn) => fn());
}

export function getGuidesDialEnabled() {
  return guidesDialEnabled;
}

export function subscribeGuidesDialEnabled(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useGuidesDialEnabled(): boolean {
  return useSyncExternalStore(
    subscribeGuidesDialEnabled,
    getGuidesDialEnabled,
    getGuidesDialEnabled,
  );
}
