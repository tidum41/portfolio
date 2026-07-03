"use client";

import { motion } from "framer-motion";

type CubicBezier = [number, number, number, number];
const EASE_OPACITY: CubicBezier = [0.16, 1, 0.3, 1];
const EASE_Y: CubicBezier = [0.22, 1, 0.36, 1];

const FADE_UP = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: {
    opacity: { duration: 1.1, ease: EASE_OPACITY },
    y: { duration: 1.4, ease: EASE_Y },
  },
};

export default function HeroText() {
  const FADE_UP_D = (delay: number) => ({
    ...FADE_UP,
    transition: {
      opacity: { duration: 1.1, ease: EASE_OPACITY, delay },
      y: { duration: 1.4, ease: EASE_Y, delay },
    },
  });

  return (
    <>
      <div style={{ position: "relative", zIndex: 1, width: "50%", minWidth: 340 }}>
        <motion.h1
          {...FADE_UP}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(26px, 2.8vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {"I'm Mudit, a product designer with a love for craft, curiosity, and rabbit holes"}
        </motion.h1>
      </div>

      <motion.p
        {...FADE_UP_D(0.25)}
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-sans)",
          fontSize: 17,
          lineHeight: "25.5px",
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        cognitive science at <span style={{ color: "rgb(53, 121, 204)", fontWeight: 500 }}>ucla</span>
      </motion.p>
    </>
  );
}
