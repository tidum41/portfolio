// Shared body scroll lock for full-screen overlays (lightbox now; popups may adopt it).
// `overflow: hidden` on <body> does not stop iOS Safari from scrolling the page behind an
// overlay, and closing then drops the reader somewhere else. Pinning the body with
// `position: fixed; top: -scrollY` freezes the page in place on every engine; unlocking
// restores the exact offset. Ref-counted so stacked overlays do not unlock each other.

type Saved = {
  y: number;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  paddingRight: string;
};

let count = 0;
let saved: Saved | null = null;

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  count += 1;
  if (count > 1) return;
  const body = document.body;
  const y = window.scrollY;
  // Pinning the body removes a classic scrollbar; pad it back so the page does not shift.
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  saved = {
    y,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };
  body.style.position = "fixed";
  body.style.top = `-${y}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll(): void {
  if (typeof document === "undefined" || count === 0) return;
  count -= 1;
  if (count > 0 || !saved) return;
  const body = document.body;
  const s = saved;
  saved = null;
  body.style.position = s.position;
  body.style.top = s.top;
  body.style.left = s.left;
  body.style.right = s.right;
  body.style.width = s.width;
  body.style.paddingRight = s.paddingRight;
  // `html { scroll-behavior: smooth }` would animate this restore; it must be instant.
  window.scrollTo({ top: s.y, left: 0, behavior: "instant" });
}
