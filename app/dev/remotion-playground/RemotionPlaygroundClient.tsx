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
    document.documentElement.setAttribute("data-remotion-playground", "1");
    hideNonFilmDialFolders();
    const obs = new MutationObserver(() => hideNonFilmDialFolders());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.documentElement.removeAttribute("data-remotion-playground");
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
        .rpg-player button {
          font-family: var(--font-sans) !important;
        }
        .rpg-shell {
          padding-right: max(var(--space-3), 300px);
        }
        .rpg-workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: var(--space-3);
          max-width: 1440px;
          margin: 0 auto;
          align-items: start;
        }
        @media (max-width: 900px) {
          .rpg-shell {
            padding-right: var(--space-3);
          }
          .rpg-workspace {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="rpg-shell" style={shellStyle}>
        <header style={headerStyle}>
          <div style={{ minWidth: 0 }}>
            <div style={eyebrowStyle}>Dev · Remotion</div>
            <h1 style={titleStyle}>JOOLA B2B film</h1>
            <p style={dekStyle}>
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
            <Link href="/dev" style={linkStyle}>
              ← dev
            </Link>
          </div>
        </header>

        <div className="rpg-workspace">
          <div style={stageColumnStyle}>
            <div style={metaRowStyle}>
              <button type="button" onClick={togglePlay} style={playBtnStyle}>
                {playing ? "Pause" : "Play"}
              </button>
              <button type="button" onClick={onCopy} style={copyBtnStyle}>
                {copied ? "Copied" : "Copy for agent"}
              </button>
              <span style={readoutStyle}>
                Frame {frame} / {JOOLA_DURATION - 1}
              </span>
              <span style={readoutStyle}>
                {formatTime(frame, JOOLA_FPS)} /{" "}
                {formatTime(JOOLA_DURATION - 1, JOOLA_FPS)}
              </span>
            </div>

            <div
              className="rpg-player"
              style={{
                ...playerWrapStyle,
                maxWidth: stageMaxWidth,
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

          <aside style={asideStyle}>
            <div style={asideTitleStyle}>DialKit</div>
            <p style={asideDekStyle}>
              Panels: Film Camera, Film Timing, Film Cursor. Versions use the
              menu (no page-capture thumbnails). Site dials are hidden here.
            </p>
            <ul style={asideListStyle}>
              <li>Camera shots A / qty / saved / order + card scale</li>
              <li>Move durations, pill fill, logo out, cam ease</li>
              <li>Cursor scale + travel ease</li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}

const shellStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: LAB_Z,
  background:
    "radial-gradient(1200px 600px at 20% -10%, rgba(46,104,196,0.08), transparent 60%), linear-gradient(180deg, #F7F7F5 0%, #F0EFEB 100%)",
  color: "var(--color-text-primary, #2E2E2E)",
  fontFamily: "var(--font-sans)",
  overflow: "auto",
  padding: "var(--space-3)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--space-3)",
  maxWidth: 1440,
  margin: "0 auto var(--space-3)",
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  fontSize: "var(--fs-caption)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-text-tertiary)",
  marginBottom: 4,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "var(--fs-xl)",
  fontWeight: 500,
  letterSpacing: "var(--ls-xl)",
  lineHeight: "var(--lh-xl)",
};

const dekStyle: CSSProperties = {
  margin: "6px 0 0",
  maxWidth: 520,
  fontSize: "var(--fs-sm)",
  lineHeight: "var(--lh-sm)",
  color: "var(--color-text-secondary)",
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const chipStyle = (on: boolean): CSSProperties => ({
  border: "1px solid var(--color-border-subtle, #E8E4F0)",
  background: on ? "var(--color-text-primary)" : "rgba(255,255,255,0.7)",
  color: on ? "#fff" : "var(--color-text-primary)",
  borderRadius: "var(--radius-control)",
  padding: "8px 12px",
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
});

const copyBtnStyle: CSSProperties = {
  border: "none",
  background: "var(--color-ucla-blue, #2D68C4)",
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
  color: "var(--color-text-secondary)",
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
  border: "1px solid var(--color-border-subtle, #E8E4F0)",
  background: "#fff",
  borderRadius: "var(--radius-control)",
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

const readoutStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--color-text-secondary)",
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

const asideStyle: CSSProperties = {
  position: "sticky",
  top: 16,
  padding: "var(--space-2)",
  borderRadius: "var(--radius-control)",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(0,0,0,0.06)",
  fontSize: 13,
  lineHeight: 1.45,
  color: "var(--color-text-secondary)",
};

const asideTitleStyle: CSSProperties = {
  fontWeight: 500,
  color: "var(--color-text-primary)",
  marginBottom: 6,
};

const asideDekStyle: CSSProperties = {
  margin: "0 0 10px",
};

const asideListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: "grid",
  gap: 6,
};
