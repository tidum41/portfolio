/**
 * Homepage card focus — single document pointermove driver (rAF-throttled).
 * Sets html[data-card-focus] + data-card-focus-active; dims other grid cards only.
 */

const FADE_MS = 120;
const RESUME_STAGGER_MS = 40;
const FINE_POINTER_MQ = "(hover: hover) and (pointer: fine)";

type CardEl = HTMLElement & { dataset: { gridCard?: string } };

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

function allGridVideos(grid: HTMLElement): HTMLVideoElement[] {
  return [...grid.querySelectorAll<HTMLVideoElement>(".portfolio-grid-card video")];
}

export class CardFocusController {
  private grid: HTMLElement | null = null;
  private activeCard: CardEl | null = null;
  private mounted = false;
  private reducedMotion = false;

  private scrolling = false;
  private lastPtrX = Number.NaN;
  private lastPtrY = Number.NaN;

  private rafId = 0;
  private pendingMove: PointerEvent | null = null;

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
    this.pendingMove = null;
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

  private onPointerMove = (e: PointerEvent) => {
    if (!this.enabled()) return;
    this.pendingMove = e;
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      const ev = this.pendingMove;
      this.pendingMove = null;
      if (ev) this.tick(ev);
    });
  };

  private tick(e: PointerEvent) {
    const x = e.clientX;
    const y = e.clientY;
    const samePos = x === this.lastPtrX && y === this.lastPtrY;

    if (this.scrolling) {
      if (samePos) return;
      this.scrolling = false;
    }

    this.lastPtrX = x;
    this.lastPtrY = y;

    const card = this.resolveCard(e);
    this.setActive(card);
  }

  private resolveCard(e: PointerEvent): CardEl | null {
    if (!this.grid) return null;
    const fromTarget = (e.target as Element | null)?.closest?.(".portfolio-grid-card") as CardEl | null;
    if (fromTarget?.dataset.gridCard && this.grid.contains(fromTarget)) return fromTarget;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const fromPoint = el?.closest?.(".portfolio-grid-card") as CardEl | null;
    if (fromPoint?.dataset.gridCard && this.grid.contains(fromPoint)) return fromPoint;
    return null;
  }

  /** DOM / dim first (sync); video scheduling never blocks this. */
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

    if (!opts.skipVideos) this.scheduleVideos(card);
  }

  private onScrollLike = () => {
    if (!this.enabled()) return;
    this.scrolling = true;
    this.setActive(null);
  };

  private onDocumentPointerLeave = (e: PointerEvent) => {
    if (e.relatedTarget == null) this.setActive(null);
  };

  private onWindowBlur = () => {
    this.setActive(null);
    if (this.grid) {
      for (const v of allGridVideos(this.grid)) {
        this.queueVideoState(v, "pause");
        safePause(v);
      }
    }
  };

  private onVisibility = () => {
    if (document.visibilityState === "hidden") {
      this.setActive(null);
      if (this.grid) {
        for (const v of allGridVideos(this.grid)) {
          this.queueVideoState(v, "pause");
          safePause(v);
        }
      }
      return;
    }
    if (!this.activeCard && this.grid) {
      this.resumeAllVideos();
    }
  };

  private onVideoCanPlay = (e: Event) => {
    const video = e.currentTarget as HTMLVideoElement;
    const want = this.pendingVideoState.get(video);
    if (!want) return;
    if (want === "play") safePlay(video);
    else safePause(video);
  };

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
        this.queueVideoState(v, "play");
        safePlay(v);
      } else {
        toPause.push(v);
      }
    }

    if (toPause.length) {
      this.pauseTimer = window.setTimeout(() => {
        for (const v of toPause) {
          this.queueVideoState(v, "pause");
          safePause(v);
        }
      }, delay);
    }
  }

  private resumeAllVideos() {
    if (!this.grid) return;
    const videos = allGridVideos(this.grid);
    videos.forEach((video, i) => {
      const t = window.setTimeout(() => {
        this.queueVideoState(video, "play");
        safePlay(video);
      }, i * RESUME_STAGGER_MS);
      this.resumeTimers.push(t);
    });
  }

  private queueVideoState(video: HTMLVideoElement, state: "play" | "pause") {
    this.pendingVideoState.set(video, state);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (state === "play") safePlay(video);
      else safePause(video);
    }
  }

  private syncVideo(video: HTMLVideoElement) {
    if (!this.activeCard) return;
    const inFocused = this.activeCard.contains(video);
    this.queueVideoState(video, inFocused ? "play" : "pause");
  }
}

export const cardFocusController = new CardFocusController();
