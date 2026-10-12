/**
 * Legacy placeholder API — now the controlled Mux poster for fair comparison.
 */
import ControlledMedia, { CONTROLLED_ASPECT } from "./ControlledMedia";

export default function PlaceholderMedia({
  aspect: _aspect,
  mediaIndex: _mediaIndex,
  radius,
  className,
}: {
  aspect: string;
  mediaIndex: number;
  radius?: number;
  className?: string;
}) {
  void _aspect;
  void _mediaIndex;
  return (
    <ControlledMedia
      aspect={CONTROLLED_ASPECT}
      radius={radius}
      className={className}
    />
  );
}
