"use client";

import type { ReactNode, RefObject } from "react";

/**
 * The soft well a looping product moment sits on. Play and pause sit on the well,
 * never on the product UI. The loop itself is aria-hidden; `description` says what it shows.
 */
export default function LoopFrame({
  frameRef,
  playing,
  onToggle,
  reduced,
  description,
  className,
  children,
}: {
  frameRef: RefObject<HTMLDivElement | null>;
  playing: boolean;
  onToggle: () => void;
  reduced: boolean;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div ref={frameRef} className={["jp-well", className ?? ""].join(" ")}>
      <p className="jp-sr">{description}</p>
      <div className="jp-well__stage" aria-hidden="true">
        {children}
      </div>
      {reduced ? null : (
        <button type="button" className="jp-well__play" onClick={onToggle} aria-label={playing ? "Pause animation" : "Play animation"}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor" /><rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l7-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5z" fill="currentColor" /></svg>
          )}
        </button>
      )}
    </div>
  );
}
