"use client";

import { useCallback, useEffect, useState } from "react";
import type { DialogueStoryBeat } from "@/lib/caseStudies/dialogueStoryMap";

const AREAL = '"ABC Areal Archive", "Helvetica Neue", Helvetica, Arial, sans-serif';
const ACCENT = "#2563eb";

type Props = {
  beats: DialogueStoryBeat[];
  exportRepoNote: string;
};

export default function DialogueStoryMap({ beats, exportRepoNote }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      setSelectedId(hash);
      scrollToId(hash);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [scrollToId]);

  const onIdClick = async (id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#${id}`);
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
    } catch {
      /* clipboard optional */
    }
  };

  return (
    <div className="dialogue-story-map">
      <header className="dialogue-story-map__header">
        <p className="dialogue-story-map__kicker">Dialogue case study</p>
        <h1 className="dialogue-story-map__title">Story map (fcc87a2)</h1>
        <p className="dialogue-story-map__note">{exportRepoNote}</p>
      </header>

      <ol className="dialogue-story-map__list">
        {beats.map((beat) => {
          const selected = selectedId === beat.id;
          return (
            <li
              key={beat.id}
              id={beat.id}
              className={`dialogue-story-map__row${selected ? " dialogue-story-map__row--selected" : ""}`}
            >
              <div className="dialogue-story-map__meta">
                <button
                  type="button"
                  className="dialogue-story-map__id"
                  data-review-id
                  onClick={() => onIdClick(beat.id)}
                  aria-pressed={selected}
                >
                  {beat.id}
                  {copiedId === beat.id ? " · copied" : ""}
                </button>
                <span className={`dialogue-story-map__status dialogue-story-map__status--${beat.status}`}>
                  {beat.status}
                </span>
                <span className="dialogue-story-map__beat">{beat.beat}</span>
                <p className="dialogue-story-map__section-label">{beat.sectionLabel}</p>
                <h2 className="dialogue-story-map__heading">{beat.heading}</h2>
                {beat.copy.split("\n\n").map((para) => (
                  <p key={para.slice(0, 24)} className="dialogue-story-map__copy">
                    {para}
                  </p>
                ))}
                <p className="dialogue-story-map__caption">{beat.caption}</p>
                <p className="dialogue-story-map__visual">{beat.visualNote}</p>
              </div>
              <figure className="dialogue-story-map__figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={beat.pngSrc}
                  alt={beat.alt}
                  width={800}
                  height={500}
                  loading="lazy"
                  className="dialogue-story-map__png"
                />
              </figure>
            </li>
          );
        })}
      </ol>

      <style jsx>{`
        .dialogue-story-map {
          --story-pad: clamp(16px, 4vw, 40px);
          --story-gap: clamp(20px, 3vw, 32px);
          min-height: 100dvh;
          background: #f4f1ec;
          color: #1a1816;
          font-family: ${AREAL};
          padding: var(--story-pad) var(--story-pad) 80px;
        }
        .dialogue-story-map__header {
          max-width: 1120px;
          margin: 0 auto 32px;
        }
        .dialogue-story-map__kicker {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #5c5650;
        }
        .dialogue-story-map__title {
          margin: 0 0 12px;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .dialogue-story-map__note {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #5c5650;
          max-width: 52ch;
        }
        .dialogue-story-map__list {
          list-style: none;
          margin: 0 auto;
          padding: 0;
          max-width: 1120px;
          display: flex;
          flex-direction: column;
          gap: var(--story-gap);
        }
        .dialogue-story-map__row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 800px;
          gap: clamp(16px, 2.5vw, 28px);
          align-items: start;
          padding: 20px 0;
          border-top: 1px solid #ddd6cc;
          scroll-margin-top: 16px;
        }
        .dialogue-story-map__row--selected {
          outline: 2px solid ${ACCENT};
          outline-offset: 6px;
          border-radius: 4px;
        }
        .dialogue-story-map__id {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 10px;
          padding: 4px 10px;
          border: 1px solid #c9c0b6;
          border-radius: 6px;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          color: inherit;
        }
        .dialogue-story-map__id[aria-pressed="true"] {
          border-color: ${ACCENT};
          box-shadow: inset 0 0 0 1px ${ACCENT};
        }
        .dialogue-story-map__status {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dialogue-story-map__status--final {
          background: #e8f0fe;
          color: #1d4ed8;
        }
        .dialogue-story-map__status--candidate {
          background: #f5f0e6;
          color: #8a6d3b;
        }
        .dialogue-story-map__beat {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: #8a837a;
          letter-spacing: 0.02em;
        }
        .dialogue-story-map__section-label {
          margin: 12px 0 6px;
          font-size: 12px;
          color: #8a837a;
        }
        .dialogue-story-map__heading {
          margin: 0 0 12px;
          font-size: clamp(17px, 2.2vw, 20px);
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .dialogue-story-map__copy {
          margin: 0 0 10px;
          font-size: 14px;
          line-height: 1.55;
          color: #3d3834;
        }
        .dialogue-story-map__caption {
          margin: 12px 0 6px;
          font-size: 12px;
          line-height: 1.5;
          color: #5c5650;
        }
        .dialogue-story-map__visual {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: #1a1816;
        }
        .dialogue-story-map__figure {
          margin: 0;
          width: 100%;
          max-width: 800px;
        }
        .dialogue-story-map__png {
          display: block;
          width: 100%;
          max-width: 800px;
          height: auto;
          aspect-ratio: 8 / 5;
          object-fit: cover;
          object-position: center top;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px #ddd6cc;
          background: #fff;
        }
        @media (max-width: 960px) {
          .dialogue-story-map__row {
            grid-template-columns: 1fr;
          }
          .dialogue-story-map__figure {
            order: -1;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
