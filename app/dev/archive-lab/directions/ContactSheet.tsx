"use client";

import { useEffect, useMemo, useState } from "react";
import { useDialKitController } from "dialkit";
import { motion, useReducedMotion } from "motion/react";
import {
  ARCHIVE_PHOTOS,
  YOUTUBE_PLACEHOLDER,
  creditLine,
  type ArchivePhoto,
  type LayoutId,
} from "../data";
import { LAYOUT_SELECT, isLayoutId } from "../layoutOptions";

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Pose = { x: number; y: number; rot: number; z: number };

function buildPile(scatter: number, rotRange: number): Pose[] {
  return ARCHIVE_PHOTOS.map((_, i) => {
    const a = seeded(i + 1);
    const b = seeded(i + 17);
    const c = seeded(i + 41);
    const angle = a * Math.PI * 2;
    const dist = (0.15 + b * 0.85) * scatter;
    return {
      x: Math.cos(angle) * dist * 1.15,
      y: Math.sin(angle) * dist * 0.75 + i * 6,
      rot: (c - 0.5) * 2 * rotRange,
      z: i,
    };
  });
}

export default function ContactSheet({
  onLayout,
}: {
  onLayout: (next: LayoutId) => void;
}) {
  const reduce = useReducedMotion();
  const [replayKey, setReplayKey] = useState(0);
  const [order, setOrder] = useState(() => ARCHIVE_PHOTOS.map((_, i) => i));
  const [lifted, setLifted] = useState<string | null>(null);

  const dial = useDialKitController(
    "Contact sheet",
    {
      layout: { ...LAYOUT_SELECT, default: "contact" },
      pile: {
        scatter: [200, 40, 320, 4],
        rotationRange: [16, 0, 40, 1],
        printSize: [168, 120, 260, 4],
      },
      shadow: {
        _collapsed: true,
        blur: [18, 0, 48, 1],
        y: [10, 0, 32, 1],
        opacity: [0.28, 0, 0.7, 0.01],
      },
      spring: { type: "spring" as const, visualDuration: 0.35, bounce: 0.32 },
      replay: { type: "action" as const, label: "Replay entrance" },
    },
    {
      id: "archive-lab-contact",
      persist: true,
      onAction: (path) => {
        if (path === "replay") setReplayKey((n) => n + 1);
      },
    },
  );

  const p = dial.values;

  useEffect(() => {
    if (p.layout !== "contact") dial.setValue("layout", "contact");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount sync only
  }, []);

  useEffect(() => {
    if (isLayoutId(p.layout) && p.layout !== "contact") onLayout(p.layout);
  }, [p.layout, onLayout]);

  const pile = useMemo(
    () => buildPile(p.pile.scatter, p.pile.rotationRange),
    [p.pile.scatter, p.pile.rotationRange, replayKey],
  );

  useEffect(() => {
    setOrder(ARCHIVE_PHOTOS.map((_, i) => i));
  }, [replayKey]);

  const transition = reduce ? { duration: 0 } : p.spring;

  return (
    <div className="al-dir al-contact" data-layout="contact">
      <header className="al-intro-block">
        <motion.p
          key={`intro-${replayKey}`}
          className="al-intro"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          These concert photos are mine, and I build keyboards on{" "}
          <a href={YOUTUBE_PLACEHOLDER} target="_blank" rel="noreferrer">
            YouTube
          </a>
          .
        </motion.p>
      </header>

      <div className="al-table" key={replayKey}>
        {order.map((photoIndex, stackIndex) => {
          const photo = ARCHIVE_PHOTOS[photoIndex] as ArchivePhoto;
          const pose = pile[photoIndex] ?? pile[0];
          const isLifted = lifted === photo.id;
          return (
            <motion.figure
              key={`${photo.id}-${replayKey}`}
              className="al-print"
              style={{
                width: `${p.pile.printSize}px`,
                left: "50%",
                top: "42%",
                marginLeft: `${-p.pile.printSize / 2}px`,
                marginTop: `${-(p.pile.printSize * 0.65) / 2}px`,
                zIndex: isLifted ? 80 : pose.z + stackIndex,
                boxShadow: `0 ${p.shadow.y}px ${p.shadow.blur}px rgba(0,0,0,${p.shadow.opacity})`,
              }}
              initial={
                reduce
                  ? false
                  : {
                      opacity: 0,
                      x: pose.x,
                      y: pose.y + 48,
                      rotate: pose.rot + 12,
                      scale: 0.92,
                    }
              }
              animate={{
                opacity: 1,
                x: pose.x,
                y: pose.y,
                rotate: pose.rot,
                scale: isLifted ? 1.06 : 1,
              }}
              transition={transition}
              drag={!reduce}
              dragMomentum={false}
              dragElastic={0.12}
              whileDrag={reduce ? undefined : { scale: 1.08, zIndex: 90 }}
              onHoverStart={() => setLifted(photo.id)}
              onHoverEnd={() => setLifted((cur) => (cur === photo.id ? null : cur))}
              onPointerDown={() => {
                setOrder((prev) => {
                  const next = prev.filter((i) => i !== photoIndex);
                  next.push(photoIndex);
                  return next;
                });
              }}
            >
              <div className="al-print-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} draggable={false} />
              </div>
              <figcaption className="al-print-caption">
                {creditLine(photo)}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
    </div>
  );
}
