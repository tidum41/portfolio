/**
 * Homepage card focus — pointermove drives focus; scroll only maintains or clears.
 *
 * Video policy lives in cardFocusVideo.ts. This file owns *when* videos pause and
 * resume: every focus change bumps `generation`, cancels all pending video timers,
 * and schedules exactly one pass. Stale work can never fire after a newer focus.
 */

import {
  cardFocusPlay,
  collectCardVideos,
  enforceCardFocusOnVideo,
  mountCardFocusVideoGuards,
  pausedByFocus,
  videoWantsPaused,
} from "@/lib/cardFocusVideo";

const RESUME_STAGGER_MS = 40;
const RESUME_STAGGER_CAP_MS = 160;
const RESUME_VERIFY_MS = 220;
const RESUME_VERIFY_PASSES = 3;
const FINE_POINTER_MQ = "(hover: hover) and (pointer: fine)";
/**
 * While a card is focused, re-assert "dimmed means paused" this often. Events do the
 * work in practice; this makes the invariant hold even if one never fires.
 */
const INVARIANT_INTERVAL_MS = 100;

type CardEl = HTMLElement & { dataset: { gridCard?: string } };
type HitTestMode = "pointer" | "scroll";

export class CardFocusController {
  private grid: HTMLElement | null = null;
  private activeCard: CardEl | null = null;
  private mounted = false;
  private unmountVideoGuards: (() => void) | null = null;

  private lastPtrX = Number.NaN;
  private lastPtrY = Number.NaN;

  private rafId = 0;
  private hitTestMode: HitTestMode | null = null;

  /** Bumped on every focus change; video work from an older generation is dropped. */
  private generation = 0;
  private timers = new Set<number>();

  private invariantTimer = 0;

  private io: IntersectionObserver | null = null;
  /** Unknown counts as in view, so a missing IO report never leaves a video paused. */
  private inView = new WeakMap<HTMLVideoElement, boolean>();

  enabled(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia(FINE_POINTER_MQ).matches;
  }

  mount(grid: HTMLElement) {
    if (this.mounted) this.unmount();
    this.grid = grid;
    this.mounted = true;

    document.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScrollLike, { passive: true, capture: true });
    window.addEventListener("wheel", this.onScrollLike, { passive: true });
    window.addEventListener("touchmove", this.onScrollLike, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onDocumentPointerLeave);
    window.addEventListener("blur", this.onWindowBlur);
    window.addEventListener("soft-nav-start", this.onSoftNavStart);
    document.addEventListener("visibilitychange", this.onVisibility);

    this.unmountVideoGuards = mountCardFocusVideoGuards(grid);
    this.io = new IntersectionObserver(this.onIntersect);
    this.observeVideos();
  }

  unmount() {
    if (!this.mounted) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.hitTestMode = null;
    this.setActive(null, { skipVideos: true });
    this.stopInvariant();
    pausedByFocus.clear();

    this.unmountVideoGuards?.();
    this.unmountVideoGuards = null;
    this.io?.disconnect();
    this.io = null;

    document.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScrollLike, true);
    window.removeEventListener("wheel", this.onScrollLike);
    window.removeEventListener("touchmove", this.onScrollLike);
    document.documentElement.removeEventListener("pointerleave", this.onDocumentPointerLeave);
    window.removeEventListener("blur", this.onWindowBlur);
    window.removeEventListener("soft-nav-start", this.onSoftNavStart);
    document.removeEventListener("visibilitychange", this.onVisibility);

    this.grid = null;
    this.mounted = false;
  }

  /** Called when grid DOM changes (late Mux attach, remount). */
  observeNewVideos() {
    this.observeVideos();
  }

  private observeVideos() {
    if (!this.grid || !this.io) return;
    for (const v of collectCardVideos(this.grid)) this.io.observe(v);
  }

  private after(ms: number, fn: () => void) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
  }

  private cancelVideoWork() {
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
  }

  private scheduleHitTest(mode: HitTestMode) {
    if (!this.enabled()) return;
    if (mode === "pointer") this.hitTestMode = "pointer";
    else if (this.hitTestMode !== "pointer") this.hitTestMode = "scroll";

    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      const runMode = this.hitTestMode ?? "pointer";
      this.hitTestMode = null;
      if (runMode === "pointer") this.flushPointerHitTest();
      else this.flushScrollHitTest();
    });
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.enabled()) return;
    this.lastPtrX = e.clientX;
    this.lastPtrY = e.clientY;
    this.scheduleHitTest("pointer");
  };

  private onScrollLike = () => {
    if (!this.enabled()) return;
    this.scheduleHitTest("scroll");
  };

  private flushPointerHitTest() {
    if (!this.grid) return;
    if (!Number.isFinite(this.lastPtrX) || !Number.isFinite(this.lastPtrY)) return;
    this.setActive(this.cardAtPoint(this.lastPtrX, this.lastPtrY));
  }

  /** Scroll never picks a new card; it only keeps focus or drops to neutral. */
  private flushScrollHitTest() {
    if (!this.grid) return;
    if (!Number.isFinite(this.lastPtrX) || !Number.isFinite(this.lastPtrY)) return;
    if (!this.activeCard) return;

    const card = this.cardAtPoint(this.lastPtrX, this.lastPtrY);
    if (card === this.activeCard) return;
    this.setActive(null);
  }

  private cardAtPoint(x: number, y: number): CardEl | null {
    if (!this.grid) return null;
    const el = document.elementFromPoint(x, y);
    if (!el || !this.grid.contains(el)) return null;
    const card = el.closest?.(".portfolio-grid-card") as CardEl | null;
    if (card?.dataset.gridCard && this.grid.contains(card)) return card;
    return null;
  }

  /**
   * DOM first and synchronous: on neutral, data-card-focus is removed before any
   * video work runs, so the play guards can never re-pause a resuming video.
   * Video work is deferred with setTimeout(0), never requestIdleCallback.
   */
  private setActive(card: CardEl | null, opts: { skipVideos?: boolean } = {}) {
    if (card === this.activeCard) return;

    this.generation++;
    this.cancelVideoWork();

    if (this.activeCard) {
      this.activeCard.removeAttribute("data-card-focus-active");
    }

    this.activeCard = card;

    if (card) {
      card.setAttribute("data-card-focus-active", "");
      document.documentElement.setAttribute("data-card-focus", "");
      // Same task as the dim: if the CSS can apply, the pause applies too.
      this.enforceAll();
      this.startInvariant();
    } else {
      document.documentElement.removeAttribute("data-card-focus");
      this.stopInvariant();
    }

    if (opts.skipVideos) return;
    const gen = this.generation;
    this.after(0, () => this.videoPass(gen));
  }

  private enforceAll() {
    if (!this.grid) return;
    for (const v of collectCardVideos(this.grid)) enforceCardFocusOnVideo(v);
  }

  private startInvariant() {
    if (this.invariantTimer) return;
    this.invariantTimer = window.setInterval(() => {
      if (!this.activeCard || !this.grid) {
        this.stopInvariant();
        return;
      }
      this.enforceAll();
    }, INVARIANT_INTERVAL_MS);
  }

  private stopInvariant() {
    if (!this.invariantTimer) return;
    window.clearInterval(this.invariantTimer);
    this.invariantTimer = 0;
  }

  private isCurrent(gen: number) {
    return gen === this.generation && this.grid !== null;
  }

  private videoPass(gen: number) {
    if (!this.isCurrent(gen) || !this.grid) return;

    for (const v of [...pausedByFocus]) {
      if (!v.isConnected) pausedByFocus.delete(v);
    }

    const focused = this.activeCard;
    if (focused) {
      for (const v of collectCardVideos(this.grid)) {
        if (focused.contains(v)) {
          pausedByFocus.delete(v);
          if (v.paused) cardFocusPlay(v);
        } else {
          enforceCardFocusOnVideo(v);
        }
      }
      return;
    }

    this.resumePausedByFocus(gen);
  }

  /** Single generation-counted resume of exactly the videos focus paused. */
  private resumePausedByFocus(gen: number) {
    const targets: HTMLVideoElement[] = [];
    for (const v of [...pausedByFocus]) {
      if (videoWantsPaused(v)) {
        pausedByFocus.delete(v);
        continue;
      }
      // Offscreen videos stay queued; onIntersect resumes them when they scroll in.
      if (this.inView.get(v) === false) continue;
      targets.push(v);
    }

    targets.forEach((v, i) => {
      this.after(Math.min(i * RESUME_STAGGER_MS, RESUME_STAGGER_CAP_MS), () => {
        if (!this.isCurrent(gen) || this.activeCard) return;
        pausedByFocus.delete(v);
        cardFocusPlay(v);
      });
    });

    const settleMs = Math.min(targets.length * RESUME_STAGGER_MS, RESUME_STAGGER_CAP_MS);
    this.after(settleMs + RESUME_VERIFY_MS, () => this.verifyResumed(targets, gen, 1));
  }

  /** play() can resolve yet leave the element paused; re-issue for stragglers. */
  private verifyResumed(targets: HTMLVideoElement[], gen: number, pass: number) {
    if (!this.isCurrent(gen) || this.activeCard) return;
    const stalled = targets.filter(
      (v) => v.isConnected && v.paused && !videoWantsPaused(v) && this.inView.get(v) !== false,
    );
    for (const v of stalled) {
      pausedByFocus.delete(v);
      cardFocusPlay(v);
    }
    if (stalled.length && pass < RESUME_VERIFY_PASSES) {
      this.after(RESUME_VERIFY_MS, () => this.verifyResumed(stalled, gen, pass + 1));
    }
  }

  private onIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const v = entry.target as HTMLVideoElement;
      this.inView.set(v, entry.isIntersecting);
      if (!entry.isIntersecting) continue;
      if (this.activeCard) continue;
      if (!pausedByFocus.has(v) || videoWantsPaused(v)) continue;
      pausedByFocus.delete(v);
      cardFocusPlay(v);
    }
  };

  private onDocumentPointerLeave = (e: PointerEvent) => {
    if (e.relatedTarget == null) this.setActive(null);
  };

  /** Blur only drops focus; the neutral pass resumes everything focus paused. */
  private onWindowBlur = () => {
    this.setActive(null);
  };

  private onVisibility = () => {
    this.setActive(null);
  };

  /** Leaving the page: stop all focus work and let the soft-nav own playback. */
  private onSoftNavStart = () => {
    this.generation++;
    this.cancelVideoWork();
    this.setActive(null, { skipVideos: true });
    pausedByFocus.clear();
  };
}

export const cardFocusController = new CardFocusController();
