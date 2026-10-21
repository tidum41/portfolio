import type { CSSProperties, ReactNode } from "react";
import "../dev/dialogue-canvas-v2/review-areal.css";

const arealBase = process.env.NEXT_PUBLIC_AREAL_URL?.replace(/\/$/, "");

const arealFaceStyle: CSSProperties | undefined = arealBase
  ? {
      ["--areal-regular-src" as string]: `url("${arealBase}/ABCAreal-Regular.woff2")`,
      ["--areal-medium-src" as string]: `url("${arealBase}/ABCAreal-Medium.woff2")`,
    }
  : undefined;

export default function DialogueLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dialogue-review-areal dialogue-case-study-areal" style={arealFaceStyle}>
      {children}
    </div>
  );
}
