"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMBED_READY_TIMEOUT_MS,
  createEmbedVariantState,
  markVariantReady,
  markVariantTimedOut,
  preloadVariants,
  retryVariant,
  selectVariant,
  type EmbedVariantSnapshot,
} from "./embedVariantState";
import { iframeDocLooksReady } from "./iframeReady";

export function useEmbedVariants<T extends string>({
  variants,
  selected,
  onSelect,
}: {
  variants: T[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  const [state, setState] = useState<EmbedVariantSnapshot>(() =>
    preloadVariants(createEmbedVariantState(variants, selected), variants),
  );
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setState((prev) => selectVariant(prev, selected));
  }, [selected]);

  useEffect(() => {
    setState((prev) => preloadVariants(prev, variants));
  }, [variants.join(",")]);

  const clearTimer = useCallback((variant: string) => {
    if (timers.current[variant]) {
      clearTimeout(timers.current[variant]);
      delete timers.current[variant];
    }
  }, []);

  const armTimeout = useCallback((variant: string) => {
    clearTimer(variant);
    timers.current[variant] = setTimeout(() => {
      setState((prev) => markVariantTimedOut(prev, variant, Date.now()));
    }, EMBED_READY_TIMEOUT_MS);
  }, [clearTimer]);

  const markReady = useCallback(
    (variant: string) => {
      setState((prev) => markVariantReady(prev, variant));
      clearTimer(variant);
    },
    [clearTimer],
  );

  const onIframeLoad = useCallback(
    (variant: string, iframe: HTMLIFrameElement | null) => {
      if (!iframe) return;
      armTimeout(variant);
      try {
        if (iframeDocLooksReady(iframe.contentDocument)) {
          markReady(variant);
          return;
        }
      } catch {
        /* cross-origin guard */
      }
      requestAnimationFrame(() => {
        try {
          if (iframeDocLooksReady(iframe.contentDocument)) markReady(variant);
        } catch {
          /* ignore */
        }
      });
    },
    [armTimeout, markReady],
  );

  const onEmbedMessage = useCallback(
    (variant: string, data: unknown) => {
      if (typeof data !== "object" || !data || !("type" in data)) return;
      const type = (data as { type: string }).type;
      if (type === "joola-embed-ready" || type === "joola-embed-size") {
        markReady(variant);
      }
    },
    [markReady],
  );

  const retry = useCallback(() => {
    setState((prev) => retryVariant(prev));
    armTimeout(selected);
  }, [armTimeout, selected]);

  const pick = useCallback(
    (v: T) => {
      onSelect(v);
      setState((prev) => selectVariant(prev, v));
      if (state.byVariant[v] !== "ready") armTimeout(v);
    },
    [armTimeout, onSelect, state.byVariant],
  );

  useEffect(() => {
    return () => {
      for (const t of Object.values(timers.current)) clearTimeout(t);
    };
  }, []);

  return { state, onIframeLoad, onEmbedMessage, retry, pick };
}
