"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CARD_HOVER_SCALE, CARD_HOVER_SPRING } from "@/components/cardHover";

/**
 * Inner wrapper for `.project-card` tiles. Owns the press-in scale so the
 * underlay (::before on `.project-card`) can stay put while the content
 * settles with a weighted spring — CSS duration transitions felt floaty
 * here; the spring carries the mass.
 */
export default function ProjectCardLift({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={["project-card-lift", className].filter(Boolean).join(" ")}
      style={style}
      {...(!reduced
        ? { whileHover: { scale: CARD_HOVER_SCALE }, transition: CARD_HOVER_SPRING }
        : {})}
    >
      {children}
    </motion.div>
  );
}
