const CHAT_W = 448;
const TEXT_FLOOR = 11 / 12;
const SCENE_W = 1280;

export function placementScaleForWidth(w: number, phone: boolean) {
  const fitChat = w / CHAT_W;
  if (!phone) return Math.min(1, Math.max(0.94, fitChat));
  return Math.min(1, Math.max(TEXT_FLOOR, fitChat));
}

export function placementChatAnchorX(
  w: number,
  sceneW: number,
  phone: boolean,
  next: number,
  chatEl: HTMLElement | null,
) {
  if (!phone) return Math.min(0, w - sceneW);
  if (!chatEl) return -(SCENE_W - CHAT_W) * next;
  return -chatEl.offsetLeft * next;
}

/** Narrow the docked/floating chat panel in scene px so scaled width matches the frame (phone only). */
export function placementFitChatWidth(layer: HTMLElement, w: number, phone: boolean, next: number) {
  const chat = layer.querySelector<HTMLElement>('[data-placement-chat="true"]');
  if (!chat) return;
  if (phone) {
    chat.style.width = `${Math.floor(w / next)}px`;
  } else {
    chat.style.width = `${CHAT_W}px`;
  }
}
