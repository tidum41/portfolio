/**
 * Single shared controller for homepage card focus (desktop fine pointer).
 * Drives html[data-card-focus], dim CSS, and Mux video play/pause.
 */

const FADE_MS = 200;
const LEAVE_GRACE_MS = 150;
const INTENT_MS = 80;
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

function videosInCard(card: CardEl | null): HTMLVideoElement[] {
  if (!card) return [];
  return [...card.querySelectorAll("video")];
}

function allGridVideos(grid: HTMLElement): HTMLVideoElement[] {
  return [...grid.querySelectorAll<HTMLVideoElement>(".portfolio-grid-card video")];
}

export class CardFocusController {
  private grid: HTMLElement | null = null;
  private nav: HTMLElement | null = null;
  private activeCard: CardEl | null = null;
  private intentTimer = 0;
  private leaveTimer = 0;
  private pauseTimer = 0;
  private resumeTimers: number[] = [];
  /** Per-video: apply play/pause when canplay fires. */
  private pendingVideoState = new WeakMap<HTMLVideoElement, "play" | "pause">();
  private pointerMoveOk = true;
  private mounted = false;
  private reducedMotion = false;

  private onPointerMove = () => {
    this.pointerMoveOk = true;
  };

  private onScroll = () => {
    this.pointerMoveOk = false;
  };

  private onVisibility = () => {
    if (document.visibilityState === "hidden") {
      this.clearFocus({ pauseAll: true });
      for (const v of this.grid ? allGridVideos(this.grid) : []) safePause(v);
      return;
    }
    if (document.visibilityState === "visible" && this.grid && !this.activeCard) {
      this.resumeAllVideos();
    }
  };

  private onWindowBlur = () => {
    this.clearFocus({ pauseAll: true });
    if (this.grid) {
      for (const v of allGridVideos(this.grid)) safePause(v);
    }
  };

  private onDocumentMouseLeave = (e: MouseEvent) => {
    if (e.relatedTarget == null) this.clearFocus();
  };

  private onNavPointerEnter = () => {
    this.clearFocus();
  };

  private onGridPointerLeave = (e: PointerEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && this.grid?.contains(related)) return;
    if (related && this.nav?.contains(related)) {
      this.clearFocus();
      return;
    }
    window.clearTimeout(this.leaveTimer);
    this.leaveTimer = window.setTimeout(() => this.clearFocus(), LEAVE_GRACE_MS);
  };

  private onCardPointerEnter = (e: Event) => {
    if (!this.enabled()) return;
    if (!this.pointerMoveOk) return;
    const card = (e.currentTarget as CardEl) ?? null;
    if (!card?.dataset.gridCard) return;
    window.clearTimeout(this.leaveTimer);
    this.armFocus(card);
  };

  private onFocusIn = (e: FocusEvent) => {
    if (!this.enabled()) return;
    const target = e.target as HTMLElement | null;
    if (!target?.matches?.(":focus-visible")) return;
    const card = target.closest(".portfolio-grid-card") as CardEl | null;
    if (!card?.dataset.gridCard) return;
    window.clearTimeout(this.leaveTimer);
    this.applyFocus(card);
  };

  private onFocusOut = (e: FocusEvent) => {
    if (!this.enabled()) return;
    const related = e.relatedTarget as Node | null;
    if (related && this.grid?.contains(related)) return;
    window.clearTimeout(this.leaveTimer);
    this.leaveTimer = window.setTimeout(() => this.clearFocus(), LEAVE_GRACE_MS);
  };

  private onVideoCanPlay = (e: Event) => {
    const video = e.currentTarget as HTMLVideoElement;
    const want = this.pendingVideoState.get(video);
    if (!want) return;
    if (want === "play") safePlay(video);
    else safePause(video);
  };

  enabled(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia(FINE_POINTER_MQ).matches;
  }

  mount(grid: HTMLElement, nav: HTMLElement | null) {
    if (this.mounted) this.unmount();
    this.grid = grid;
    this.nav = nav;
    this.mounted = true;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    grid.addEventListener("pointerleave", this.onGridPointerLeave);
    grid.addEventListener("focusin", this.onFocusIn);
    grid.addEventListener("focusout", this.onFocusOut);

    const cards = grid.querySelectorAll(".portfolio-grid-card");
    for (const card of cards) {
      card.addEventListener("pointerenter", this.onCardPointerEnter);
    }

    for (const video of allGridVideos(grid)) {
      video.addEventListener("canplay", this.onVideoCanPlay);
    }

    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("blur", this.onWindowBlur);
    document.documentElement.addEventListener("mouseleave", this.onDocumentMouseLeave);
    if (nav) nav.addEventListener("pointerenter", this.onNavPointerEnter);
  }

  unmount() {
    if (!this.mounted) return;
    this.clearFocus({ pauseAll: false });
    const grid = this.grid;
    if (grid) {
      grid.removeEventListener("pointerleave", this.onGridPointerLeave);
      grid.removeEventListener("focusin", this.onFocusIn);
      grid.removeEventListener("focusout", this.onFocusOut);
      const cards = grid.querySelectorAll(".portfolio-grid-card");
      for (const card of cards) {
        card.removeEventListener("pointerenter", this.onCardPointerEnter);
      }
      for (const video of allGridVideos(grid)) {
        video.removeEventListener("canplay", this.onVideoCanPlay);
      }
    }
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("blur", this.onWindowBlur);
    document.documentElement.removeEventListener("mouseleave", this.onDocumentMouseLeave);
    if (this.nav) this.nav.removeEventListener("pointerenter", this.onNavPointerEnter);
    this.grid = null;
    this.nav = null;
    this.mounted = false;
  }

  /** Call when new videos mount under the grid (e.g. Mux attach). */
  observeNewVideos() {
    if (!this.grid) return;
    for (const video of allGridVideos(this.grid)) {
      video.removeEventListener("canplay", this.onVideoCanPlay);
      video.addEventListener("canplay", this.onVideoCanPlay);
      this.syncVideo(video);
    }
  }

  private armFocus(card: CardEl) {
    window.clearTimeout(this.intentTimer);
    const hadFocus = this.activeCard !== null;
    if (hadFocus) {
      this.applyFocus(card);
      return;
    }
    this.intentTimer = window.setTimeout(() => {
      this.applyFocus(card);
    }, INTENT_MS);
  }

  private applyFocus(card: CardEl) {
    window.clearTimeout(this.intentTimer);
    window.clearTimeout(this.pauseTimer);

    if (this.activeCard && this.activeCard !== card) {
      this.activeCard.removeAttribute("data-card-focus-active");
    }

    this.activeCard = card;
    card.setAttribute("data-card-focus-active", "");
    document.documentElement.setAttribute("data-card-focus", "");

    if (!this.grid) return;
    const videos = allGridVideos(this.grid);
    const delay = this.reducedMotion ? 0 : FADE_MS;
    const toPause: HTMLVideoElement[] = [];

    for (const v of videos) {
      if (card.contains(v)) {
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

  private clearFocus({ pauseAll = false }: { pauseAll?: boolean } = {}) {
    window.clearTimeout(this.intentTimer);
    window.clearTimeout(this.leaveTimer);
    window.clearTimeout(this.pauseTimer);
    for (const t of this.resumeTimers) window.clearTimeout(t);
    this.resumeTimers = [];

    if (this.activeCard) {
      this.activeCard.removeAttribute("data-card-focus-active");
      this.activeCard = null;
    }
    document.documentElement.removeAttribute("data-card-focus");

    if (pauseAll && this.grid) {
      for (const v of allGridVideos(this.grid)) {
        this.queueVideoState(v, "pause");
        safePause(v);
      }
      return;
    }

    this.resumeAllVideos();
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

/** One controller for the whole app — never instantiate per card. */
export const cardFocusController = new CardFocusController();
