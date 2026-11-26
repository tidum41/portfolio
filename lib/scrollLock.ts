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
  htmlOverflowY: string;
  htmlScrollbarGutter: string;
};

let count = 0;
let saved: Saved | null = null;

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  count += 1;
  if (count > 1) return;
  const body = document.body;
  const y = window.scrollY;
  const html = document.documentElement;
  saved = {
    y,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    htmlOverflowY: html.style.overflowY,
    htmlScrollbarGutter: html.style.scrollbarGutter,
  };
  body.style.position = "fixed";
  body.style.top = `-${y}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  // The page behind is hidden, so drop the (disabled) scrollbar track too: a full-screen
  // overlay should not leave a grey strip down the right edge on classic-scrollbar browsers.
  html.style.overflowY = "hidden";
  html.style.scrollbarGutter = "auto";
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
  document.documentElement.style.overflowY = s.htmlOverflowY;
  document.documentElement.style.scrollbarGutter = s.htmlScrollbarGutter;
  // `html { scroll-behavior: smooth }` would animate this restore; it must be instant.
  window.scrollTo({ top: s.y, left: 0, behavior: "instant" });
}
