"use client";

import { motion } from "framer-motion";
import { useDialKit } from "dialkit";
import type { ReactNode, CSSProperties } from "react";

const PS3_EASE: [number, number, number, number]    = [0.22, 1, 0.36, 1];
const PS3_OPACITY: [number, number, number, number] = [0.16, 1, 0.3,  1];

interface Props {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
  y?: number;
}

export function ScrollReveal({ children, delay = 0, style, className, y: yProp }: Props) {
  const dk = useDialKit("ScrollReveal", {
    y:              [16,   0,    80],
    yDuration:      [0.95, 0.1,  2.5],
    opacityDuration:[0.75, 0.1,  2.5],
    viewportMargin: [-60, -300,  0],
  });
  const y = yProp ?? dk.y;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: `${dk.viewportMargin}px` }}
      transition={{
        opacity: { duration: dk.opacityDuration, ease: PS3_OPACITY, delay },
        y:       { duration: dk.yDuration,       ease: PS3_EASE,    delay },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container — children animate in sequence
interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  style?: CSSProperties;
  className?: string;
}

export function StaggerReveal({ children, stagger = 0.07, delay = 0, style, className }: StaggerProps) {
  const dk = useDialKit("StaggerReveal", {
    stagger: [0.07, 0, 0.4],
  });
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: dk.stagger ?? stagger, delayChildren: delay } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child item for StaggerReveal
export function StaggerItem({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: PS3_EASE } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}
