/**
 * Shared phone chrome geometry for PhoneEmbed + PhonePoster.
 * Keep insets/radius identical so light/dark frame swaps never shift the
 * screen cutout or clip HabitTrackerApp's corner radii differently.
 */
export const PHONE_REF_W = 344;
export const PHONE_REF_H = 614;
export const PHONE_W_BASE = 280;
export const PHONE_H_BASE = 580;
export const PHONE_CONTENT_W = 394;

/** DialKit defaults — both poster and live embed must use the same key/values. */
export const PHONE_DIAL_DEFAULTS = {
  sizeScale: [1.4, 0.5, 2.5, 0.05] as [number, number, number, number],
  insetTop: [3.07, 0, 15, 0.01] as [number, number, number, number],
  insetBottom: [3.64, 0, 15, 0.01] as [number, number, number, number],
  insetSide: [3.3, 0, 15, 0.01] as [number, number, number, number],
  screenRadius: [12.86, 0, 25, 0.01] as [number, number, number, number],
  iframeOffsetX: [0, -10, 10, 0.01] as [number, number, number, number],
  iframeOffsetY: [-0.41, -10, 10, 0.01] as [number, number, number, number],
};

export function phoneScreenMetrics(
  phoneW: number,
  phoneH: number,
  insetTop: number,
  insetBottom: number,
  insetSide: number,
  screenRadiusPct: number,
) {
  const screenLocalW = phoneW * (1 - (insetSide * 2) / 100);
  const screenLocalH = phoneH * (1 - insetTop / 100 - insetBottom / 100);
  // Explicit px radius (not %) so corners stay circular/stable when the
  // cutout aspect isn't square — % border-radius was reading differently
  // against light vs dark frame swaps.
  const screenRadiusPx = Math.min(screenLocalW, screenLocalH) * (screenRadiusPct / 100);
  const contentH = Math.ceil(PHONE_CONTENT_W * (screenLocalH / screenLocalW));
  const contentScale = screenLocalW / PHONE_CONTENT_W;
  return { screenLocalW, screenLocalH, screenRadiusPx, contentH, contentScale };
}
