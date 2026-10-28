"use client";

import { useEffect, useState } from "react";
import { useDialKitController } from "dialkit";
import { motion, useReducedMotion } from "motion/react";
import { playUiSound, unlockUiSounds, warmUiSounds } from "@/lib/uiSound";
import {
  CONCERT_PHOTOS,
  KEYBOARD_PHOTOS,
  YOUTUBE_PLACEHOLDER,
  creditLine,
  type ArchivePhoto,
  type LayoutId,
} from "../data";
import { LAYOUT_SELECT, isLayoutId } from "../layoutOptions";

const KEYCAPS = [
  "Esc",
  "Q",
  "W",
  "E",
  "R",
  "A",
  "S",
  "D",
  "F",
  "Z",
  "X",
  "C",
  "V",
  "Sp",
  "En",
];

export default function Setlist({
  onLayout,
}: {
  onLayout: (next: LayoutId) => void;
}) {
  const reduce = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);
  const [active, setActive] = useState<ArchivePhoto | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState<string | null>(null);

  const dial = useDialKitController(
    "Setlist",
    {
      layout: { ...LAYOUT_SELECT, default: "setlist" },
      type: {
        size: [28, 16, 48, 1],
        lineGap: [10, 2, 28, 1],
      },
      reveal: {
        size: [220, 120, 360, 4],
      },
      follow: {
        spring: { type: "spring" as const, visualDuration: 0.28, bounce: 0.18 },
      },
      entrance: {
        spring: { type: "spring" as const, visualDuration: 0.4, bounce: 0.22 },
      },
      replay: { type: "action" as const, label: "Replay entrance" },
    },
    {
      id: "archive-lab-setlist",
      persist: true,
      onAction: (path) => {
        if (path === "replay") setReplayKey((n) => n + 1);
      },
    },
  );

  const p = dial.values;

  useEffect(() => {
    if (p.layout !== "setlist") dial.setValue("layout", "setlist");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount sync only
  }, []);

  useEffect(() => {
    if (isLayoutId(p.layout) && p.layout !== "setlist") onLayout(p.layout);
  }, [p.layout, onLayout]);

  useEffect(() => {
    warmUiSounds();
  }, []);

  const followT = reduce ? { duration: 0 } : p.follow.spring;
  const enterT = reduce ? { duration: 0 } : p.entrance.spring;

  return (
    <div className="al-dir al-setlist" data-layout="setlist">
      <header className="al-intro-block">
        <motion.p
          key={`intro-${replayKey}`}
          className="al-intro"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enterT}
        >
          These concert photos are mine, and I build keyboards on{" "}
          <a href={YOUTUBE_PLACEHOLDER} target="_blank" rel="noreferrer">
            YouTube
          </a>
          .
        </motion.p>
      </header>

      <div className="al-setlist-grid">
        <section className="al-poster">
          <div className="al-poster-stamp">Live</div>
          <h2 className="al-poster-title">Setlist</h2>
          <p className="al-poster-sub">Hover a line. The photo follows.</p>
          <ol className="al-lines" style={{ gap: p.type.lineGap }}>
            {CONCERT_PHOTOS.map((photo, i) => (
              <motion.li
                key={`${photo.id}-${replayKey}`}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...enterT, delay: reduce ? 0 : i * 0.04 }}
              >
                <button
                  type="button"
                  className="al-line"
                  style={{ fontSize: p.type.size }}
                  onPointerEnter={(e) => {
                    setActive(photo);
                    setCursor({ x: e.clientX, y: e.clientY });
                  }}
                  onPointerMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
                  onPointerLeave={() =>
                    setActive((cur) => (cur?.id === photo.id ? null : cur))
                  }
                  data-ui-sound="option"
                >
                  <span className="al-line-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="al-line-main">
                    {photo.artist}
                    <span className="al-line-meta">
                      {photo.venue} · {photo.year}
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="al-spec">
          <h2 className="al-poster-title">Keyboards</h2>
          <p className="al-poster-sub">Spec sheet. Press a keycap for the click.</p>
          <div className="al-spec-photos">
            {KEYBOARD_PHOTOS.map((photo) => (
              <figure key={photo.id} className="al-spec-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} draggable={false} />
                <figcaption>{creditLine(photo)}</figcaption>
              </figure>
            ))}
          </div>
          <div className="al-keygrid" aria-label="Keycap grid">
            {KEYCAPS.map((cap) => (
              <motion.button
                key={cap}
                type="button"
                className="al-keycap"
                data-ui-sound="push"
                animate={
                  pressed === cap ? { y: 3, scale: 0.96 } : { y: 0, scale: 1 }
                }
                transition={followT}
                onPointerDown={() => {
                  unlockUiSounds();
                  playUiSound("push");
                  setPressed(cap);
                }}
                onPointerUp={() => setPressed(null)}
                onPointerLeave={() => setPressed((c) => (c === cap ? null : c))}
              >
                {cap}
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {active ? (
        <motion.div
          className="al-follow"
          style={{
            width: `${p.reveal.size}px`,
            height: `${p.reveal.size * 1.15}px`,
          }}
          initial={false}
          animate={{
            x: cursor.x + 18,
            y: cursor.y - p.reveal.size * 0.35,
            opacity: 1,
            scale: 1,
          }}
          transition={followT}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.src} alt={active.alt} draggable={false} />
          <span>{creditLine(active)}</span>
        </motion.div>
      ) : null}
    </div>
  );
}
