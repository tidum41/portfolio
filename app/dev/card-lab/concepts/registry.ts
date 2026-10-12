/**
 * Concept registry — refinements first (homepage-adjacent), then craft concepts.
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
import { refinementType } from "../refinements/type";
import { refinementColour } from "../refinements/colour";
import { refinementChips } from "../refinements/chips";
import { refinementSpacing } from "../refinements/spacing";
import { refinementHover } from "../refinements/hover";

export const CONCEPTS = [
  refinementType,
  refinementColour,
  refinementChips,
  refinementSpacing,
  refinementHover,
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
