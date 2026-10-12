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

// Heterogeneous variant shapes — registry erases V at the boundary.
export const CONCEPTS = [
  framedInset,
  edgeTile,
  textFirstRow,
] as unknown as readonly ConceptDefinition<ConceptVariant>[];

export type { ConceptDefinition, ConceptKind, ConceptVariant } from "./types";
export { CANVAS, TEXT, TITLE, DESCRIPTION } from "./tokens";
