"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDialKitController } from "dialkit";
import { motion, useReducedMotion } from "motion/react";
import {
  CONCERT_PHOTOS,
  KEYBOARD_PHOTOS,
  YOUTUBE_PLACEHOLDER,
  creditLine,
  type ArchivePhoto,
  type LayoutId,
} from "../data";
import { LAYOUT_SELECT, isLayoutId } from "../layoutOptions";

export default function Turntable({
  onLayout,
}: {
  onLayout: (next: LayoutId) => void;
}) {
  const reduce = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);
  const [angle, setAngle] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const dial = useDialKitController(
    "Turntable",
    {
      layout: { ...LAYOUT_SELECT, default: "turntable" },
      orbit: {
        radius: [220, 120, 360, 4],
        itemSize: [96, 56, 160, 2],
        rotationSpeed: [0.18, 0.02, 0.6, 0.01],
      },
      snap: {
        spring: { type: "spring" as const, visualDuration: 0.45, bounce: 0.28 },
      },
      entrance: {
        spring: { type: "spring" as const, visualDuration: 0.5, bounce: 0.2 },
      },
      concerts: true,
      replay: { type: "action" as const, label: "Replay entrance" },
    },
    {
      id: "archive-lab-turntable",
      persist: true,
      onAction: (path) => {
        if (path === "replay") {
          setReplayKey((n) => n + 1);
          setAngle(0);
        }
      },
    },
  );

  const p = dial.values;

  useEffect(() => {
    if (p.layout !== "turntable") dial.setValue("layout", "turntable");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount sync only
  }, []);

  useEffect(() => {
    if (isLayoutId(p.layout) && p.layout !== "turntable") onLayout(p.layout);
  }, [p.layout, onLayout]);

  const orbitTag: "concerts" | "keyboards" = p.concerts ? "concerts" : "keyboards";
  const photos: ArchivePhoto[] =
    orbitTag === "concerts" ? CONCERT_PHOTOS : KEYBOARD_PHOTOS;

  const count = Math.max(photos.length, 1);
  const step = (Math.PI * 2) / count;

  const activeIndex = useMemo(() => {
    let best = 0;
    let bestScore = Infinity;
    for (let i = 0; i < count; i++) {
      const a = angle + i * step;
      const score = Math.abs(Math.sin(a) - 1);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }, [angle, count, step]);

  const active = photos[activeIndex] ?? photos[0];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY + e.deltaX;
      setAngle((prev) => prev + delta * 0.025 * p.orbit.rotationSpeed);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [p.orbit.rotationSpeed]);

  useEffect(() => {
    if (reduce) return;
    const target = Math.PI / 2 - activeIndex * step;
    let diff = target - angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) < 0.03 || Math.abs(diff) > 0.55) return;
    const id = window.setTimeout(() => {
      setAngle((prev) => prev + diff * 0.14);
    }, 32);
    return () => window.clearTimeout(id);
  }, [activeIndex, angle, reduce, step]);

  const enterT = reduce ? { duration: 0 } : p.entrance.spring;
  const snapT = reduce ? { duration: 0 } : p.snap.spring;

  return (
    <div className="al-dir al-turntable" data-layout="turntable" ref={wrapRef}>
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

      <div className="al-orbit-toolbar">
        <button
          type="button"
          className={orbitTag === "concerts" ? "is-on" : undefined}
          onClick={() => dial.setValue("concerts", true)}
          data-ui-sound="option"
        >
          Concerts
        </button>
        <button
          type="button"
          className={orbitTag === "keyboards" ? "is-on" : undefined}
          onClick={() => dial.setValue("concerts", false)}
          data-ui-sound="option"
        >
          Keyboards
        </button>
        <span className="al-orbit-hint">Scroll to spin</span>
      </div>

      <div className="al-orbit-stage" key={`${orbitTag}-${replayKey}`}>
        <motion.div
          className="al-orbit-hero"
          key={active?.id}
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={snapT}
        >
          {active ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.src} alt={active.alt} draggable={false} />
              <figcaption>{creditLine(active)}</figcaption>
            </>
          ) : null}
        </motion.div>

        <div
          className="al-orbit-ring"
          style={{
            width: `${p.orbit.radius * 2}px`,
            height: `${p.orbit.radius * 2}px`,
          }}
        >
          {photos.map((photo, i) => {
            const a = angle + i * step;
            const x = Math.cos(a) * p.orbit.radius;
            const y = Math.sin(a) * p.orbit.radius;
            const isActive = i === activeIndex;
            const depth = (Math.sin(a) + 1) / 2;
            return (
              <motion.button
                key={photo.id}
                type="button"
                className={`al-orbit-item${isActive ? " is-active" : ""}`}
                style={{
                  width: `${p.orbit.itemSize}px`,
                  height: `${p.orbit.itemSize}px`,
                  marginLeft: `${-p.orbit.itemSize / 2}px`,
                  marginTop: `${-p.orbit.itemSize / 2}px`,
                  zIndex: Math.round(depth * 20) + (isActive ? 30 : 0),
                }}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: 0.45 + depth * 0.55,
                  x,
                  y,
                  scale: isActive ? 1.15 : 0.75 + depth * 0.25,
                }}
                transition={snapT}
                onClick={() => setAngle(Math.PI / 2 - i * step)}
                data-ui-sound="option"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} draggable={false} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
