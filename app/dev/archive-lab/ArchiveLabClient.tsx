"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useDialKit } from "dialkit";
import {
  ARCHIVE_PHOTOS,
  DIRECTIONS,
  INTRO_LINE,
  KEYBOARD_BUILD_PHOTOS,
  PASSIONS,
  SECTION_ORDERS,
  type ArchivePhoto,
  type ArchiveTag,
  type DirectionId,
  type SectionId,
} from "./data";

type FilterId = "all" | ArchiveTag;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "concerts", label: "Concerts" },
  { id: "keyboards", label: "Keyboards" },
  { id: "life", label: "Life" },
];

const DIAL_CONFIG = {
  gap: [12, 4, 48, 1] as [number, number, number, number],
  columns: [3, 1, 6, 1] as [number, number, number, number],
  imageMaxHeight: [220, 80, 480, 4] as [number, number, number, number],
  captions: true,
  introSize: [28, 16, 48, 1] as [number, number, number, number],
  sectionOrder: {
    type: "select" as const,
    options: SECTION_ORDERS.map((o) => ({ value: o.id, label: o.label })),
    default: "ckm",
  },
};

type LabValues = {
  gap: number;
  columns: number;
  imageMaxHeight: number;
  captions: boolean;
  introSize: number;
  sectionOrder: string;
};

const LOCAL_DEFAULTS: LabValues = {
  gap: 12,
  columns: 3,
  imageMaxHeight: 220,
  captions: true,
  introSize: 28,
  sectionOrder: "ckm",
};

/** Tiny custom panel when DialRoot is not mounted (preview / prod stub). */
function FallbackPanel({
  values,
  onChange,
}: {
  values: LabValues;
  onChange: (next: Partial<LabValues>) => void;
}) {
  return (
    <aside className="al-fallback" aria-label="Archive lab controls">
      <div className="al-fallback-title">Archive lab</div>
      <label>
        Gap
        <input
          type="range"
          min={4}
          max={48}
          value={values.gap}
          onChange={(e) => onChange({ gap: Number(e.target.value) })}
        />
      </label>
      <label>
        Columns
        <input
          type="range"
          min={1}
          max={6}
          value={values.columns}
          onChange={(e) => onChange({ columns: Number(e.target.value) })}
        />
      </label>
      <label>
        Image max height
        <input
          type="range"
          min={80}
          max={480}
          step={4}
          value={values.imageMaxHeight}
          onChange={(e) => onChange({ imageMaxHeight: Number(e.target.value) })}
        />
      </label>
      <label className="al-fallback-check">
        <input
          type="checkbox"
          checked={values.captions}
          onChange={(e) => onChange({ captions: e.target.checked })}
        />
        Captions
      </label>
      <label>
        Intro size
        <input
          type="range"
          min={16}
          max={48}
          value={values.introSize}
          onChange={(e) => onChange({ introSize: Number(e.target.value) })}
        />
      </label>
      <label>
        Section order
        <select
          value={values.sectionOrder}
          onChange={(e) => onChange({ sectionOrder: e.target.value })}
        >
          {SECTION_ORDERS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}

function PhotoTile({
  photo,
  maxHeight,
  showCaption,
  captionMode = "always",
}: {
  photo: ArchivePhoto;
  maxHeight: number;
  showCaption: boolean;
  captionMode?: "always" | "hover";
}) {
  return (
    <figure className={`al-tile al-tile-${captionMode}`}>
      <div className="al-tile-media" style={{ maxHeight }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt} draggable={false} />
      </div>
      {showCaption ? (
        <figcaption className="al-credit">{photo.credit}</figcaption>
      ) : null}
    </figure>
  );
}

function PhotoGrid({
  photos,
  columns,
  gap,
  maxHeight,
  showCaption,
  captionMode = "always",
}: {
  photos: ArchivePhoto[];
  columns: number;
  gap: number;
  maxHeight: number;
  showCaption: boolean;
  captionMode?: "always" | "hover";
}) {
  const style = {
    "--al-cols": columns,
    "--al-gap": `${gap}px`,
  } as CSSProperties;

  return (
    <div className="al-grid" style={style}>
      {photos.map((photo) => (
        <PhotoTile
          key={photo.id}
          photo={photo}
          maxHeight={maxHeight}
          showCaption={showCaption}
          captionMode={captionMode}
        />
      ))}
    </div>
  );
}

function YoutubeSlot() {
  return (
    <div className="al-yt" aria-label="YouTube embed placeholder">
      <div className="al-yt-box">
        <span>YouTube embed</span>
        <span className="al-yt-sub">Keyboard build video placeholder</span>
      </div>
    </div>
  );
}

function InfiniteGallery({
  photos,
  columns,
  gap,
  maxHeight,
  showCaption,
  captionMode = "always",
  filter = "all",
}: {
  photos: ArchivePhoto[];
  columns: number;
  gap: number;
  maxHeight: number;
  showCaption: boolean;
  captionMode?: "always" | "hover";
  filter?: FilterId;
}) {
  // Cheap infinite feel: repeat the set a few times.
  const looped = useMemo(() => {
    const filtered =
      filter === "all" ? photos : photos.filter((p) => p.tag === filter);
    return Array.from({ length: 4 }, (_, i) =>
      filtered.map((p) => ({ ...p, id: `${p.id}-r${i}` })),
    ).flat();
  }, [photos, filter]);

  return (
    <PhotoGrid
      photos={looped}
      columns={columns}
      gap={gap}
      maxHeight={maxHeight}
      showCaption={showCaption}
      captionMode={captionMode}
    />
  );
}

function ChaptersDirection({
  order,
  columns,
  gap,
  maxHeight,
  showCaption,
  introSize,
}: {
  order: SectionId[];
  columns: number;
  gap: number;
  maxHeight: number;
  showCaption: boolean;
  introSize: number;
}) {
  const concerts = ARCHIVE_PHOTOS.filter((p) => p.tag === "concerts");
  const sections: Record<SectionId, ReactNode> = {
    concerts: (
      <section className="al-section" key="concerts">
        <h2 className="al-h2">Concerts</h2>
        <p className="al-dek">A short curated set. Credits are placeholders.</p>
        <PhotoGrid
          photos={concerts}
          columns={columns}
          gap={gap}
          maxHeight={maxHeight}
          showCaption={showCaption}
        />
      </section>
    ),
    keyboards: (
      <section className="al-section" key="keyboards">
        <h2 className="al-h2">Keyboards</h2>
        <p className="al-dek">Builds on YouTube, plus a few bench photos.</p>
        <YoutubeSlot />
        <PhotoGrid
          photos={KEYBOARD_BUILD_PHOTOS}
          columns={Math.min(columns, 3)}
          gap={gap}
          maxHeight={maxHeight}
          showCaption={showCaption}
        />
      </section>
    ),
    more: (
      <section className="al-section" key="more">
        <h2 className="al-h2">More</h2>
        <p className="al-dek">The existing infinite gallery, kept rough here.</p>
        <InfiniteGallery
          photos={ARCHIVE_PHOTOS}
          columns={columns}
          gap={gap}
          maxHeight={maxHeight}
          showCaption={showCaption}
        />
      </section>
    ),
  };

  return (
    <>
      <p className="al-intro" style={{ fontSize: introSize }}>
        {INTRO_LINE}
      </p>
      {order.map((id) => sections[id])}
    </>
  );
}

function TaggedDirection({
  columns,
  gap,
  maxHeight,
  showCaption,
  introSize,
}: {
  columns: number;
  gap: number;
  maxHeight: number;
  showCaption: boolean;
  introSize: number;
}) {
  const [filter, setFilter] = useState<FilterId>("all");

  return (
    <>
      <p className="al-intro" style={{ fontSize: introSize }}>
        {INTRO_LINE}
      </p>
      <div className="al-sticky-filters" role="tablist" aria-label="Archive filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? "is-active" : undefined}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <InfiniteGallery
        photos={ARCHIVE_PHOTOS}
        columns={columns}
        gap={gap}
        maxHeight={maxHeight}
        showCaption={showCaption}
        captionMode="hover"
        filter={filter}
      />
    </>
  );
}

function IndexDirection({
  gap,
  maxHeight,
  showCaption,
  introSize,
}: {
  gap: number;
  maxHeight: number;
  showCaption: boolean;
  introSize: number;
}) {
  const [open, setOpen] = useState<string | null>(PASSIONS[0]?.id ?? null);

  return (
    <>
      <p className="al-intro" style={{ fontSize: introSize }}>
        {INTRO_LINE}
      </p>
      <ul className="al-index">
        {PASSIONS.map((passion) => {
          const expanded = open === passion.id;
          const photos = ARCHIVE_PHOTOS.filter((p) => p.tag === passion.tag);
          const strip =
            passion.tag === "keyboards" ? KEYBOARD_BUILD_PHOTOS : photos;
          return (
            <li key={passion.id} className={expanded ? "is-open" : undefined}>
              <button
                type="button"
                className="al-index-row"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : passion.id)}
              >
                <span className="al-index-title">{passion.title}</span>
                <span className="al-index-meta">{expanded ? "Close" : "Open"}</span>
              </button>
              {expanded ? (
                <div className="al-index-body">
                  <p className="al-dek">{passion.blurb}</p>
                  {passion.tag === "keyboards" ? <YoutubeSlot /> : null}
                  <div className="al-strip" style={{ gap }}>
                    {strip.map((photo) => (
                      <div key={photo.id} className="al-strip-item">
                        <PhotoTile
                          photo={photo}
                          maxHeight={maxHeight}
                          showCaption={showCaption}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <section className="al-section">
        <h2 className="al-h2">Gallery</h2>
        <p className="al-dek">Full set below the index.</p>
        <InfiniteGallery
          photos={ARCHIVE_PHOTOS}
          columns={3}
          gap={gap}
          maxHeight={maxHeight}
          showCaption={showCaption}
        />
      </section>
    </>
  );
}

export default function ArchiveLabClient() {
  // DialKit panel mounts via DevDialRoot in `next dev`. Elsewhere, dialkit is
  // stubbed and DialRoot is absent, so we fall back to a tiny local panel.
  const dialkitOn = process.env.NODE_ENV === "development";
  const dials = useDialKit("Archive Lab", DIAL_CONFIG, { id: "archive-lab" });
  const [local, setLocal] = useState<LabValues>(LOCAL_DEFAULTS);
  const [direction, setDirection] = useState<DirectionId>("chapters");
  const values: LabValues = dialkitOn ? dials : local;

  const orderMeta =
    SECTION_ORDERS.find((o) => o.id === values.sectionOrder) ?? SECTION_ORDERS[0];
  const active = DIRECTIONS.find((d) => d.id === direction) ?? DIRECTIONS[0];

  return (
    <>
      <style>{`
        .al-root {
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          padding: 0 0 120px;
        }
        .al-bar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 16px;
          padding: 14px var(--page-px, 24px);
          background: color-mix(in srgb, var(--color-bg) 92%, transparent);
          border-bottom: 1px solid color-mix(in srgb, var(--color-text-primary) 10%, transparent);
        }
        .al-bar-label {
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.45;
          margin-right: 4px;
        }
        .al-seg {
          display: inline-flex;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          border-radius: 4px;
          overflow: hidden;
        }
        .al-seg button {
          appearance: none;
          background: transparent;
          border: 0;
          color: inherit;
          font: inherit;
          font-size: 13px;
          padding: 10px 14px;
          min-height: 44px;
          cursor: pointer;
        }
        .al-seg button + button {
          border-left: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
        }
        .al-seg button.is-active {
          background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
        }
        .al-hint {
          font-size: 12px;
          opacity: 0.5;
          flex: 1 1 200px;
        }
        .al-main {
          padding: 32px var(--page-px, 24px) 0;
          max-width: 1200px;
        }
        .al-intro {
          font-family: var(--font-serif);
          line-height: 1.25;
          max-width: 36ch;
          margin: 0 0 40px;
          font-weight: 400;
        }
        .al-section {
          margin: 0 0 56px;
        }
        .al-h2 {
          font-family: var(--font-serif);
          font-size: 28px;
          line-height: 1.2;
          font-weight: 400;
          margin: 0 0 12px;
        }
        .al-dek {
          font-size: 14px;
          line-height: 1.45;
          max-width: 52ch;
          opacity: 0.62;
          margin: 0 0 20px;
        }
        .al-grid {
          display: grid;
          grid-template-columns: repeat(var(--al-cols, 3), minmax(0, 1fr));
          gap: var(--al-gap, 12px);
        }
        .al-tile {
          margin: 0;
          min-width: 0;
        }
        .al-tile-media {
          background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent);
          overflow: hidden;
          aspect-ratio: 4 / 3;
        }
        .al-tile-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .al-credit {
          font-size: 12px;
          line-height: 1.35;
          margin-top: 6px;
          opacity: 0.55;
        }
        .al-tile-hover .al-credit {
          opacity: 0;
          transition: opacity 120ms ease;
        }
        .al-tile-hover:hover .al-credit,
        .al-tile-hover:focus-within .al-credit {
          opacity: 0.7;
        }
        @media (hover: none) {
          .al-tile-hover .al-credit { opacity: 0.55; }
        }
        .al-yt {
          margin: 0 0 20px;
        }
        .al-yt-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 6px;
          min-height: 220px;
          padding: 20px;
          background: color-mix(in srgb, var(--color-text-primary) 6%, transparent);
          border: 1px dashed color-mix(in srgb, var(--color-text-primary) 22%, transparent);
          font-size: 14px;
        }
        .al-yt-sub {
          font-size: 12px;
          opacity: 0.5;
        }
        .al-sticky-filters {
          position: sticky;
          top: 72px;
          z-index: 15;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 0 16px;
          margin: 0 0 8px;
          background: color-mix(in srgb, var(--color-bg) 94%, transparent);
        }
        .al-sticky-filters button {
          appearance: none;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          color: inherit;
          font: inherit;
          font-size: 13px;
          padding: 8px 12px;
          min-height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }
        .al-sticky-filters button.is-active {
          background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
        }
        .al-index {
          list-style: none;
          margin: 0 0 48px;
          padding: 0;
          border-top: 1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent);
        }
        .al-index > li {
          border-bottom: 1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent);
        }
        .al-index-row {
          width: 100%;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          appearance: none;
          background: transparent;
          border: 0;
          color: inherit;
          font: inherit;
          text-align: left;
          padding: 18px 0;
          min-height: 56px;
          cursor: pointer;
        }
        .al-index-title {
          font-family: var(--font-serif);
          font-size: 22px;
          line-height: 1.2;
        }
        .al-index-meta {
          font-size: 12px;
          opacity: 0.45;
        }
        .al-index-body {
          padding: 0 0 20px;
        }
        .al-strip {
          display: flex;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .al-strip-item {
          flex: 0 0 220px;
        }
        .al-fallback {
          position: fixed;
          right: 16px;
          bottom: 16px;
          z-index: 40;
          width: 220px;
          padding: 12px;
          background: var(--color-bg);
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .al-fallback-title {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.5;
        }
        .al-fallback label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .al-fallback-check {
          flex-direction: row !important;
          align-items: center;
          gap: 8px !important;
        }
        .al-fallback input[type="range"],
        .al-fallback select {
          width: 100%;
        }
        @media (max-width: 640px) {
          .al-h2 { font-size: 22px; }
          .al-index-title { font-size: 18px; }
          .al-grid { grid-template-columns: repeat(min(var(--al-cols, 3), 2), minmax(0, 1fr)); }
          .al-strip-item { flex-basis: 160px; }
        }
      `}</style>

      <div className="al-root" data-direction={direction}>
        <div className="al-bar">
          <span className="al-bar-label">Archive lab</span>
          <div className="al-seg" role="tablist" aria-label="Direction">
            {DIRECTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={direction === d.id}
                className={direction === d.id ? "is-active" : undefined}
                onClick={() => setDirection(d.id)}
                data-direction-btn={d.id}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="al-hint">{active.hint}</div>
        </div>

        <div className="al-main">
          {direction === "chapters" ? (
            <ChaptersDirection
              order={orderMeta.order}
              columns={Math.round(values.columns)}
              gap={values.gap}
              maxHeight={values.imageMaxHeight}
              showCaption={values.captions}
              introSize={values.introSize}
            />
          ) : null}
          {direction === "tagged" ? (
            <TaggedDirection
              columns={Math.round(values.columns)}
              gap={values.gap}
              maxHeight={values.imageMaxHeight}
              showCaption={values.captions}
              introSize={values.introSize}
            />
          ) : null}
          {direction === "index" ? (
            <IndexDirection
              gap={values.gap}
              maxHeight={values.imageMaxHeight}
              showCaption={values.captions}
              introSize={values.introSize}
            />
          ) : null}
        </div>

        {!dialkitOn ? (
          <FallbackPanel
            values={local}
            onChange={(next) => setLocal((prev) => ({ ...prev, ...next }))}
          />
        ) : null}
      </div>
    </>
  );
}
