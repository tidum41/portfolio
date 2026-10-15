"use client";

import { useRef } from "react";

/**
 * Production stand-in for DialKit. The real package is a design-time panel:
 * visitors never see it, and every control already falls back to the first
 * value in its config (the shipped design). Importing the real module pulled
 * the panel runtime into every page and subscribed each control to a store.
 *
 * Local `next dev` keeps the real package (see next.config.mjs).
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolve(config: unknown): unknown {
  if (Array.isArray(config) && config.length <= 4 && typeof config[0] === "number") {
    return config[0];
  }
  if (!isRecord(config)) return config;

  if (config.type === "select") {
    if (config.default != null) return config.default;
    const options = config.options;
    const first = Array.isArray(options) ? options[0] : undefined;
    if (first == null) return "";
    return typeof first === "string" ? first : (first as { value?: unknown }).value ?? "";
  }
  if (config.type === "color") return config.default ?? "#000000";
  if (config.type === "text") return config.default ?? "";
  if (typeof config.type === "string") return config;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (key === "_collapsed") continue;
    result[key] = resolve(value);
  }
  return result;
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
