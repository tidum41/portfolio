"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { useDialKit } from "dialkit";
import {
  buildAgentCopy,
  FILM_DEFAULTS,
  type FilmParams,
} from "@/remotion/src/joola/film-params";
import {
  JoolaB2B,
  JOOLA_DURATION,
  JOOLA_FPS,
} from "@/remotion/src/JoolaB2B";

const LAB_Z = 50;
const COMP_W = 1920;
const COMP_H = 1440;
const CARD_PREVIEW_W = 676;

function formatTime(frame: number, fps: number) {
  const totalSec = Math.max(0, frame) / fps;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const f = Math.floor(frame % fps);
  return `${m}:${String(s).padStart(2, "0")}.${String(f).padStart(2, "0")}`;
}

/**
 * Hide site-wide DialKit panels (Entrance, BentoHero, …) that stay registered
 * via PersistentWorkShell. Only touch top-level panel folders — nested
 * folders inside a Film* panel must stay visible.
 */
function hideNonFilmDialFolders() {
  const panelFolders = document.querySelectorAll<HTMLElement>(
    '.dialkit-panel[data-multiple="true"] .dialkit-folder-root > .dialkit-folder-content > .dialkit-folder-inner > .dialkit-folder',
  );
  panelFolders.forEach((folder) => {
    const title = folder.querySelector(
      ":scope > .dialkit-folder-header .dialkit-folder-title",
    );
    const name = (title?.textContent || "").trim();
    if (!name) return;
    folder.style.display = name.startsWith("Film") ? "" : "none";
  });
}

export default function RemotionPlaygroundClient() {
  const playerRef = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cardPreview, setCardPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const camera = useDialKit(
    "Film Camera",
    {
      shotACx: [FILM_DEFAULTS.shotACx, 200, 900, 0.1],
      shotACy: [FILM_DEFAULTS.shotACy, 40, 400, 0.1],
      shotAZoom: [FILM_DEFAULTS.shotAZoom, 1, 6, 0.01],
      shotQtyCx: [FILM_DEFAULTS.shotQtyCx, 400, 1100, 0.1],
      shotQtyCy: [FILM_DEFAULTS.shotQtyCy, 120, 600, 0.1],
      shotQtyZoom: [FILM_DEFAULTS.shotQtyZoom, 1, 6, 0.01],
      shotSavedCx: [FILM_DEFAULTS.shotSavedCx, 600, 1300, 0.1],
      shotSavedCy: [FILM_DEFAULTS.shotSavedCy, 200, 700, 0.1],
      shotSavedZoom: [FILM_DEFAULTS.shotSavedZoom, 1, 5, 0.01],
      shotOrderCx: [FILM_DEFAULTS.shotOrderCx, 400, 1100, 0.1],
      shotOrderCy: [FILM_DEFAULTS.shotOrderCy, 200, 600, 0.1],
      shotOrderZoom: [FILM_DEFAULTS.shotOrderZoom, 0.8, 3, 0.01],
      cardScale: [FILM_DEFAULTS.cardScale, 1.5, 4, 0.01],
    },
    { id: "remotion-film-camera", persist: true },
  );

  const timing = useDialKit(
    "Film Timing",
    {
      openMoveDuration: [FILM_DEFAULTS.openMoveDuration, 6, 40, 1],
      zoomOutDuration: [FILM_DEFAULTS.zoomOutDuration, 8, 48, 1],
      revealDuration: [FILM_DEFAULTS.revealDuration, 8, 48, 1],
      zoomLinesDuration: [FILM_DEFAULTS.zoomLinesDuration, 8, 48, 1],
      pillFillDuration: [FILM_DEFAULTS.pillFillDuration, 4, 36, 1],
      confRecenterDuration: [FILM_DEFAULTS.confRecenterDuration, 4, 30, 1],
      logoOutDuration: [FILM_DEFAULTS.logoOutDuration, 1, 20, 1],
      camEase: {
        type: "select" as const,
        options: [
          { value: "cam", label: "CAM_E" },
          { value: "flow", label: "FLOW_E" },
          { value: "move", label: "MOVE_E" },
        ],
        default: FILM_DEFAULTS.camEase,
      },
    },
    { id: "remotion-film-timing", persist: true },
  );

  const cursor = useDialKit(
    "Film Cursor",
    {
      cursorScale: [FILM_DEFAULTS.cursorScale, 1, 5, 0.01],
      ptrEase: {
        type: "select" as const,
        options: [
          { value: "ptr", label: "PTR_E" },
          { value: "flow", label: "FLOW_E (all travel)" },
        ],
        default: FILM_DEFAULTS.ptrEase,
      },
    },
    { id: "remotion-film-cursor", persist: true },
  );

  const filmParams: FilmParams = useMemo(
    () => ({
      shotACx: camera.shotACx,
      shotACy: camera.shotACy,
      shotAZoom: camera.shotAZoom,
      shotQtyCx: camera.shotQtyCx,
      shotQtyCy: camera.shotQtyCy,
      shotQtyZoom: camera.shotQtyZoom,
      shotSavedCx: camera.shotSavedCx,
      shotSavedCy: camera.shotSavedCy,
      shotSavedZoom: camera.shotSavedZoom,
      shotOrderCx: camera.shotOrderCx,
      shotOrderCy: camera.shotOrderCy,
      shotOrderZoom: camera.shotOrderZoom,
      cardScale: camera.cardScale,
      openMoveDuration: timing.openMoveDuration,
      zoomOutDuration: timing.zoomOutDuration,
      revealDuration: timing.revealDuration,
      zoomLinesDuration: timing.zoomLinesDuration,
      pillFillDuration: timing.pillFillDuration,
      confRecenterDuration: timing.confRecenterDuration,
      logoOutDuration: timing.logoOutDuration,
      camEase: (timing.camEase as FilmParams["camEase"]) || "cam",
      ptrEase: (cursor.ptrEase as FilmParams["ptrEase"]) || "ptr",
      cursorScale: cursor.cursorScale,
    }),
    [camera, timing, cursor],
  );

  const inputProps = useMemo(() => filmParams, [filmParams]);

  useEffect(() => {
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    root.setAttribute("data-remotion-playground", "1");
    // Force light tokens so dark-mode --color-text-primary (#EDEDEC) cannot
    // wash out the light lab chrome.
    root.setAttribute("data-theme", "light");
    hideNonFilmDialFolders();
    const obs = new MutationObserver(() => hideNonFilmDialFolders());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      root.removeAttribute("data-remotion-playground");
      if (prevTheme) root.setAttribute("data-theme", prevTheme);
      else root.removeAttribute("data-theme");
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = () => setFrame(player.getCurrentFrame());
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    onFrame();
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) player.pause();
    else player.play();
  }, []);

  const onCopy = useCallback(async () => {
    const text = buildAgentCopy(filmParams);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  }, [filmParams]);

  const stageMaxWidth = cardPreview ? CARD_PREVIEW_W : undefined;

  return (
    <>
      <style>{`
        html[data-remotion-playground] .dialkit-panel,
        html[data-remotion-playground] .dialkit-select-dropdown,
        html[data-remotion-playground] .dialkit-preset-dropdown,
        html[data-remotion-playground] .dialkit-shortcuts-dropdown {
          z-index: 10050 !important;
        }
        /* Site chrome sits over this fixed shell and was washing out the title. */
        html[data-remotion-playground] header.intro-hide,
        html[data-remotion-playground] .site-nav {
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .rpg-player button {
          font-family: var(--font-sans) !important;
        }
        /* Hard ink — site dark-theme tokens set --color-text-primary to #EDEDEC. */
        .rpg-shell,
        .rpg-shell h1,
        .rpg-shell .rpg-play {
          color: #1a1a1a !important;
        }
        .rpg-shell .rpg-muted {
          color: #575757 !important;
        }
        .rpg-shell .rpg-play {
          border: 1px solid #c8c4ce !important;
          background: #fff !important;
          font-weight: 500 !important;
        }
        .rpg-shell .rpg-copy {
          background: #2d68c4 !important;
          color: #fff !important;
          border: none !important;
          font-weight: 500 !important;
        }
        /* DialKit popover sits fixed on the right (~300px). Keep the stage
           in the clear band to its left at 1440. (padding lives here — not
           inline — so it isn't overridden by the shell’s other padding.) */
        .rpg-shell {
          padding: var(--space-3);
          padding-right: 360px;
          box-sizing: border-box;
        }
        .rpg-workspace,
        .rpg-header {
          width: 100%;
          max-width: 1020px;
          margin: 0;
        }
        .rpg-player {
          width: 100%;
        }
        @media (max-width: 900px) {
          .rpg-shell {
            padding-right: var(--space-3);
          }
        }
      `}</style>

      <div className="rpg-shell" data-theme="light" style={shellStyle}>
        <header className="rpg-header" style={headerStyle}>
          <div style={{ minWidth: 0 }}>
            <div className="rpg-muted" style={eyebrowStyle}>
              Dev · Remotion
            </div>
            <h1 style={titleStyle}>JOOLA B2B film</h1>
            <p className="rpg-muted" style={dekStyle}>
              DialKit tunes camera, timing, easing, and cursor. Copy a prompt for
              the agent when a tweak should become permanent.
            </p>
          </div>
          <div style={headerActionsStyle}>
            <button
              type="button"
              onClick={() => setCardPreview((v) => !v)}
              style={chipStyle(cardPreview)}
            >
              {cardPreview ? "676px card" : "Full stage"}
            </button>
            <Link href="/dev" className="rpg-muted" style={linkStyle}>
              ← dev
            </Link>
          </div>
        </header>

        <div className="rpg-workspace">
          <div style={stageColumnStyle}>
            <div style={metaRowStyle}>
              <button
                type="button"
                className="rpg-play"
                onClick={togglePlay}
                style={playBtnStyle}
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                className="rpg-copy"
                onClick={onCopy}
                style={copyBtnStyle}
              >
                {copied ? "Copied" : "Copy for agent"}
              </button>
              <span className="rpg-muted" style={readoutStyle}>
                Frame {frame} / {JOOLA_DURATION - 1}
              </span>
              <span className="rpg-muted" style={readoutStyle}>
                {formatTime(frame, JOOLA_FPS)} /{" "}
                {formatTime(JOOLA_DURATION - 1, JOOLA_FPS)}
              </span>
            </div>

            <div
              className="rpg-player"
              style={{
                ...playerWrapStyle,
                maxWidth: stageMaxWidth ?? "100%",
              }}
            >
              <Player
                ref={playerRef}
                component={JoolaB2B}
                inputProps={inputProps}
                durationInFrames={JOOLA_DURATION}
                compositionWidth={COMP_W}
                compositionHeight={COMP_H}
                fps={JOOLA_FPS}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
                controls
                loop
                clickToPlay
                acknowledgeRemotionLicense
                numberOfSharedAudioTags={0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const INK = "#1A1A1A";
const MUTED = "#575757";

const shellStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: LAB_Z,
  background:
    "radial-gradient(1200px 600px at 20% -10%, rgba(46,104,196,0.08), transparent 60%), linear-gradient(180deg, #F7F7F5 0%, #F0EFEB 100%)",
  color: INK,
  fontFamily: "var(--font-sans)",
  overflow: "auto",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--space-3)",
  marginBottom: "var(--space-3)",
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  fontSize: "var(--fs-caption)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: MUTED,
  marginBottom: 4,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--fs-xl)",
  fontWeight: 600,
  letterSpacing: "var(--ls-xl)",
  lineHeight: "var(--lh-xl)",
  color: INK,
};

const dekStyle: CSSProperties = {
  margin: "6px 0 0",
  maxWidth: 520,
  fontSize: "var(--fs-sm)",
  lineHeight: "var(--lh-sm)",
  color: MUTED,
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const chipStyle = (on: boolean): CSSProperties => ({
  border: `1px solid ${on ? INK : "#D8D4DE"}`,
  background: on ? INK : "rgba(255,255,255,0.85)",
  color: on ? "#fff" : INK,
  borderRadius: "var(--radius-control)",
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
});

const copyBtnStyle: CSSProperties = {
  border: "none",
  background: "#2D68C4",
  color: "#fff",
  borderRadius: "var(--radius-control)",
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

const linkStyle: CSSProperties = {
  fontSize: 13,
  color: MUTED,
  textDecoration: "none",
  padding: "8px 4px",
};

const stageColumnStyle: CSSProperties = {
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const playBtnStyle: CSSProperties = {
  border: "1px solid #D8D4DE",
  background: "#fff",
  color: INK,
  borderRadius: "var(--radius-control)",
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

const readoutStyle: CSSProperties = {
  fontSize: 13,
  color: MUTED,
  fontVariantNumeric: "tabular-nums",
};

const playerWrapStyle: CSSProperties = {
  width: "100%",
  aspectRatio: `${COMP_W} / ${COMP_H}`,
  background: "#fff",
  borderRadius: "var(--radius-control)",
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 40px rgba(30,30,30,0.06)",
  border: "1px solid rgba(0,0,0,0.06)",
};

