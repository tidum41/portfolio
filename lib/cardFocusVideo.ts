/** When card focus is active, only the focused grid card may autoplay. */
export function cardFocusAllowsVideoPlay(video: HTMLVideoElement): boolean {
  if (typeof document === "undefined") return true;
  if (!document.documentElement.hasAttribute("data-card-focus")) return true;
  const card = video.closest(".portfolio-grid-card");
  return Boolean(card?.hasAttribute("data-card-focus-active"));
}
