"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import ProjectCardLift from "@/components/ProjectCardLift";
import NortheastArrow from "@/components/icons/NortheastArrow";
import { useIsMobile } from "@/components/useIsMobile";
import DockTooltipPortal from "./DockTooltipPortal";
import { isDockVariant } from "./dockVariants";
import { HilabArrowIcon, HilabChipArrow, HilabPlayIcon } from "./icons";
import type { CardKind, DockPlacementMode, LabProject, PillVariantId, VariantId } from "./types";
import { isPillVariant, kindLabel, kindShort, pillCopy } from "./types";
import { usePointerFollow } from "./usePointerFollow";

function pillOffset(variant: PillVariantId) {
  if (variant === "cursor-pill-icon") return { x: 18, y: 20 };
  if (variant === "cursor-pill-compact") return { x: 12, y: 14 };
  return { x: 14, y: 16 };
}

function pillLerp(variant: PillVariantId) {
  if (variant === "cursor-pill-compact") return 0.38;
  if (variant === "cursor-pill-icon") return 0.22;
  return 0.18;
}

function PillContent({ kind, variant }: { kind: CardKind; variant: PillVariantId }) {
  const showIcon = variant !== "cursor-pill-compact" || kind !== "both";
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
  const large = variant !== "cursor-pill-compact";

  return (
    <span className={large ? "hilab-pill hilab-pill--14" : "hilab-pill"}>
      {showIcon && icon}
      {pillCopy(kind, variant)}
    </span>
  );
}

export default function LabDemoCard({
  project,
  variant,
  dockPlacement,
  onMorphActiveChange,
}: {
  project: LabProject;
  variant: VariantId;
  dockPlacement: DockPlacementMode;
  onMorphActiveChange: (active: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const staticUi = isMobile;
  const [hovered, setHovered] = useState(false);
  const [entering, setEntering] = useState(false);
  const [dockLeaving, setDockLeaving] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [morphPos, setMorphPos] = useState({ x: 0, y: 0 });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dockLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pillVariant = isPillVariant(variant) ? variant : null;
  const offset = pillVariant ? pillOffset(pillVariant) : { x: 14, y: 16 };

  const { pos, setTarget, snapTo, stop } = usePointerFollow({
    lerp: pillVariant ? pillLerp(pillVariant) : 0.2,
    enabled: !!pillVariant && hovered && !staticUi,
  });

  const kind = project.kind;
  const showPill = !!pillVariant && (hovered || staticUi);
  const dockVariant = isDockVariant(variant);
  const dockFollow = dockVariant && dockPlacement === "cursor-follow" && !staticUi;
  const dockAnchored = dockVariant && (dockPlacement === "anchored" || staticUi);
  const showDock =
    (dockAnchored && (hovered || staticUi)) || (dockFollow && hovered);
  const showChip = variant === "corner-chip" && (hovered || staticUi);
  const showMorph = variant === "cursor-morph" && hovered && !staticUi;
  const showInline = variant === "inline-subtext";

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (dockFollow) {
        setPointer({ x: e.clientX, y: e.clientY });
      }
      if (pillVariant) {
        setTarget(e.clientX + offset.x, e.clientY + offset.y);
      }
      if (variant === "cursor-morph" && !staticUi) {
        setMorphPos({ x: e.clientX, y: e.clientY });
      }
    },
    [dockFollow, offset.x, offset.y, pillVariant, setTarget, staticUi, variant],
  );

  const onEnter = useCallback(
    (e: React.PointerEvent) => {
      setHovered(true);
      setDockLeaving(false);
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
      if (dockFollow) {
        setPointer({ x: e.clientX, y: e.clientY });
      }
      if (variant === "cursor-morph" && !staticUi) onMorphActiveChange(true);
      if (pillVariant) {
        snapTo(e.clientX + offset.x, e.clientY + offset.y);
        setEntering(true);
        if (enterTimer.current) clearTimeout(enterTimer.current);
        enterTimer.current = setTimeout(() => setEntering(false), reduced ? 0 : 150);
      }
      if (variant === "cursor-morph" && !staticUi) {
        setMorphPos({ x: e.clientX, y: e.clientY });
      }
    },
    [dockFollow, offset.x, offset.y, onMorphActiveChange, pillVariant, reduced, snapTo, staticUi, variant],
  );

  const onLeave = useCallback(() => {
    const wasDockFollow = dockFollow && hovered;
    setHovered(false);
    setEntering(false);
    stop();
    if (wasDockFollow) {
      setDockLeaving(true);
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
      dockLeaveTimer.current = setTimeout(() => setDockLeaving(false), 80);
    } else {
      setDockLeaving(false);
    }
    if (variant === "cursor-morph") onMorphActiveChange(false);
  }, [dockFollow, hovered, onMorphActiveChange, stop, variant]);

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
    };
  }, []);

  const pillPortal =
    showPill && pillVariant && !staticUi && typeof document !== "undefined"
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
            <PillContent kind={kind} variant={pillVariant} />
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

  const dockPortal =
    dockVariant && (showDock || dockLeaving)
      ? (
          <DockTooltipPortal
            variant={variant}
            kind={kind}
            visible={showDock}
            leaving={dockLeaving}
            placement={staticUi ? "anchored" : dockPlacement}
            anchorEl={anchorEl}
            pointer={pointer}
          />
        )
      : null;

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
          <div className="project-media" style={{ position: "relative" }}>
            <div
              ref={setAnchorEl}
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

              {pillVariant && staticUi && (
                <div className="hilab-static-pill">
                  <PillContent kind={kind} variant={pillVariant} />
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
      {dockPortal}
    </>
  );
}
