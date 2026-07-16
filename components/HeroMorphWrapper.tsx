"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  slug: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function HeroMorphWrapper({ slug, style, children }: Props) {
  return (
    <motion.div
      layoutId={`hero-${slug}`}
      style={style}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
