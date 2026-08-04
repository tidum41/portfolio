"use client";

import { type CSSProperties, type ReactNode } from "react";

/**
 * Layout wrapper inside `.project-card`. Hover chrome (underlay / Mux wash)
 * lives in CSS on the media frame — this just stacks media + label.
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
  return (
    <div
      className={["project-card-lift", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
