"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import ProjectCardLift from "@/components/ProjectCardLift";
import NortheastArrow from "@/components/icons/NortheastArrow";
import { useIsMobile } from "@/components/useIsMobile";
import { HilabArrowIcon, HilabChipArrow, HilabPlayIcon } from "./icons";
import type { CardKind, LabProject, VariantId } from "./types";
import { kindLabel, kindShort } from "./types";
import { usePointerFollow } from "./usePointerFollow";

function PillContent({ kind }: { kind: CardKind }) {
  const icon =
    kind === "demo" ? (
      <HilabPlayIcon size={13} />
    ) : kind === "case-study" ? (
      <HilabArrowIcon size={13} />
    ) : (
      <>
        <HilabArrowIcon size={11} />
        <HilabPlayIcon size={11} />
      </>
    );

  return (
    <span className="hilab-pill">
      {icon}
      {kindLabel(kind)}
    </span>
  );
}

export default function LabDemoCard({
  project,
  variant,
  onMorphActiveChange,
}: {
  project: LabProject;
  variant: VariantId;
  morphActive: boolean;
  onMorphActiveChange: (active: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const staticUi = isMobile || !!reduced;
  const [hovered, setHovered] = useState(false);
  const [entering, setEntering] = useState(false);
  const [morphPos, setMorphPos] = useState({ x: 0, y: 0 });
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pillActive = variant === "cursor-pill";
  const offset = { x: 14, y: 16 };

  const { pos, setTarget, snapTo, stop } = usePointerFollow({
    lerp: 0.2,
    enabled: pillActive && hovered && !staticUi,
  });

  const kind = project.kind;
  const showPill = pillActive && (hovered || staticUi);
  const showDock = variant === "dock-tooltip" && (hovered || staticUi);
  const showChip = variant === "corner-chip" && (hovered || staticUi);
  const showMorph = variant === "cursor-morph" && hovered && !staticUi;
  const showInline = variant === "inline-subtext";

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (pillActive) {
        setTarget(e.clientX + offset.x, e.clientY + offset.y);
      }
      if (variant === "cursor-morph" && !staticUi) {
        setMorphPos({ x: e.clientX, y: e.clientY });
      }
    },
    [offset.x, offset.y, pillActive, setTarget, staticUi, variant],
  );

  const onEnter = useCallback(
    (e: React.PointerEvent) => {
      setHovered(true);
      if (variant === "cursor-morph" && !staticUi) onMorphActiveChange(true);
      if (pillActive) {
        snapTo(e.clientX + offset.x, e.clientY + offset.y);
        setEntering(true);
        if (enterTimer.current) clearTimeout(enterTimer.current);
        enterTimer.current = setTimeout(() => setEntering(false), reduced ? 0 : 150);
      }
      if (variant === "cursor-morph" && !staticUi) {
        setMorphPos({ x: e.clientX, y: e.clientY });
      }
    },
    [offset.x, offset.y, onMorphActiveChange, pillActive, reduced, snapTo, staticUi, variant],
  );

  const onLeave = useCallback(() => {
    setHovered(false);
    setEntering(false);
    stop();
    if (variant === "cursor-morph") onMorphActiveChange(false);
  }, [onMorphActiveChange, stop, variant]);

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
    };
  }, []);

  const pillPortal =
    showPill && pillActive && !staticUi && typeof document !== "undefined"
      ? createPortal(
          <div
            className="hilab-pill-portal"
            data-visible="true"
            data-entering={entering ? "true" : "false"}
            style={
              {
                "--hilab-px": `${pos.x}px`,
                "--hilab-py": `${pos.y}px`,
              } as React.CSSProperties
            }
          >
            <PillContent kind={kind} />
          </div>,
          document.body,
        )
      : null;

  const morphPortal =
    showMorph && typeof document !== "undefined"
      ? createPortal(
          <div
            className="hilab-morph-portal"
            data-visible="true"
            style={
              {
                "--hilab-mx": `${morphPos.x}px`,
                "--hilab-my": `${morphPos.y}px`,
              } as React.CSSProperties
            }
          >
            <div className="hilab-morph-portal__disc">{kindLabel(kind)}</div>
          </div>,
          document.body,
        )
      : null;

  const dockReserve = variant === "dock-tooltip";

  return (
    <>
      <div
        className="project-card portfolio-grid-card hilab-card"
        data-hovered={hovered || staticUi ? "true" : "false"}
        data-static={staticUi ? "true" : "false"}
        data-grid-card={project.id}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerMove={onMove}
        style={{ gap: 8 }}
      >
        <ProjectCardLift style={{ gap: 8 }}>
          <div
            className="project-media"
            style={
              dockReserve
                ? { position: "relative", paddingTop: 40, marginTop: -40 }
                : { position: "relative" }
            }
          >
            {variant === "dock-tooltip" && (
              <div className="hilab-dock" data-visible={showDock ? "true" : "false"} aria-hidden>
                <div className="hilab-dock__bubble">{kindLabel(kind)}</div>
                <div className="hilab-dock__caret" />
              </div>
            )}

            <div
              className="hilab-card__media project-img-wrap"
              style={{ aspectRatio: project.aspectRatio, overflow: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hilab-card__img" src={project.imageUrl} alt="" />

              {variant === "corner-chip" && (
                <div className="hilab-chip" data-visible={showChip ? "true" : "false"} aria-hidden>
                  {kindShort(kind)}
                  <HilabChipArrow size={13} />
                </div>
              )}

              {pillActive && staticUi && (
                <div className="hilab-static-pill">
                  <PillContent kind={kind} />
                </div>
              )}

              {variant === "cursor-morph" && staticUi && (
                <div className="hilab-static-pill">
                  <span className="hilab-pill hilab-pill--14">{kindLabel(kind)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="hilab-card__title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {project.title}
              {kind === "demo" && <NortheastArrow size={13} color="var(--color-link-blue)" />}
            </p>
            {showInline ? (
              <div className="hilab-inline-slot" aria-hidden={!hovered && !staticUi}>
                <span className="hilab-inline-reveal">{kindLabel(kind)}</span>
              </div>
            ) : (
              project.subtitle && <p className="hilab-card__sub">{project.subtitle}</p>
            )}
          </div>
        </ProjectCardLift>
      </div>
      {pillPortal}
      {morphPortal}
    </>
  );
}
