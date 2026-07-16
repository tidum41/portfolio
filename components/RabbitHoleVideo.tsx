"use client";

import type { ComponentType } from "react";
import { useEffect, useLayoutEffect as _useLayoutEffect, useRef } from "react";
import { useDialKit } from "dialkit";
import { FRAME_RECTS, FRAME_VIEWBOX, type RabbitFrame } from "./rabbitSpriteData";

const useSyncEffect =
    typeof window !== "undefined" ? _useLayoutEffect : useEffect;

const PLAYBACK_ID = "Bnxef00RI4GizGZ028BWXYJtW00x554PmovqLgVZYrphiU";
const TARGET = "rabbit holes";

// Widest frame's aspect ratio — used to reserve enough room for the hop
// corridor so the sprite can never overflow the viewport at any breakpoint,
// regardless of which pose happens to be showing at the far edge.
const MAX_FRAME_ASPECT = Math.max(...FRAME_VIEWBOX.map(([w, h]) => w / h));
const VIEWPORT_MARGIN = 16;

function ensureMuxLoaded(): void {
    const id = "mux-player-script";
    if (
        document.getElementById(id) ||
        (window as any).customElements?.get("mux-player")
    )
        return;
    const s = document.createElement("script");
    s.id = id;
    s.type = "module";
    s.src = "https://cdn.jsdelivr.net/npm/@mux/mux-player@3/dist/mux-player.mjs";
    document.head.appendChild(s);
}

function createRabbitSprite(): SVGSVGElement {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg") as SVGSVGElement;
    svg.setAttribute("fill", "none");
    svg.setAttribute("xmlns", NS);
    svg.id = "rh-rabbit";
    // display:block + opacity:0 — fades in after DOM settles to avoid flash
    svg.style.cssText = `
        display: block; height: 1.15em; width: auto;
        color: inherit; pointer-events: none; opacity: 0;
    `;
    setSpriteFrame(svg, 0);
    return svg;
}

function setSpriteFrame(svg: SVGSVGElement, frame: RabbitFrame): void {
    const NS = "http://www.w3.org/2000/svg";
    const [w, h] = FRAME_VIEWBOX[frame];
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const frag = document.createDocumentFragment();
    for (const [x, y, rw, rh] of FRAME_RECTS[frame]) {
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", String(rw));
        rect.setAttribute("height", String(rh));
        rect.setAttribute("fill", "currentColor");
        frag.appendChild(rect);
    }
    svg.appendChild(frag);
}

// Cycles the sprite through its 4-pose hop loop by swapping frames on an
// interval, translating a step in the current direction on every swap so it
// reads as hopping forward in a line — then bounces (flips via scaleX) once
// it reaches `getMaxTravel()`, patrols back, and so on. `getFrameMs` and
// `getHopDist` are read fresh on every tick so live DialKit changes take
// effect immediately. `getMaxTravel` is supplied by the caller (rather than
// measured here) so it can stay resize-aware and guarantee the sprite never
// travels past the viewport edge at any breakpoint. `onFrame` fires after
// each swap so callers can resync anything sized off the corridor.
function createHopAnimator(
    svg: SVGSVGElement,
    getFrameMs: () => number,
    getHopDist: () => number,
    getMaxTravel: () => number,
    onFrame?: (frame: RabbitFrame, translateX: number, direction: 1 | -1) => void,
) {
    let frame: RabbitFrame = 0;
    let translateX = 0;
    let direction: 1 | -1 = 1;
    let intervalId = 0;
    let running = false;

    function render() {
        svg.style.transform = `translateX(${translateX.toFixed(1)}px) scaleX(${direction})`;
    }

    function apply(f: RabbitFrame) {
        frame = f;
        setSpriteFrame(svg, f);

        const maxTravel = Math.max(0, getMaxTravel());
        let next = translateX + direction * getHopDist();
        if (next >= maxTravel) {
            direction = -1;
            next = maxTravel;
        } else if (next <= 0) {
            direction = 1;
            next = 0;
        }
        translateX = next;

        render();
        onFrame?.(f, translateX, direction);
    }

    function tick() {
        apply(((frame + 1) % 4) as RabbitFrame);
    }

    function start() {
        if (running) return;
        running = true;
        intervalId = window.setInterval(tick, getFrameMs());
    }
    function stop() {
        running = false;
        clearInterval(intervalId);
        frame = 0;
        translateX = 0;
        direction = 1;
        setSpriteFrame(svg, 0);
        render();
        onFrame?.(0, 0, 1);
    }
    function pause() {
        if (!running) return;
        clearInterval(intervalId);
    }
    function resume() {
        if (!running) return;
        intervalId = window.setInterval(tick, getFrameMs());
    }
    // Reclamps the current position within a freshly recomputed max travel
    // (called on resize) without touching frame/direction/timers.
    function resync() {
        const maxTravel = Math.max(0, getMaxTravel());
        translateX = Math.min(translateX, maxTravel);
        render();
    }
    return { start, stop, pause, resume, resync };
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function findAndWrap(node: Node): HTMLElement | null {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const idx = text.toLowerCase().indexOf(TARGET);
        if (idx === -1 || document.getElementById("rh-trigger")) return null;

        const before = document.createTextNode(text.slice(0, idx));

        const trigger = document.createElement("span");
        trigger.id = "rh-trigger";
        trigger.style.cssText = `
            color: inherit;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
            text-decoration-color: inherit;
            cursor: crosshair;
            white-space: nowrap;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
        `;

        const splitAt = TARGET.lastIndexOf(" ") + 1;
        trigger.appendChild(document.createTextNode(TARGET.slice(0, splitAt)));

        const holesAnchor = document.createElement("span");
        holesAnchor.id = "rh-holes-anchor";
        holesAnchor.textContent = TARGET.slice(splitAt);
        holesAnchor.style.cssText = `
            color: inherit;
            position: relative;
            display: inline-block;
            vertical-align: baseline;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
            text-decoration-color: inherit;
            transition: color 0.2s ease, text-decoration-color 0.2s ease;
        `;
        trigger.appendChild(holesAnchor);

        const after = document.createTextNode(text.slice(idx + TARGET.length));

        node.parentNode?.insertBefore(before, node);
        node.parentNode?.insertBefore(trigger, node);
        node.parentNode?.insertBefore(after, node);
        node.parentNode?.removeChild(node);

        return holesAnchor;
    }
    for (const child of Array.from(node.childNodes)) {
        const result = findAndWrap(child);
        if (result) return result;
    }
    return null;
}

function injectRabbit(holesAnchor: HTMLElement): void {
    if (document.getElementById("rh-rabbit")) return;
    const rabbit = createRabbitSprite();

    const container = document.createElement("span");
    container.id = "rh-rabbit-container";
    container.style.cssText = `
        position: absolute;
        left: calc(100% + 0.3em);
        top: 50%;
        transform: translateY(-50%);
        overflow: visible;
        pointer-events: none;
        z-index: 1;
    `;
    container.appendChild(rabbit);
    holesAnchor.appendChild(container);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RabbitHoleVideo(Component: ComponentType): ComponentType {
    return (props: any) => {
        const wrapRef = useRef<HTMLDivElement>(null);

        const dk = useDialKit("Rabbit Sprite", {
            frameMs: [140, 40, 400, 5],
            hopDist: [22, 4, 80, 1],
        });
        const frameMsRef = useRef(dk.frameMs);
        const hopDistRef = useRef(dk.hopDist);
        useEffect(() => {
            frameMsRef.current = dk.frameMs;
            hopDistRef.current = dk.hopDist;
        }, [dk.frameMs, dk.hopDist]);

        useSyncEffect(() => {
            const root = wrapRef.current;
            if (!root) return;

            ensureMuxLoaded();

            // The whole feature is built by hand-mutating the DOM (splitting the
            // text node, injecting the SVG, wiring listeners) — none of it is
            // visible to React's virtual DOM. If anything causes this subtree to
            // re-render (e.g. a theme toggle rippling through the tree), React
            // reconciles against what it thinks is still a plain text node and
            // stomps our injected spans back to plain text — the feature just
            // silently disappears, since this effect only runs once on mount.
            // A MutationObserver below detects that and re-runs setup() to heal it.
            type Teardown = (() => void) | null;
            let teardown: Teardown = null;

            const setup = (): Teardown => {
            const textEl =
                root.querySelector<HTMLElement>("h1, h2, h3, h4, p") ??
                (root.firstElementChild as HTMLElement) ??
                root;

            const mobileQuery = window.matchMedia("(hover: none)");
            const isMobile = () => mobileQuery.matches;

            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            let isOpen = false, isPaused = false;
            let overTrigger = false, overRabbit = false;
            let resizeCleanup: (() => void) | null = null;
            let hopper: ReturnType<typeof createHopAnimator> | null = null;

            // Remove a stale rh-trigger left in the DOM by an exiting page instance
            // (AnimatePresence keeps the old page mounted during its exit animation)
            const stale = document.getElementById("rh-trigger");
            if (stale && !root.contains(stale)) {
                stale.parentNode?.insertBefore(document.createTextNode(TARGET), stale);
                stale.remove();
            }

            const holesAnchor = findAndWrap(textEl);
            if (!holesAnchor) return null;

            injectRabbit(holesAnchor);
            const svg = document.getElementById("rh-rabbit") as SVGSVGElement | null;
            let hoverZone: HTMLSpanElement | null = null;

            if (svg) {
                const wrapper = document.createElement("span");
                wrapper.id = "rh-rabbit-wrapper";
                wrapper.style.cssText = `position:relative;display:inline-block;pointer-events:none;`;
                svg.parentNode?.insertBefore(wrapper, svg);
                wrapper.appendChild(svg);

                // CSS transforms don't affect the parent's layout box, so
                // wrapper's own rect stays the sprite's static (untransformed)
                // origin no matter how far the svg has translated inside it.
                // Desktop: patrol at most half the viewport width. Mobile:
                // keep going all the way to the screen edge, then bounce.
                let maxTravel = 0;
                const recomputeMaxTravel = () => {
                    const spriteHeight = svg.getBoundingClientRect().height;
                    const staticLeft = wrapper.getBoundingClientRect().left;
                    const maxFrameWidthPx = spriteHeight * MAX_FRAME_ASPECT;
                    const edgeTravel = Math.max(
                        0,
                        window.innerWidth - staticLeft - maxFrameWidthPx - VIEWPORT_MARGIN,
                    );
                    maxTravel = isMobile()
                        ? edgeTravel
                        : Math.min(edgeTravel, window.innerWidth * 0.5);
                };

                const syncHoverZoneWidth = () => {
                    if (!hoverZone) return;
                    const spriteHeight = svg.getBoundingClientRect().height;
                    const maxFrameWidthPx = spriteHeight * MAX_FRAME_ASPECT;
                    hoverZone.style.width = `${maxTravel + maxFrameWidthPx + 24}px`;
                };

                recomputeMaxTravel();

                hopper = createHopAnimator(
                    svg,
                    () => frameMsRef.current,
                    () => hopDistRef.current,
                    () => maxTravel,
                );

                hoverZone = document.createElement("span");
                hoverZone.id = "rh-hover-zone";
                hoverZone.style.cssText = `
                    position: absolute; left: 0; top: -0.5em;
                    bottom: -0.5em;
                    pointer-events: all; cursor: crosshair;
                `;
                wrapper.appendChild(hoverZone);
                syncHoverZoneWidth();

                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        svg.style.transition = "opacity 0.15s ease";
                        svg.style.opacity = "1";
                        recomputeMaxTravel();
                        syncHoverZoneWidth();
                    })
                );

                hoverZone.addEventListener("mouseenter", () => {
                    overRabbit = true;
                    if (!isMobile()) open();
                });
                hoverZone.addEventListener("mouseleave", () => {
                    overRabbit = false;
                    if (!isMobile()) maybeClose();
                });
                hoverZone.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!isMobile()) togglePause();
                    else isOpen ? close() : open();
                });

                let resizeRaf = 0;
                const onResize = () => {
                    cancelAnimationFrame(resizeRaf);
                    resizeRaf = requestAnimationFrame(() => {
                        recomputeMaxTravel();
                        hopper?.resync();
                        syncHoverZoneWidth();
                    });
                };
                window.addEventListener("resize", onResize, { passive: true });
                resizeCleanup = () => {
                    cancelAnimationFrame(resizeRaf);
                    window.removeEventListener("resize", onResize);
                };
            }

            const trigger = document.getElementById("rh-trigger")!;

            const win = document.createElement("div");
            win.style.cssText = `
                position: fixed; z-index: 99999; pointer-events: none;
                opacity: 0; left: -9999px; top: -9999px;
                transform: scale(0.96);
                transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34,1.2,0.64,1);
                width: 360px; aspect-ratio: 16/9;
                border-radius: 3px; overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12); background: #000;
            `;
            document.body.appendChild(win);

            let playerMounted = false, player: any = null;

            function mountPlayer() {
                if (playerMounted) return;
                playerMounted = true;
                player = document.createElement("mux-player");
                player.setAttribute("playback-id", PLAYBACK_ID);
                player.setAttribute("preload", "auto");
                player.setAttribute("autoplay", "muted");
                player.setAttribute("loop", "");
                player.setAttribute("muted", "");
                player.setAttribute("no-controls", "");
                player.style.cssText = `
                    position: absolute; top: 50%; left: 50%;
                    width: 104%; height: 104%;
                    transform: translate(-50%, -50%);
                    display: block; pointer-events: none;
                    --controls: none; --media-object-fit: cover;
                    --media-object-position: center;
                `;
                win.appendChild(player);
                requestAnimationFrame(() => {
                    player.muted = true;
                    player.volume = 0;
                    player.play?.().catch(() => {});
                });
            }

            function position() {
                const rect = trigger.getBoundingClientRect();
                const vw = window.innerWidth;
                const popW = Math.min(360, Math.max(240, vw * 0.85));
                const popH = Math.round((popW * 9) / 16);
                const ideal = rect.left + rect.width / 2 - popW / 2;
                const left = Math.max(12, Math.min(ideal, vw - popW - 12));
                const isAbove = rect.top > popH + 24;
                const top = isAbove ? rect.top - popH - 16 : rect.bottom + 8;
                win.style.width = `${popW}px`;
                win.style.left = `${left}px`;
                win.style.top = `${top}px`;
                // Scale from the edge nearest the trigger word so the popup
                // feels spatially anchored to where it came from.
                win.style.transformOrigin = isAbove ? "bottom center" : "top center";
            }

            function open() {
                mountPlayer();
                position();
                isOpen = true;
                isPaused = false;
                win.style.pointerEvents = "none";
                win.style.opacity = "1";
                win.style.transform = "scale(1)";
                player?.play?.().catch(() => {});
                if (!reducedMotion) hopper?.start();
            }
            function close() {
                isOpen = false;
                isPaused = false;
                win.style.opacity = "0";
                win.style.transform = "scale(0.96)";
                player?.pause?.();
                hopper?.stop();
            }
            function togglePause() {
                if (!isOpen) return;
                isPaused = !isPaused;
                if (isPaused) {
                    player?.pause?.();
                    hopper?.pause();
                } else {
                    player?.play?.().catch(() => {});
                    hopper?.resume();
                }
            }
            const maybeClose = () => { if (!overTrigger && !overRabbit) close(); };

            trigger.addEventListener("mouseenter", () => {
                overTrigger = true;
                if (!isMobile()) open();
            });
            trigger.addEventListener("mouseleave", () => {
                overTrigger = false;
                if (!isMobile()) maybeClose();
            });
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!isMobile()) togglePause();
                else isOpen ? close() : open();
            });

            // Mobile: tap outside the trigger/rabbit closes the popup. The
            // synthetic click that follows would also hit PS3Silk's
            // click-to-cycle handler (hero is under the tap), so swallow the
            // next window click in capture phase after a dismiss.
            function swallowNextClick() {
                const swallow = (ev: Event) => {
                    ev.stopPropagation();
                    window.removeEventListener("click", swallow, true);
                };
                window.addEventListener("click", swallow, true);
                // Safety: drop the listener if no click arrives (e.g. touch
                // cancel) so we never permanently block PS3 cycling.
                window.setTimeout(() => {
                    window.removeEventListener("click", swallow, true);
                }, 500);
            }

            function onDocTap(e: MouseEvent | TouchEvent) {
                if (!isOpen || !isMobile()) return;
                const t = e.target as Node;
                if (
                    win.contains(t) ||
                    trigger.contains(t) ||
                    hoverZone?.contains(t)
                ) {
                    return;
                }
                close();
                // Only swallow the follow-up click when the tap is on inert
                // chrome (hero / wave). Taps on links/buttons still close the
                // popup but must keep their own click so navigation works.
                const el = e.target as Element | null;
                if (!el?.closest?.("a, button, [role='button']")) {
                    swallowNextClick();
                }
            }
            document.addEventListener("mousedown", onDocTap, { passive: true });
            document.addEventListener("touchstart", onDocTap, { passive: true });

            return () => {
                resizeCleanup?.();
                hopper?.stop();
                document.removeEventListener("mousedown", onDocTap);
                document.removeEventListener("touchstart", onDocTap);
                win.remove();
                // Undo the DOM wrapping so StrictMode re-mount and navigation work correctly
                if (trigger?.parentNode) {
                    trigger.parentNode.insertBefore(document.createTextNode(TARGET), trigger);
                    trigger.parentNode.removeChild(trigger);
                }
            };
            };

            teardown = setup();

            // Self-heal: if #rh-trigger ever goes missing while this component is
            // still mounted (React reconciliation wiped it), tear down whatever's
            // left and set back up. The idempotent guards in setup()/injectRabbit
            // make this safe to also fire (as a no-op) from setup()'s own mutations.
            const observer = new MutationObserver(() => {
                if (document.getElementById("rh-trigger")) return;
                teardown?.();
                teardown = setup();
            });
            observer.observe(root, { childList: true, subtree: true });

            return () => {
                observer.disconnect();
                teardown?.();
            };
        }, []);

        return (
            <div ref={wrapRef} style={{ display: "contents" }}>
                <Component {...props} />
            </div>
        );
    };
}
