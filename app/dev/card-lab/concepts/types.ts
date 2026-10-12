import type { ReactNode } from "react";

/**
 * Card-lab concept contract.
 *
 * Add a new concept by creating a module that exports a ConceptDefinition,
 * then appending it to CONCEPTS in registry.ts. The shell renders every
 * entry the same way; verify discovers them from data-cl-* attributes.
 */

export type ThemeName = "light" | "dark";

/** Routing key for kind-specific verify rules. Extend as concepts land. */
export type ConceptKind =
  | "framed-inset"
  | "edge-tile"
  | "text-row"
  | "expanding-chip"
  | "pill-row"
  | "outcome-metric"
  | "status-line"
  | "brand-lockup"
  | "dual-cta"
  | "numbered-index"
  | "cursor-label"
  | "stagger-reveal"
  | "gated-nda"
  | "row-wash"
  | "attribution-fade"
  | "chevron-reveal"
  | "grayscale-color"
  | "expand-caption"
  | "refinement";

export type VariantId = "a" | "b" | "c" | string;

export type ConceptVariant = {
  id: VariantId;
  [key: string]: unknown;
};

export type RenderContext = {
  /** When true, paint the hover end state without pointer hover (?hover=all). */
  forceHover?: boolean;
  /**
   * Forced hover progress for still rows. 0 = rest, 0.5 = mid, 1 = end.
   * Brand-lockup uses 0.5 to show reveal differences in screenshots.
   */
  hoverProgress?: number;
};

export type ConceptDefinition<V extends ConceptVariant = ConceptVariant> = {
  /** Stable slug, e.g. "framed-inset". Used in data-cl-concept. */
  id: string;
  /** Kind bucket for verify + shared CSS hooks. */
  kind: ConceptKind;
  /** Short override prefix for query params, e.g. "d1" → ?d1b.p=5 */
  overrideKey: string;
  name: string;
  intent: string;
  aspect: string;
  mediaIndex: number;
  variants: readonly V[];
  /** Spec line from the same object that styles the card. */
  label: (variant: V) => string;
  applyOverrides: (variant: V, params: URLSearchParams) => V;
  /** One variant stage. Must set data-cl-card and data-cl-kind. */
  render: (variant: V, ctx?: RenderContext) => ReactNode;
};
