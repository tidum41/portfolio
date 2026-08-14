"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useDialKit } from "dialkit";
import {
  CASE_STUDY_ENTRANCE_DEFAULTS,
  EASE_OPACITY,
  EASE_Y,
  ENTRANCE_DEFAULTS,
  SPAWN_FROM_OPACITY,
  SPAWN_REST,
  cssEase,
  spawnHidden,
  type CubicBezier,
} from "@/lib/motion";

export type Copy = {
  heading: string;
  dek: string;
  body: string;
  items: [string, string, string, string];
};

export type StageProps = {
  copy: Copy;
  replayKey: number;
  autoReplay: boolean;
  twoColumn: boolean;
};

export const VARIANTS = [
  { id: "current-site", label: "Current site", hint: "CSS · 8px / 1140ms · production .ps3-enter" },
  { id: "case-study", label: "Case study", hint: "CSS · 8px / 1140ms · live .cs-open-type" },
  { id: "xmb-long", label: "XMB 450", hint: "CSS · 20px / 450ms · original Framer settle" },
  { id: "opacity-only", label: "Opacity only", hint: "PS3 fade + 8px settle · opacity and Y split" },
  { id: "split-channels", label: "Split channels", hint: "Framer · opacity + Y timed separately" },
  { id: "chorus", label: "Chorus", hint: "Two clocks · left / right stagger combo" },
  { id: "spring-settle", label: "Spring settle", hint: "DialKit spring · no scale" },
  { id: "combo", label: "Combo", hint: "Easing + optional blur / clip / scale" },
] as const;

export type VariantId = (typeof VARIANTS)[number]["id"];

export function isVariantId(value: string): value is VariantId {
  return VARIANTS.some((v) => v.id === value);
}

const persist = (id: string) =>
  ({
    id: `motion-lab-${id}`,
    persist: {
      key: `motion-lab-${id}`,
      storage: "sessionStorage" as const,
      presets: true,
    },
  }) as const;

function usePlayKey(token: string, autoReplay: boolean, replayKey: number) {
  const [tick, setTick] = useState(0);
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!autoReplay) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const id = window.setTimeout(() => setTick((n) => n + 1), 240);
    return () => window.clearTimeout(id);
  }, [token, autoReplay]);
  return `${replayKey}-${tick}`;
}

const h1Style: CSSProperties = {
  fontFamily: "var(--font-page-title)",
  fontSize: 32,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: "-0.8px",
  color: "var(--color-text-primary)",
  margin: "0 0 8px",
};

const dekStyle: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  lineHeight: 1.5,
  color: "var(--color-text-secondary, var(--color-text-primary))",
  opacity: 0.72,
  margin: "0 0 28px",
  maxWidth: 520,
};

const bodyStyle: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  lineHeight: 1.72,
  color: "var(--color-text-primary)",
  margin: "0 0 24px",
  maxWidth: 560,
  opacity: 0.88,
};

const itemStyle: CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--color-text-primary)",
  opacity: 0.7,
  margin: "0 0 8px",
  paddingLeft: 0,
};

function LoFiTiles() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
        marginTop: 20,
      }}
    >
      {["01", "02", "03"].map((k) => (
        <div
          key={k}
          style={{
            height: 92,
            borderRadius: 4,
            background: "color-mix(in srgb, var(--color-text-primary) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-text-primary) 10%, transparent)",
            display: "flex",
            alignItems: "flex-end",
            padding: 10,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          {k}
        </div>
      ))}
    </div>
  );
}

function nodes(copy: Copy): ReactNode[] {
  return [
    <h1 key="h" style={h1Style}>
      {copy.heading}
    </h1>,
    <p key="d" style={dekStyle}>
      {copy.dek}
    </p>,
    <p key="b" style={bodyStyle}>
      {copy.body}
    </p>,
    ...copy.items.map((line, i) => (
      <p key={`i${i}`} style={itemStyle}>
        {line}
      </p>
    )),
    <LoFiTiles key="tiles" />,
  ];
}

function Layout({
  twoColumn,
  children,
}: {
  twoColumn: boolean;
  children: ReactNode[];
}) {
  if (!twoColumn) {
    return <div style={{ maxWidth: 640 }}>{children}</div>;
  }
  const left = children.slice(0, 3);
  const right = children.slice(3);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
        gap: 48,
        alignItems: "start",
        maxWidth: 920,
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function toFramerTransition(
  t: {
    type: string;
    duration?: number;
    ease?: CubicBezier;
    visualDuration?: number;
    bounce?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
  },
  delay: number,
) {
  if (t.type === "easing") {
    return { duration: t.duration ?? 0.4, ease: t.ease ?? EASE_Y, delay };
  }
  return {
    type: "spring" as const,
    visualDuration: t.visualDuration,
    bounce: t.bounce,
    stiffness: t.stiffness,
    damping: t.damping,
    mass: t.mass,
    delay,
  };
}

function staggerMs(index: number, stagger: number, maxSpread: number, count: number) {
  const per = count > 1 ? Math.min(stagger, maxSpread / (count - 1)) : stagger;
  return Math.round(per * index * 1000);
}

function CssEnter({
  delayMs,
  x,
  y,
  durationS,
  fromOpacity,
  ease,
  blur = 0,
  scale = 1,
  children,
}: {
  delayMs: number;
  x: number;
  y: number;
  durationS: number;
  fromOpacity: number;
  ease: CubicBezier;
  blur?: number;
  scale?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="ml-enter"
      style={{
        ["--ml-from-opacity" as string]: fromOpacity,
        ["--ml-from-x" as string]: `${x}px`,
        ["--ml-from-y" as string]: `${y}px`,
        ["--ml-from-blur" as string]: `${blur}px`,
        ["--ml-from-scale" as string]: scale,
        animationDuration: `${durationS * 1000}ms`,
        animationTimingFunction: cssEase(ease),
        animationDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

function easeFolder(ease: CubicBezier) {
  return {
    x1: [ease[0], 0, 1, 0.01] as [number, number, number, number],
    y1: [ease[1], 0, 2, 0.01] as [number, number, number, number],
    x2: [ease[2], 0, 1, 0.01] as [number, number, number, number],
    y2: [ease[3], 0, 2, 0.01] as [number, number, number, number],
  };
}

function readEase(folder: { x1: number; y1: number; x2: number; y2: number }): CubicBezier {
  return [folder.x1, folder.y1, folder.x2, folder.y2];
}

function CssStage({
  panel,
  persistKey,
  defaults,
  copy,
  replayKey,
  autoReplay,
  twoColumn,
}: StageProps & {
  panel: string;
  persistKey?: string;
  defaults: {
    x?: number;
    y: number;
    duration: number;
    stagger: number;
    maxSpread: number;
    fromOpacity: number;
    ease: CubicBezier;
  };
}) {
  const dk = useDialKit(
    panel,
    {
      y: [defaults.y, 0, 80, 1],
      x: [defaults.x ?? 0, -40, 80, 1],
      duration: [defaults.duration, 0.08, 1.6, 0.01],
      stagger: [defaults.stagger, 0, 0.4, 0.005],
      maxSpread: [defaults.maxSpread, 0, 2, 0.01],
      fromOpacity: [defaults.fromOpacity, 0.05, 1, 0.01],
      ease: easeFolder(defaults.ease),
    },
    persist(persistKey ?? panel),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const ease = readEase(dk.ease);

  return (
    <Layout twoColumn={twoColumn} key={playKey}>
      {slots.map((node, i) => (
        <CssEnter
          key={i}
          delayMs={staggerMs(i, dk.stagger, dk.maxSpread, slots.length)}
          x={dk.x}
          y={dk.y}
          durationS={dk.duration}
          fromOpacity={dk.fromOpacity}
          ease={ease}
        >
          {node}
        </CssEnter>
      ))}
    </Layout>
  );
}

export function CurrentSiteStage(props: StageProps) {
  return (
    <CssStage
      panel="Current site"
      persistKey="current-site-v2"
      defaults={{
        y: ENTRANCE_DEFAULTS.y,
        duration: ENTRANCE_DEFAULTS.duration,
        stagger: ENTRANCE_DEFAULTS.stagger,
        maxSpread: ENTRANCE_DEFAULTS.maxSpread,
        fromOpacity: SPAWN_FROM_OPACITY,
        ease: EASE_OPACITY,
      }}
      {...props}
    />
  );
}

export function CaseStudyStage(props: StageProps) {
  return (
    <CssStage
      panel="Case study"
      persistKey="case-study-v2"
      defaults={{
        y: CASE_STUDY_ENTRANCE_DEFAULTS.y,
        x: CASE_STUDY_ENTRANCE_DEFAULTS.x,
        duration: CASE_STUDY_ENTRANCE_DEFAULTS.duration,
        stagger: CASE_STUDY_ENTRANCE_DEFAULTS.stagger,
        maxSpread: CASE_STUDY_ENTRANCE_DEFAULTS.maxSpread,
        fromOpacity: CASE_STUDY_ENTRANCE_DEFAULTS.fromOpacity ?? SPAWN_FROM_OPACITY,
        ease: EASE_OPACITY,
      }}
      {...props}
    />
  );
}

export function XmbLongStage(props: StageProps) {
  return (
    <CssStage
      panel="XMB 450"
      defaults={{
        y: 20,
        duration: 0.45,
        stagger: 0.05,
        maxSpread: 0.4,
        fromOpacity: SPAWN_FROM_OPACITY,
        ease: EASE_Y,
      }}
      {...props}
    />
  );
}

export function OpacityOnlyStage({ copy, replayKey, autoReplay, twoColumn }: StageProps) {
  const dk = useDialKit(
    "Opacity only",
    {
      y: [8, 0, 80, 1],
      fromOpacity: [SPAWN_FROM_OPACITY, 0.05, 1, 0.01],
      stagger: [0.035, 0, 0.4, 0.005],
      maxSpread: [0.2, 0, 2, 0.01],
      opacity: {
        duration: [0.38, 0.08, 1.6, 0.01],
        ease: easeFolder(EASE_OPACITY),
      },
      translate: {
        duration: [0.55, 0.08, 1.6, 0.01],
        ease: easeFolder(EASE_Y),
      },
    },
    persist("opacity-only-v2"),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const per = slots.length > 1 ? Math.min(dk.stagger, dk.maxSpread / (slots.length - 1)) : dk.stagger;
  const opacityEase = readEase(dk.opacity.ease);
  const yEase = readEase(dk.translate.ease);

  return (
    <Layout twoColumn={twoColumn} key={playKey}>
      {slots.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: dk.fromOpacity, transform: spawnHidden(0, dk.y) }}
          animate={{ opacity: 1, transform: SPAWN_REST }}
          transition={{
            opacity: { duration: dk.opacity.duration, ease: opacityEase, delay: per * i },
            transform: { duration: dk.translate.duration, ease: yEase, delay: per * i },
          }}
        >
          {node}
        </motion.div>
      ))}
    </Layout>
  );
}

export function SplitChannelsStage({ copy, replayKey, autoReplay, twoColumn }: StageProps) {
  const dk = useDialKit(
    "Split channels",
    {
      y: [16, 0, 80, 1],
      fromOpacity: [SPAWN_FROM_OPACITY, 0.05, 1, 0.01],
      stagger: [0.045, 0, 0.4, 0.005],
      maxSpread: [0.28, 0, 2, 0.01],
      opacity: {
        duration: [0.28, 0.08, 1.6, 0.01],
        ease: easeFolder(EASE_OPACITY),
      },
      translate: {
        duration: [0.42, 0.08, 1.6, 0.01],
        ease: easeFolder(EASE_Y),
      },
    },
    persist("split-channels"),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const per = slots.length > 1 ? Math.min(dk.stagger, dk.maxSpread / (slots.length - 1)) : dk.stagger;
  const opacityEase = readEase(dk.opacity.ease);
  const yEase = readEase(dk.translate.ease);

  return (
    <Layout twoColumn={twoColumn} key={playKey}>
      {slots.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: dk.fromOpacity, transform: spawnHidden(0, dk.y) }}
          animate={{ opacity: 1, transform: SPAWN_REST }}
          transition={{
            opacity: { duration: dk.opacity.duration, ease: opacityEase, delay: per * i },
            transform: { duration: dk.translate.duration, ease: yEase, delay: per * i },
          }}
        >
          {node}
        </motion.div>
      ))}
    </Layout>
  );
}

export function ChorusStage({ copy, replayKey, autoReplay, twoColumn }: StageProps) {
  const dk = useDialKit(
    "Chorus",
    {
      left: {
        y: [10, 0, 80, 1],
        duration: [0.26, 0.08, 1.6, 0.01],
        stagger: [0.03, 0, 0.4, 0.005],
        fromOpacity: [SPAWN_FROM_OPACITY, 0.05, 1, 0.01],
        ease: easeFolder(EASE_Y),
      },
      right: {
        y: [18, 0, 80, 1],
        duration: [0.4, 0.08, 1.6, 0.01],
        stagger: [0.07, 0, 0.4, 0.005],
        delay: [0.08, 0, 0.6, 0.01],
        fromOpacity: [0.5, 0.05, 1, 0.01],
        ease: easeFolder(EASE_OPACITY),
      },
    },
    persist("chorus"),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const leftNodes = slots.slice(0, 3);
  const rightNodes = slots.slice(3);
  const leftEase = readEase(dk.left.ease);
  const rightEase = readEase(dk.right.ease);
  const wrap = twoColumn;

  const leftCol = leftNodes.map((node, i) => (
    <CssEnter
      key={`l${i}`}
      delayMs={Math.round(dk.left.stagger * i * 1000)}
      x={0}
      y={dk.left.y}
      durationS={dk.left.duration}
      fromOpacity={dk.left.fromOpacity}
      ease={leftEase}
    >
      {node}
    </CssEnter>
  ));
  const rightCol = rightNodes.map((node, i) => (
    <CssEnter
      key={`r${i}`}
      delayMs={Math.round((dk.right.delay + dk.right.stagger * i) * 1000)}
      x={0}
      y={dk.right.y}
      durationS={dk.right.duration}
      fromOpacity={dk.right.fromOpacity}
      ease={rightEase}
    >
      {node}
    </CssEnter>
  ));

  if (wrap) {
    return (
      <div
        key={playKey}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: 48,
          maxWidth: 920,
        }}
      >
        <div>{leftCol}</div>
        <div>{rightCol}</div>
      </div>
    );
  }

  return (
    <div key={playKey} style={{ maxWidth: 640 }}>
      {leftCol}
      {rightCol}
    </div>
  );
}

export function SpringSettleStage({ copy, replayKey, autoReplay, twoColumn }: StageProps) {
  const dk = useDialKit(
    "Spring settle",
    {
      y: [14, 0, 80, 1],
      fromOpacity: [SPAWN_FROM_OPACITY, 0.05, 1, 0.01],
      stagger: [0.04, 0, 0.4, 0.005],
      maxSpread: [0.24, 0, 2, 0.01],
      spring: { type: "spring", visualDuration: 0.45, bounce: 0.06 },
    },
    persist("spring-settle"),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const per = slots.length > 1 ? Math.min(dk.stagger, dk.maxSpread / (slots.length - 1)) : dk.stagger;

  return (
    <Layout twoColumn={twoColumn} key={playKey}>
      {slots.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: dk.fromOpacity, transform: spawnHidden(0, dk.y) }}
          animate={{ opacity: 1, transform: SPAWN_REST }}
          transition={toFramerTransition(dk.spring, per * i)}
        >
          {node}
        </motion.div>
      ))}
    </Layout>
  );
}

export function ComboStage({ copy, replayKey, autoReplay, twoColumn }: StageProps) {
  const dk = useDialKit(
    "Combo",
    {
      y: [12, 0, 80, 1],
      x: [0, -40, 80, 1],
      duration: [0.32, 0.08, 1.6, 0.01],
      stagger: [0.045, 0, 0.4, 0.005],
      maxSpread: [0.28, 0, 2, 0.01],
      fromOpacity: [SPAWN_FROM_OPACITY, 0.05, 1, 0.01],
      ease: easeFolder(EASE_Y),
      experimental: {
        _collapsed: true,
        blur: [0, 0, 16, 0.5],
        clip: [0, 0, 48, 1],
        scale: [1, 0.92, 1.08, 0.005],
      },
    },
    persist("combo"),
  );
  const slots = nodes(copy);
  const playKey = usePlayKey(JSON.stringify(dk), autoReplay, replayKey);
  const ease = readEase(dk.ease);
  const useClip = dk.experimental.clip > 0.5;
  const useFramer = useClip || dk.experimental.scale !== 1;

  if (useFramer) {
    const per = slots.length > 1 ? Math.min(dk.stagger, dk.maxSpread / (slots.length - 1)) : dk.stagger;
    return (
      <Layout twoColumn={twoColumn} key={playKey}>
        {slots.map((node, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: dk.fromOpacity,
              transform: `${spawnHidden(dk.x, dk.y)} scale(${dk.experimental.scale})`,
              filter: `blur(${dk.experimental.blur}px)`,
              clipPath: useClip ? `inset(${dk.experimental.clip}px 0 0 0)` : "inset(0px 0 0 0)",
            }}
            animate={{
              opacity: 1,
              transform: `${SPAWN_REST} scale(1)`,
              filter: "blur(0px)",
              clipPath: "inset(0px 0 0 0)",
            }}
            transition={{ duration: dk.duration, ease, delay: per * i }}
          >
            {node}
          </motion.div>
        ))}
      </Layout>
    );
  }

  return (
    <Layout twoColumn={twoColumn} key={playKey}>
      {slots.map((node, i) => (
        <CssEnter
          key={i}
          delayMs={staggerMs(i, dk.stagger, dk.maxSpread, slots.length)}
          x={dk.x}
          y={dk.y}
          durationS={dk.duration}
          fromOpacity={dk.fromOpacity}
          ease={ease}
          blur={dk.experimental.blur}
          scale={1}
        >
          {node}
        </CssEnter>
      ))}
    </Layout>
  );
}

export function VariantStage({
  id,
  ...props
}: StageProps & { id: VariantId }) {
  switch (id) {
    case "current-site":
      return <CurrentSiteStage {...props} />;
    case "case-study":
      return <CaseStudyStage {...props} />;
    case "xmb-long":
      return <XmbLongStage {...props} />;
    case "opacity-only":
      return <OpacityOnlyStage {...props} />;
    case "split-channels":
      return <SplitChannelsStage {...props} />;
    case "chorus":
      return <ChorusStage {...props} />;
    case "spring-settle":
      return <SpringSettleStage {...props} />;
    case "combo":
      return <ComboStage {...props} />;
  }
}
