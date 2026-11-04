"use client";

import type { CSSProperties } from "react";

/**
 * Tiny centered halftone square loader — language borrowed from
 * GlobalCustomCursor's XMB trail: hard squares (border-radius: 0), flat
 * ink (#595959 / #EFEFEF), opacity variance. Compositor-only ripple.
 *
 * `visible` gates the 150ms delay (no flash on fast loads). `fading`
 * plays the exit opacity. Reduced-motion freezes the wave.
 */
export default function AllinoneHalftoneLoader({
  visible = false,
  fading = false,
}: {
  visible?: boolean;
  fading?: boolean;
}) {
  if (!visible && !fading) return null;

  // 4×4 = 16 cells; ~3.5px squares + 2px gap ≈ 22px footprint.
  const cells = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div
      className="aio-ht-loader"
      data-visible={visible ? "true" : "false"}
      data-fading={fading ? "true" : "false"}
      aria-hidden
    >
      <div className="aio-ht-loader-grid" role="presentation">
        {cells.map((i) => (
          <span
            key={i}
            className="aio-ht-loader-cell"
            style={{ "--aio-ht-i": i } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
