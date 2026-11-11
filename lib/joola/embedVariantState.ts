export type VariantLoadState = "idle" | "loading" | "ready" | "error";

export type EmbedVariantSnapshot = {
  selected: string;
  byVariant: Record<string, VariantLoadState>;
  errorAt: number | null;
};

export const EMBED_READY_TIMEOUT_MS = 8000;

export function createEmbedVariantState(
  variants: string[],
  selected: string,
): EmbedVariantSnapshot {
  const byVariant: Record<string, VariantLoadState> = {};
  for (const v of variants) {
    byVariant[v] = v === selected ? "loading" : "idle";
  }
  return { selected, byVariant, errorAt: null };
}

export function preloadVariants(state: EmbedVariantSnapshot, variants: string[]): EmbedVariantSnapshot {
  const byVariant = { ...state.byVariant };
  for (const v of variants) {
    if (byVariant[v] === "idle") byVariant[v] = "loading";
  }
  return { ...state, byVariant };
}

export function selectVariant(state: EmbedVariantSnapshot, next: string): EmbedVariantSnapshot {
  const byVariant = { ...state.byVariant };
  if (!byVariant[next]) byVariant[next] = "loading";
  else if (byVariant[next] === "idle") byVariant[next] = "loading";
  return { ...state, selected: next, byVariant };
}

export function markVariantReady(
  state: EmbedVariantSnapshot,
  variant: string,
): EmbedVariantSnapshot {
  if (state.byVariant[variant] === "ready") return state;
  return {
    ...state,
    byVariant: { ...state.byVariant, [variant]: "ready" },
    errorAt: null,
  };
}

export function markVariantTimedOut(
  state: EmbedVariantSnapshot,
  variant: string,
  now: number,
): EmbedVariantSnapshot {
  if (state.byVariant[variant] === "ready") return state;
  return {
    ...state,
    byVariant: { ...state.byVariant, [variant]: "error" },
    errorAt: now,
  };
}

export function retryVariant(state: EmbedVariantSnapshot): EmbedVariantSnapshot {
  const selected = state.selected;
  return {
    ...state,
    byVariant: { ...state.byVariant, [selected]: "loading" },
    errorAt: null,
  };
}

export function shouldShowSkeleton(state: EmbedVariantSnapshot, variant: string): boolean {
  const s = state.byVariant[variant];
  return s === "loading" || s === "error";
}
