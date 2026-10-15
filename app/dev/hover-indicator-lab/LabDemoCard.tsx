"use client";

import ProjectCardLift from "@/components/ProjectCardLift";
import NortheastArrow from "@/components/icons/NortheastArrow";
import type { LabProject } from "./types";
import { kindShort } from "./types";

export default function LabDemoCard({ project }: { project: LabProject }) {
  const kind = project.kind;

  return (
    <div
      className="project-card portfolio-grid-card hilab-card"
      data-indicator={kindShort(kind)}
      data-kind={kind}
    >
      <ProjectCardLift style={{ gap: 8 }}>
        <div className="project-media" style={{ position: "relative" }}>
          <div
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
  );
}
