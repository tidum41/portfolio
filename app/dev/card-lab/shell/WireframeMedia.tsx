/**
 * Back-compat shim: every former wireframe slot now renders the controlled
 * Mux poster so lab comparisons stay fair. Prefer ControlledMedia for new code.
 */
import ControlledMedia, { CONTROLLED_ASPECT } from "./ControlledMedia";
import type { WireframeKind } from "../concepts/projects";

export default function WireframeMedia({
  kind: _kind,
  aspect,
  radius,
  className,
  dimmed = false,
  play = false,
  fill = false,
  topClear = 0,
  colored: _colored = false,
  compact: _compact = false,
}: {
  kind: WireframeKind;
  aspect: string;
  radius?: number;
  className?: string;
  dimmed?: boolean;
  play?: boolean;
  fill?: boolean;
  topClear?: number;
  colored?: boolean;
  compact?: boolean;
}) {
  // Ignore per-concept aspect overrides for fairness — homepage card ratio only.
  void _kind;
  void _colored;
  void _compact;
  void aspect;
  return (
    <ControlledMedia
      aspect={CONTROLLED_ASPECT}
      radius={radius}
      className={className}
      dimmed={dimmed}
      play={play}
      fill={fill}
      topClear={topClear}
    />
  );
}
