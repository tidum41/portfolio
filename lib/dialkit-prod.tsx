"use client";

import { useRef } from "react";
import { resolveDialValues } from "dialkit/store";

/**
 * Production stand-in for DialKit. The real package is a design-time panel:
 * visitors never see it. The numbers in each component are the design, and
 * `resolveDialValues` (from DialKit's store, with no saved overrides) is the
 * same function the panel uses to turn those configs into values. Local
 * `next dev` keeps the real package (see next.config.mjs).
 */

function resolve(config: unknown): unknown {
  if (typeof config !== "object" || config === null) return config;
  return resolveDialValues(config as never, {});
}

function stableKey(config: unknown): string {
  try {
    return JSON.stringify(config);
  } catch {
    return "";
  }
}

export function useDialKit(_name: string, config: unknown, _options?: unknown): any {
  const cache = useRef<{ key: string; value: unknown } | null>(null);
  const key = stableKey(config);
  if (!cache.current || cache.current.key !== key) {
    cache.current = { key, value: resolve(config) };
  }
  return cache.current.value;
}

export function useDialKitController(name: string, config: unknown, options?: unknown) {
  const values = useDialKit(name, config, options);
  const api = useRef<{
    values: unknown;
    setValue: (path: string, value: unknown) => void;
    setValues: (next: unknown) => void;
    resetValues: () => void;
    getValues: () => unknown;
  } | null>(null);
  if (!api.current || api.current.values !== values) {
    api.current = {
      values,
      setValue: () => {},
      setValues: () => {},
      resetValues: () => {},
      getValues: () => values,
    };
  }
  return api.current;
}

export function DialRoot(_props: { defaultOpen?: boolean }) {
  return null;
}
