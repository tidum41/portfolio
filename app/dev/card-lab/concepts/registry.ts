/**
 * Concept registry — single source of which card ideas the lab shows.
 *
 * To add a concept later:
 *   1. Create concepts/<slug>.tsx exporting a ConceptDefinition
 *   2. Append it to CONCEPTS below
 *   3. Add kind-specific CSS if needed
 *   4. Extend verify only when the kind needs new rules
 *      (generic checks already cover every registered concept)
 */

import type { ConceptDefinition, ConceptVariant } from "./types";
import { framedInset } from "./framed-inset";
import { edgeTile } from "./edge-tile";
import { textFirstRow } from "./text-first-row";
import { expandingChip } from "./expanding-chip";
import { pillRow } from "./pill-row";
import { outcomeMetric } from "./outcome-metric";
import { statusLine } from "./status-line";
import { brandLockup } from "./brand-lockup";
import { dualCta } from "./dual-cta";
import { numberedIndex } from "./numbered-index";
import { cursorLabel } from "./cursor-label";
import { staggerReveal } from "./stagger-reveal";
import { gatedNda } from "./gated-nda";
import { rowWash } from "./row-wash";
import { attributionFade } from "./attribution-fade";
import { chevronReveal } from "./chevron-reveal";
import { grayscaleColor } from "./grayscale-color";
import { expandCaption } from "./expand-caption";

// Heterogeneous variant shapes — registry erases V at the boundary.
export const CONCEPTS = [
  framedInset,
  edgeTile,
  textFirstRow,
  expandingChip,
  pillRow,
  outcomeMetric,
  statusLine,
  brandLockup,
  dualCta,
  numberedIndex,
  cursorLabel,
  staggerReveal,
  gatedNda,
  rowWash,
  attributionFade,
  chevronReveal,
  grayscaleColor,
  expandCaption,
] as unknown as readonly ConceptDefinition<ConceptVariant>[];

export type { ConceptDefinition, ConceptKind, ConceptVariant } from "./types";
export { CANVAS, TEXT, TITLE, DESCRIPTION } from "./tokens";
