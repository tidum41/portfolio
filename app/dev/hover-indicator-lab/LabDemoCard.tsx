"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCardLift from "@/components/ProjectCardLift";
import NortheastArrow from "@/components/icons/NortheastArrow";
import { useIsMobile } from "@/components/useIsMobile";
import DockTooltipPortal from "./DockTooltipPortal";
import type { DockPlacementMode, LabProject } from "./types";

export default function LabDemoCard({
  project,
  dockPlacement,
}: {
  project: LabProject;
  dockPlacement: DockPlacementMode;
}) {
  const isMobile = useIsMobile();
  const staticUi = isMobile;
  const [hovered, setHovered] = useState(false);
  const [dockLeaving, setDockLeaving] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dockLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kind = project.kind;
  const dockFollow = dockPlacement === "cursor-follow" && !staticUi;
  const dockAnchored = dockPlacement === "anchored" || staticUi;
  const showDock = (dockAnchored && (hovered || staticUi)) || (dockFollow && hovered);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (dockFollow) {
        setPointer({ x: e.clientX, y: e.clientY });
      }
    },
    [dockFollow],
  );

  const onEnter = useCallback(
    (e: React.PointerEvent) => {
      setHovered(true);
      setDockLeaving(false);
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
      if (dockFollow) {
        setPointer({ x: e.clientX, y: e.clientY });
      }
    },
    [dockFollow],
  );

  const onLeave = useCallback(() => {
    const wasDockFollow = dockFollow && hovered;
    setHovered(false);
    if (wasDockFollow) {
      setDockLeaving(true);
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
      dockLeaveTimer.current = setTimeout(() => setDockLeaving(false), 80);
    } else {
      setDockLeaving(false);
    }
  }, [dockFollow, hovered]);

  useEffect(() => {
    return () => {
      if (dockLeaveTimer.current) clearTimeout(dockLeaveTimer.current);
    };
  }, []);

  const placement = staticUi ? "anchored" : dockPlacement;

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
            </div>
          </div>

          <div>
            <p className="hilab-card__title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {project.title}
              {kind === "demo" && <NortheastArrow size={13} color="var(--color-link-blue)" />}
            </p>
            {project.subtitle && <p className="hilab-card__sub">{project.subtitle}</p>}
          </div>
        </ProjectCardLift>
      </div>

      {(showDock || dockLeaving) && (
        <DockTooltipPortal
          kind={kind}
          visible={showDock}
          leaving={dockLeaving}
          placement={placement}
          anchorEl={anchorEl}
          pointer={pointer}
        />
      )}
    </>
  );
}
