/**
 * Inline boot guard, injected into the SSR HTML by BootScripts so it runs before
 * any bundle downloads or React hydrates. ES5 on purpose.
 *
 * It reads exactly what the dim CSS reads (html[data-card-focus] and the card's
 * [data-card-focus-active]). If a card is dimmed, a video inside it cannot play:
 * media events are caught at document capture and the video is paused at once.
 * play/playing cover starts; timeupdate/canplay/loadeddata cover a video that got
 * going by any route that did not raise play (engine quirks, internal resume).
 * Paused videos are remembered in window.__cfPaused, which lib/cardFocusVideo.ts
 * adopts as `pausedByFocus` so the controller can resume exactly those on neutral.
 * window.__cfGuard makes installation idempotent across this script and the module.
 */
export const CARD_FOCUS_GUARD_EVENTS = ["play", "playing", "timeupdate", "canplay", "loadeddata"] as const;

export const CARD_FOCUS_GUARD_BOOT = `(function(){var w=window;if(w.__cfGuard)return;w.__cfGuard=1;var s=w.__cfPaused||(w.__cfPaused=new Set());function g(e){var t=e.target;if(!t||t.tagName!=="VIDEO")return;if(!document.documentElement.hasAttribute("data-card-focus"))return;if(t.paused)return;var c=t.closest&&t.closest(".portfolio-grid-card");if(!c||c.hasAttribute("data-card-focus-active"))return;s.add(t);try{t.pause()}catch(x){}}${JSON.stringify([...CARD_FOCUS_GUARD_EVENTS])}.forEach(function(n){document.addEventListener(n,g,true)})})()`;
