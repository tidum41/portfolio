"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import MuxMediaSlot, { muxPosterUrl } from "@/components/MuxMediaSlot";
import type { SanityProject } from "@/lib/sanity/queries";

/**
 * Lab media slot — poster always, Mux player when in view.
 * No transform/scale on this tree (Mux letterboxes under scaled ancestors).
 */
export default function LabMedia({
  project,
  aspectRatio,
  borderRadius,
  className,
  style,
  play = true,
}: {
  project: SanityProject;
  aspectRatio?: string;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
  /** When false, keep poster only (text-first touch thumbnails). */
  play?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const ratio = aspectRatio ?? project.aspectRatio ?? "4 / 3";
  const isVideo = project.mediaType === "video" && !!project.muxPlaybackId;
  const imageUrl = project.image?.asset?.url;
  const posterUrl = isVideo ? muxPosterUrl(project.muxPlaybackId!, 640) : imageUrl;

  useEffect(() => {
    if (!play || !isVideo) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [play, isVideo]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        borderRadius,
        background: "var(--color-placeholder)",
        ...style,
      }}
    >
      {posterUrl &&
        (isVideo ? (
          <img
            src={posterUrl}
            alt=""
            aria-hidden
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        ) : (
          <Image
            src={posterUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        ))}
      {play && isVideo && inView && (
        <MuxMediaSlot playbackId={project.muxPlaybackId!} fill playing />
      )}
    </div>
  );
}
