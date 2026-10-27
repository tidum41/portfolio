/**
 * PS3-style UI sound engine (Web Audio).
 *
 * Taxonomy (XMB metaphor):
 * - `option` — selecting / navigating (nav, footer, external links, unmute)
 * - `push`   — entering / confirming (project cards, archive opens)
 *
 * Ambient bed (VolumeControl) is separate — UI ticks unlock on first gesture
 * and play even when background music is muted.
 *
 * Hot path: once buffers are decoded and AudioContext is running, play is
 * fully synchronous (no await) so ticks land on the same frame as the press.
 */

export type UiSoundId = "option" | "push";

const SOURCES: Record<UiSoundId, string> = {
  option: "/audio/ui/snd-option.mp3",
  push: "/audio/ui/button-push.wav",
};

/** UI SFX sit above ambient music; kept under 1.0 at full master volume. */
const UI_GAIN = 0.96;

type Master = {
  volume: number;
  /** Unlocked on first pointerdown (gesture); off when prefers-reduced-motion. */
  enabled: boolean;
};

let master: Master = { volume: 0.4, enabled: false };
let ctx: AudioContext | null = null;
const rawBuffers = new Map<UiSoundId, ArrayBuffer>();
const rawInflight = new Map<UiSoundId, Promise<ArrayBuffer | null>>();
const buffers = new Map<UiSoundId, AudioBuffer>();
const inflight = new Map<UiSoundId, Promise<AudioBuffer | null>>();
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

async function resumeCtx(): Promise<AudioContext | null> {
  const audioCtx = getCtx();
  if (!audioCtx) return null;
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {
      return null;
    }
  }
  unlocked = audioCtx.state === "running";
  return audioCtx;
}

async function fetchRawBuffer(id: UiSoundId): Promise<ArrayBuffer | null> {
  if (rawBuffers.has(id)) return rawBuffers.get(id)!;
  const existing = rawInflight.get(id);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(SOURCES[id], { cache: "force-cache" });
      if (!res.ok) return null;
      const raw = await res.arrayBuffer();
      rawBuffers.set(id, raw);
      return raw;
    } catch {
      return null;
    } finally {
      rawInflight.delete(id);
    }
  })();

  rawInflight.set(id, promise);
  return promise;
}

async function loadBuffer(id: UiSoundId): Promise<AudioBuffer | null> {
  if (buffers.has(id)) return buffers.get(id)!;
  const existing = inflight.get(id);
  if (existing) return existing;

  const promise = (async () => {
    const audioCtx = getCtx();
    if (!audioCtx) return null;
    try {
      const raw = rawBuffers.get(id) || (await fetchRawBuffer(id));
      if (!raw) return null;
      const buf = await audioCtx.decodeAudioData(raw.slice(0));
      buffers.set(id, buf);
      return buf;
    } catch {
      return null;
    } finally {
      inflight.delete(id);
    }
  })();

  inflight.set(id, promise);
  return promise;
}

function startBuffer(audioCtx: AudioContext, buf: AudioBuffer) {
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const gain = audioCtx.createGain();
  gain.gain.value = Math.min(1, master.volume * UI_GAIN);
  src.connect(gain);
  gain.connect(audioCtx.destination);
  try {
    src.start(0);
  } catch {
    // Ignored — overlapping starts are fine; rare InvalidStateError if closed.
  }
}

/** Master volume for UI ticks (slider in nav). Not tied to ambient mute. */
export function setUiSoundVolume(volume: number) {
  master = { ...master, volume };
}

export function setUiSoundEnabled(enabled: boolean) {
  master = { ...master, enabled };
}

export function getUiSoundMaster(): Master {
  return master;
}

/** First visitor gesture — unlock Web Audio + enable UI ticks. */
export function unlockUiSounds() {
  if (!master.enabled) {
    master = { ...master, enabled: true };
  }
  warmUiSounds({ allowContext: true });
}

/**
 * Prefetch UI sound assets into memory.
 * When allowContext is false (default for idle prewarm), fetches raw ArrayBuffers
 * without instantiating AudioContext, avoiding Chrome autoplay warnings.
 * When allowContext is true (called on first gesture), instantiates and decodes immediately.
 */
/** True once the tick files are in memory (raw or decoded). */
export function uiSoundsCached(): boolean {
  return rawBuffers.has("push") || buffers.has("push");
}

export function warmUiSounds(options?: { allowContext?: boolean }) {
  const allowContext = options?.allowContext ?? false;
  if (allowContext) {
    void loadBuffer("option");
    void loadBuffer("push");
    void resumeCtx();
  } else {
    void fetchRawBuffer("option");
    void fetchRawBuffer("push");
  }
}

/**
 * Play a UI tick. Prefer the sync hot path (cached buffer + running context)
 * so sound lands on the press frame. Cold path falls back to async load.
 */
export function playUiSound(id: UiSoundId): void {
  if (!master.enabled || master.volume <= 0) return;

  const audioCtx = getCtx();
  if (!audioCtx) return;

  if (audioCtx.state === "running") {
    unlocked = true;
    const buf = buffers.get(id);
    if (buf) {
      startBuffer(audioCtx, buf);
      return;
    }
  }

  // Cold / suspended: resume + load, then start as soon as ready.
  void (async () => {
    const ready = await resumeCtx();
    if (!ready || !unlocked) return;
    if (!master.enabled || master.volume <= 0) return;
    const buf = await loadBuffer(id);
    if (!buf || !master.enabled || master.volume <= 0) return;
    startBuffer(ready, buf);
  })();
}

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "[role='button']",
  "input",
  "select",
  "summary",
  "label",
  "[data-ui-sound]",
  "[data-sound]",
].join(",");

function labelControlsSomething(label: HTMLLabelElement): boolean {
  if (label.control) return true;
  return Boolean(label.querySelector("input, select, textarea, button"));
}

/**
 * Closest real interactive host for UI ticks.
 * Empty / text / image taps outside these return null — including archive
 * canvas chrome that only carries data-ui-sound-scope for taxonomy.
 */
export function findUiSoundInteractiveHost(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  if (target.closest("[data-ui-sound='off'], [data-sound='off']")) return null;

  const host = target.closest(INTERACTIVE_SELECTOR);
  if (!host) return null;

  const hostExplicit =
    host.getAttribute("data-ui-sound") || host.getAttribute("data-sound");

  if (host instanceof HTMLLabelElement) {
    if (hostExplicit !== "option" && hostExplicit !== "push" && !labelControlsSomething(host)) {
      return null;
    }
  }

  if (host instanceof HTMLAnchorElement) {
    const href = host.getAttribute("href") || "";
    if (!href || href === "#") return null;
  }

  if (
    host instanceof HTMLButtonElement ||
    host instanceof HTMLInputElement ||
    host instanceof HTMLSelectElement
  ) {
    if (host.disabled) return null;
  }

  return host;
}

/** Resolve which sound a click target should play, if any. */
export function resolveUiSoundFromEventTarget(target: EventTarget | null): UiSoundId | null {
  const host = findUiSoundInteractiveHost(target);
  if (!host) return null;

  const explicit =
    host.closest<HTMLElement>("[data-ui-sound]") || host.closest<HTMLElement>("[data-sound]");
  const value = explicit?.getAttribute("data-ui-sound") || explicit?.getAttribute("data-sound");
  if (value === "option" || value === "push") return value;
  if (value === "off") return null;

  // Entering a project / archive tile — push. Only after an interactive host
  // matched above, so empty gaps and pan gestures stay silent.
  if (host.closest(".portfolio-grid-card, .project-card, [data-grid-card]")) {
    return "push";
  }
  if (host.closest("[data-ui-sound-scope='archive']")) {
    return "push";
  }

  return "option";
}
