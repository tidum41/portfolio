import type { ReactNode } from "react";
import { DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

const BAR_BG = "rgba(22, 20, 18, 0.94)";
const ICON = "rgba(255, 255, 255, 0.92)";
const MUTED = "rgba(255, 255, 255, 0.55)";

function IconBtn({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </span>
  );
}

export function DialoguePlayerControlBar({ height = 36 }: { height?: number }) {
  const icon = 13;
  return (
    <div
      style={{
        height,
        boxSizing: "border-box",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: BAR_BG,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        color: ICON,
      }}
    >
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M5.5 3.2v9.6L12.8 8 5.5 3.2Z" fill="currentColor" />
        </svg>
      </IconBtn>
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.5 5.2v5.6M6.2 4.2v7.6M8.9 5.2v5.6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path d="M2.8 8h2.2M7.5 8h2.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </IconBtn>
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M12.5 5.2v5.6M9.8 4.2v7.6M7.1 5.2v5.6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path d="M13.2 8h-2.2M8.5 8H6.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </IconBtn>
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.01em", flexShrink: 0 }}>02:29</span>
      <div
        style={{
          flex: 1,
          minWidth: 24,
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.22)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "42%",
            height: "100%",
            borderRadius: 2,
            background: "rgba(255,255,255,0.88)",
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: MUTED, flexShrink: 0 }}>17:12</span>
      <span style={{ fontSize: 10, fontWeight: 500, flexShrink: 0 }}>1x</span>
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.2 6.2c0-1.6 1.3-2.8 2.8-2.8.8 0 1.5.3 2 .9V3.2h1.2v5.2H6.8V7.5c-.3-.4-.8-.6-1.3-.6-.9 0-1.6.7-1.6 1.6v2.4H3.2V6.2Z"
            fill="currentColor"
          />
          <path d="M11.2 9.8h2.4v1.2h-2.4V9.8Z" fill="currentColor" />
        </svg>
      </IconBtn>
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="3" y="4" width="7" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8.5" y="6.5" width="4.5" height="3.5" rx="0.6" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </IconBtn>
      <IconBtn>
        <svg width={icon} height={icon} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.5 3.5h9v9h-9v-9Zm1.2 1.2v6.6h6.6V4.7H4.7Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      </IconBtn>
    </div>
  );
}
