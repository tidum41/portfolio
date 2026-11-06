"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { TOOLTIP_STYLE } from "./DialogueCardTap";

export interface GridHoverPillProps {
gridSelector?: string;
labels?: Record<string, string>;
}

const OFFSET = 12;
const VIEWPORT_PAD = 8;
const SHOW_DELAY_MS = 400;
const WARM_MS = 300;
const FADE_MS = 100;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Static grid tooltip, one shared portal element for the whole grid.

Entering a card records the entry point and label once and starts a
400ms delay; moves inside the same card after that do nothing, so
the tooltip is placed once at entry + 12px, clamped inside both the
card and the viewport, and never moves again until the card is left.
Show is a 100ms opacity fade-in; hide is immediate with no fade-out.
If a tooltip was showing and another card is entered within 300ms
of it hiding, that tooltip shows instantly with no delay. Fine
pointers only. Hides on card change, grid pointerleave, window
scroll, window blur, and visibility change. Keyboard focus-visible
anchors it at the card's bottom-left and shows it without delay. */
export default function GridHoverPill({
gridSelector = ".portfolio-grid",
labels = {},
}: GridHoverPillProps) {
const pillRef = useRef<HTMLDivElement | null>(null);
const labelsRef = useRef(labels);
const mounted = useSyncExternalStore(
emptySubscribe,
getClientSnapshot,
getServerSnapshot,
);

useEffect(() => {
labelsRef.current = labels;
});

useEffect(() => {
if (!mounted) return;

const pill = pillRef.current;
const grid = document.querySelector<HTMLElement>(gridSelector);
if (!pill || !grid) return;


const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");


let enabled = hoverMq.matches;
let visible = false;
let currentCard: HTMLElement | null = null;
let entryX = 0;
let entryY = 0;
let anchor: "pointer" | "card" = "pointer";
let showTimer = 0;
let lastShownHideAt = Number.NEGATIVE_INFINITY;


const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));


const clearShowTimer = () => {
  if (!showTimer) return;
  window.clearTimeout(showTimer);
  showTimer = 0;
};


const hide = () => {
  clearShowTimer();
  if (visible) lastShownHideAt = performance.now();
  visible = false;
  currentCard = null;
  pill.style.transition = "none";
  pill.style.opacity = "0";
};


const cardFromTarget = (target: EventTarget | null) =>
  target instanceof Element
    ? target.closest<HTMLElement>(".portfolio-grid-card")
    : null;


const idForCard = (card: HTMLElement | null) => {
  const id = card?.getAttribute("data-grid-card");
  return id && id in labelsRef.current ? id : null;
};


const setLabelForId = (id: string) => {
  const label = labelsRef.current[id];
  if (label == null) return false;
  pill.textContent = label;
  return true;
};


const show = () => {
  showTimer = 0;
  const card = currentCard;
  if (!card || visible) return;
  const w = pill.offsetWidth;
  const h = pill.offsetHeight;
  const rect = card.getBoundingClientRect();
  let desiredLeft = entryX + OFFSET;
  let desiredTop = entryY + OFFSET;
  if (anchor === "card") {
    desiredLeft = rect.left + OFFSET;
    desiredTop = rect.bottom - h - OFFSET;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vMinLeft = VIEWPORT_PAD;
  const vMaxLeft = vw - w - VIEWPORT_PAD;
  const vMinTop = VIEWPORT_PAD;
  const vMaxTop = vh - h - VIEWPORT_PAD;
  const minLeft = Math.max(vMinLeft, rect.left);
  const maxLeft = Math.min(vMaxLeft, rect.right - w);
  const minTop = Math.max(vMinTop, rect.top);
  const maxTop = Math.min(vMaxTop, rect.bottom - h);
  const left =
    minLeft <= maxLeft
      ? clamp(desiredLeft, minLeft, maxLeft)
      : clamp(desiredLeft, vMinLeft, vMaxLeft);
  const top =
    minTop <= maxTop
      ? clamp(desiredTop, minTop, maxTop)
      : clamp(desiredTop, vMinTop, vMaxTop);
  pill.style.left = `${left}px`;
  pill.style.top = `${top}px`;
  pill.style.transition = motionMq.matches
    ? "none"
    : `opacity ${FADE_MS}ms ease-out`;
  pill.style.opacity = "1";
  visible = true;
};


const onPointerMove = (event: PointerEvent) => {
  if (!enabled || event.pointerType !== "mouse") return;
  let card: HTMLElement | null;
  if (
    currentCard &&
    event.target instanceof Node &&
    currentCard.contains(event.target)
  ) {
    card = currentCard;
  } else {
    card = cardFromTarget(event.target);
  }
  const id = idForCard(card);
  if (!card || !id) {
    hide();
    return;
  }
  if (card === currentCard) return;
  hide();
  if (!setLabelForId(id)) return;
  currentCard = card;
  anchor = "pointer";
  entryX = event.clientX;
  entryY = event.clientY;
  if (performance.now() - lastShownHideAt <= WARM_MS) {
    show();
  } else {
    const scheduledCard = card;
    showTimer = window.setTimeout(() => {
      if (currentCard === scheduledCard) show();
    }, SHOW_DELAY_MS);
  }
};


const onFocusIn = (event: FocusEvent) => {
  if (!enabled || !(event.target instanceof Element)) return;
  const card = cardFromTarget(event.target);
  const id = idForCard(card);
  let focusVisible = true;
  try {
    focusVisible = event.target.matches(":focus-visible");
  } catch {
    focusVisible = true;
  }
  if (!card || !id || !focusVisible) {
    hide();
    return;
  }
  hide();
  if (!setLabelForId(id)) return;
  currentCard = card;
  anchor = "card";
  show();
};


const onFocusOut = (event: FocusEvent) => {
  const card = cardFromTarget(event.target);
  const next = event.relatedTarget;
  if (card && next instanceof Node && card.contains(next)) return;
  hide();
};


const onPointerLeave = () => hide();
const onBlur = () => hide();
const onScroll = () => hide();
const onVisibilityChange = () => {
  if (document.hidden) hide();
};
const onHoverMqChange = (event: MediaQueryListEvent) => {
  enabled = event.matches;
  if (!enabled) hide();
};


grid.addEventListener("pointermove", onPointerMove);
grid.addEventListener("pointerleave", onPointerLeave);
grid.addEventListener("focusin", onFocusIn);
grid.addEventListener("focusout", onFocusOut);
window.addEventListener("blur", onBlur);
window.addEventListener("scroll", onScroll, true);
document.addEventListener("visibilitychange", onVisibilityChange);
hoverMq.addEventListener("change", onHoverMqChange);


return () => {
  clearShowTimer();
  grid.removeEventListener("pointermove", onPointerMove);
  grid.removeEventListener("pointerleave", onPointerLeave);
  grid.removeEventListener("focusin", onFocusIn);
  grid.removeEventListener("focusout", onFocusOut);
  window.removeEventListener("blur", onBlur);
  window.removeEventListener("scroll", onScroll, true);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  hoverMq.removeEventListener("change", onHoverMqChange);
};

}, [mounted, gridSelector]);

if (!mounted) return null;

return createPortal(
<div
ref={pillRef}
data-grid-hover-pill=""
aria-hidden="true"
style={{
...TOOLTIP_STYLE,
position: "fixed",
left: 0,
top: 0,
zIndex: 60,
boxSizing: "border-box",
contain: "layout paint style",
pointerEvents: "none",
opacity: 0,
}}
/>,
document.body,
);
}
