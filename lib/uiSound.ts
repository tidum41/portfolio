/**
 * PS3-style UI sound engine (Web Audio).
 *
 * Taxonomy (XMB metaphor):
 * - `option` — selecting / navigating (nav, footer, external links, unmute)
 * - `push`   — entering / confirming (project cards, archive opens)
 *
 * Ambient bed (VolumeControl) is separate — UI ticks unlock on first gesture
 * and play even when background music is muted.
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

async function loadBuffer(id: UiSoundId): Promise<AudioBuffer | null> {
  if (buffers.has(id)) return buffers.get(id)!;
  const existing = inflight.get(id);
  if (existing) return existing;

  const promise = (async () => {
    const audioCtx = await resumeCtx();
    if (!audioCtx) return null;
    try {
      const res = await fetch(SOURCES[id], { cache: "force-cache" });
      if (!res.ok) return null;
      const raw = await res.arrayBuffer();
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
  if (master.enabled) return;
  master = { ...master, enabled: true };
  void resumeCtx();
}

/** Prefetch both clips after unlock or unmute. */
export function warmUiSounds() {
  void resumeCtx().then(() => {
    void loadBuffer("option");
    void loadBuffer("push");
  });
}

export async function playUiSound(id: UiSoundId): Promise<void> {
  if (!master.enabled || master.volume <= 0) return;

  const audioCtx = await resumeCtx();
  if (!audioCtx || !unlocked) return;

  const buf = await loadBuffer(id);
  if (!buf) return;
  if (!master.enabled || master.volume <= 0) return;

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

/** Resolve which sound a click target should play, if any. */
export function resolveUiSoundFromEventTarget(target: EventTarget | null): UiSoundId | null {
  if (!(target instanceof Element)) return null;

  if (target.closest("[data-ui-sound='off']")) return null;

  const explicit = target.closest<HTMLElement>("[data-ui-sound]");
  const value = explicit?.getAttribute("data-ui-sound");
  if (value === "option" || value === "push") return value;
  if (value === "off") return null;

  if (target.closest(".portfolio-grid-card, .project-card, [data-grid-card]")) {
    return "push";
  }

  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (link) {
    const href = link.getAttribute("href") || "";
    if (!href || href === "#") return null;
    return "option";
  }

  if (target.closest("[data-ui-sound-scope='archive']")) {
    return "push";
  }

  return null;
}
