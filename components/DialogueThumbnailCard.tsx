"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProjectCardLift from "@/components/ProjectCardLift";
import DialogueThumbnailDemo from "@/components/dialogue/product/thumbnail/DialogueThumbnailDemo";
import { DEFAULT_THUMBNAIL_VARIANT, type ThumbnailVariantId } from "@/components/dialogue/product/thumbnail/variants";
import { commitCaseStudyNav, isCaseStudyHref, warmCaseStudyNav } from "@/lib/caseStudyNav";
import NortheastArrow from "@/components/icons/NortheastArrow";

const CARD_LINK_STYLE = {
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  flexDirection: "column",
  gap: "inherit",
  cursor: "pointer",
} as const;

function CardLabel({
  title,
  label,
  external,
}: {
  title: string;
  label?: string;
  external?: boolean;
}) {
  return (
    <div style={{ padding: "3px 0 0" }}>
      {label && (
        <p
          className="card-label-tag"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "var(--fs-caption)",
            lineHeight: 1.4,
            color: "var(--color-text-muted)",
            margin: "0 0 2px",
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </p>
      )}
      <p
        style={{
          fontFamily: "var(--font-sans-medium)",
          fontWeight: "var(--fw-card-title)" as React.CSSProperties["fontWeight"],
          fontSize: 18,
          lineHeight: 1.4,
          color: "var(--color-text-primary)",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          textWrap: "balance",
        }}
      >
        {title}
        {external && <NortheastArrow size={13} color="var(--color-link-blue)" />}
      </p>
    </div>
  );
}

export default function DialogueThumbnailCard({
  href = "/dialogue",
  title,
  label,
  aspectRatio = "4 / 3",
  active = true,
  playing = true,
  variant = DEFAULT_THUMBNAIL_VARIANT,
  annotate = "home-card/dialogue",
}: {
  href?: string;
  title: string;
  label?: string;
  aspectRatio?: string;
  active?: boolean;
  playing?: boolean;
  variant?: ThumbnailVariantId;
  annotate?: string;
}) {
  const router = useRouter();
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 1], rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const live = active && playing && inView;
  const warm = () => {
    if (href && isCaseStudyHref(href)) warmCaseStudyNav(href, router);
  };

  return (
    <ProjectCardLift style={{ gap: 8 }}>
      <Link
        href={href}
        prefetch
        style={CARD_LINK_STYLE}
        data-cursor-label="Case Study Coming Soon!"
        onMouseEnter={warm}
        onFocus={warm}
        onPointerDown={warm}
        onClick={() => href && isCaseStudyHref(href) && commitCaseStudyNav(href, router)}
      >
        <div className="project-media" data-annotate={`${annotate}/media-wrap`}>
          <div
            ref={mediaRef}
            className="project-img-wrap"
            data-annotate={`${annotate}/media`}
            style={{
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              background: "var(--color-placeholder)",
              aspectRatio,
              position: "relative",
            }}
          >
            <DialogueThumbnailDemo variant={variant} playing={live} showPreview />
          </div>
        </div>
        <CardLabel title={title} label={label} external={Boolean(href && /^(https?:|mailto:|tel:)/i.test(href))} />
      </Link>
    </ProjectCardLift>
  );
}
