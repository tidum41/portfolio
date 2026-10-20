export type DialogueImageSize = { width: number; height: number };

export const DIALOGUE_CANVAS_DISPLAY_WIDTH = 600;

export function scaledDisplaySize(
  natural: DialogueImageSize,
  targetWidth = DIALOGUE_CANVAS_DISPLAY_WIDTH,
): { w: number; h: number } {
  const scale = targetWidth / natural.width;
  return {
    w: targetWidth,
    h: Math.round(natural.height * scale),
  };
}
