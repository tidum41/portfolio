"use client";

import { LazyMotion, domMax, m } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  slug: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function HeroMorphWrapper({ slug, style, children }: Props) {
  // layoutId needs the layout feature set; the rest of the site runs on the
  // smaller domAnimation set loaded by MotionFeatures.
  return (
    <LazyMotion features={domMax}>
    <m.div
      layoutId={`hero-${slug}`}
      style={style}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
    </LazyMotion>
  );
}
