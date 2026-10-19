/**
 * Homepage card focus — pointermove drives focus; scroll only maintains or clears.
 */

const FADE_MS = 120;
const RESUME_STAGGER_MS = 40;
const FINE_POINTER_MQ = "(hover: hover) and (pointer: fine)";

type CardEl = HTMLElement & { dataset: { gridCard?: string } };
type HitTestMode = "pointer" | "scroll";

function safePlay(video: HTMLVideoElement) {
  const p = video.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

function safePause(video: HTMLVideoElement) {
  try {
    video.pause();
  } catch {
    /* ignore */
  }
}

function deferVideoWork(fn: () => void) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(fn, { timeout: 120 });
  } else {
    setTimeout(fn, 0);
  }
}

function pauseMuxHost(host: Element) {
  const el = host as HTMLElement & { pause?: () => void };
  if (typeof el.pause === "function") {
    try {
      el.pause();
    } catch {
      /* ignore */
    }
  }
}

function videosInCard(card: Element): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = [];
  for (const v of card.querySelectorAll<HTMLVideoElement>("video")) out.push(v);
  for (const mux of card.querySelectorAll("mux-player")) {
    pauseMuxHost(mux);
    const sr = mux.shadowRoot;
    const v = sr?.querySelector("video") ?? mux.querySelector("video");
    if (v) out.push(v);
  }
  return out;
}

function allGridVideos(grid: HTMLElement): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = [];
  for (const card of grid.querySelectorAll(".portfolio-grid-card")) {
    out.push(...videosInCard(card));
  }
  return [...new Set(out)];
}

export class CardFocusController {
  private grid: HTMLElement | null = null;
  private activeCard: CardEl | null = null;
  private mounted = false;
  private reducedMotion = false;

  private lastPtrX = Number.NaN;
  private lastPtrY = Number.NaN;

  private rafId = 0;
  private hitTestMode: HitTestMode | null = null;

  private pauseTimer = 0;
  private resumeTimers: number[] = [];
  private pendingVideoState = new WeakMap<HTMLVideoElement, "play" | "pause">();

  enabled(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia(FINE_POINTER_MQ).matches;
  }

  mount(grid: HTMLElement) {
    if (this.mounted) this.unmount();
    this.grid = grid;
    this.mounted = true;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScrollLike, { passive: true, capture: true });
    window.addEventListener("wheel", this.onScrollLike, { passive: true });
    window.addEventListener("touchmove", this.onScrollLike, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onDocumentPointerLeave);
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("visibilitychange", this.onVisibility);

    for (const video of allGridVideos(grid)) {
      video.addEventListener("canplay", this.onVideoCanPlay);
    }
  }

  unmount() {
    if (!this.mounted) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.hitTestMode = null;
    this.setActive(null, { skipVideos: true });

    const grid = this.grid;
    if (grid) {
      for (const video of allGridVideos(grid)) {
        video.removeEventListener("canplay", this.onVideoCanPlay);
      }
    }

    document.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScrollLike, true);
    window.removeEventListener("wheel", this.onScrollLike);
    window.removeEventListener("touchmove", this.onScrollLike);
    document.documentElement.removeEventListener("pointerleave", this.onDocumentPointerLeave);
    window.removeEventListener("blur", this.onWindowBlur);
    document.removeEventListener("visibilitychange", this.onVisibility);

    this.grid = null;
    this.mounted = false;
  }

  observeNewVideos() {
    if (!this.grid) return;
    for (const video of allGridVideos(this.grid)) {
      video.removeEventListener("canplay", this.onVideoCanPlay);
      video.addEventListener("canplay", this.onVideoCanPlay);
      this.syncVideo(video);
    }
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
    const card = this.cardAtPoint(this.lastPtrX, this.lastPtrY);
    this.setActive(card);
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

  /** DOM / dim first (sync); video work is always deferred. */
  private setActive(card: CardEl | null, opts: { skipVideos?: boolean } = {}) {
    if (card === this.activeCard) return;

    if (this.activeCard) {
      this.activeCard.removeAttribute("data-card-focus-active");
    }

    this.activeCard = card;

    if (card) {
      card.setAttribute("data-card-focus-active", "");
      document.documentElement.setAttribute("data-card-focus", "");
    } else {
      document.documentElement.removeAttribute("data-card-focus");
    }

    if (!opts.skipVideos) {
      deferVideoWork(() => this.scheduleVideos(card));
    }
  }

  private onDocumentPointerLeave = (e: PointerEvent) => {
    if (e.relatedTarget == null) this.setActive(null);
  };

  private onWindowBlur = () => {
    this.setActive(null);
    deferVideoWork(() => {
      if (!this.grid) return;
      for (const v of allGridVideos(this.grid)) {
        this.queueVideoState(v, "pause");
        safePause(v);
      }
    });
  };

  private onVisibility = () => {
    if (document.visibilityState === "hidden") {
      this.setActive(null);
      deferVideoWork(() => {
        if (!this.grid) return;
        for (const v of allGridVideos(this.grid)) {
          this.queueVideoState(v, "pause");
          safePause(v);
        }
      });
      return;
    }
    if (!this.activeCard && this.grid) {
      deferVideoWork(() => this.resumeAllVideos());
    }
  };

  private onVideoCanPlay = (e: Event) => {
    const video = e.currentTarget as HTMLVideoElement;
    const want = this.pendingVideoState.get(video);
    if (!want) return;
    deferVideoWork(() => {
      if (want === "play") this.applyPlay(video);
      else this.applyPause(video);
    });
  };

  private applyPause(video: HTMLVideoElement) {
    this.queueVideoState(video, "pause");
    safePause(video);
    const mux = video.closest("mux-player");
    if (mux) pauseMuxHost(mux);
  }

  private applyPlay(video: HTMLVideoElement) {
    this.queueVideoState(video, "play");
    if (!this.activeCard?.contains(video)) return;
    safePlay(video);
  }

  private scheduleVideos(focused: CardEl | null) {
    window.clearTimeout(this.pauseTimer);
    for (const t of this.resumeTimers) window.clearTimeout(t);
    this.resumeTimers = [];

    if (!this.grid) return;
    const videos = allGridVideos(this.grid);

    if (!focused) {
      this.resumeAllVideos();
      return;
    }

    const delay = this.reducedMotion ? 0 : FADE_MS;
    const toPause: HTMLVideoElement[] = [];

    for (const v of videos) {
      if (focused.contains(v)) {
        this.applyPlay(v);
      } else {
        toPause.push(v);
      }
    }

    const runPause = () => {
      for (const v of toPause) this.applyPause(v);
    };

    if (toPause.length) {
      if (delay === 0) runPause();
      else this.pauseTimer = window.setTimeout(runPause, delay);
    }
  }

  private resumeAllVideos() {
    if (!this.grid) return;
    const videos = allGridVideos(this.grid);
    videos.forEach((video, i) => {
      const t = window.setTimeout(() => {
        this.applyPlay(video);
      }, i * RESUME_STAGGER_MS);
      this.resumeTimers.push(t);
    });
  }

  private queueVideoState(video: HTMLVideoElement, state: "play" | "pause") {
    this.pendingVideoState.set(video, state);
  }

  private syncVideo(video: HTMLVideoElement) {
    if (!this.activeCard) return;
    const inFocused = this.activeCard.contains(video);
    if (inFocused) this.applyPlay(video);
    else this.applyPause(video);
  }
}

export const cardFocusController = new CardFocusController();
