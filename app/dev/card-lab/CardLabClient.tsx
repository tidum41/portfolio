"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./card-lab.css";
import {
  DESCRIPTION,
  TITLE,
  applyOverrides,
  direction1,
  direction2,
  direction3,
  innerRadius,
  labelD1,
  labelD2,
  labelD3,
  type Direction1Variant,
  type Direction2Variant,
  type Direction3Variant,
  type ThemeName,
} from "./variants";

function resolveTheme(param: string | null): ThemeName {
  if (param === "light" || param === "dark") return param;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function PlaceholderMedia({
  aspect,
  mediaIndex,
  radius,
  className,
}: {
  aspect: string;
  mediaIndex: number;
  radius?: number;
  className?: string;
}) {
  return (
    <div
      className={`card-lab__media card-lab__media--${mediaIndex}${className ? ` ${className}` : ""}`}
      data-cl-media
      data-cl-aspect={aspect}
      style={{
        aspectRatio: aspect,
        borderRadius: radius !== undefined ? `${radius}px` : undefined,
      }}
    >
      <span className="card-lab__media-mark" aria-hidden="true" />
    </div>
  );
}

function Direction1Card({ v }: { v: Direction1Variant }) {
  const inner = innerRadius(v);
  return (
    <div
      className="card-lab__frame"
      data-cl-card
      data-cl-direction="1"
      data-cl-variant={v.id}
      data-cl-radius={v.radius}
      data-cl-padding={v.padding}
      data-cl-inner={inner}
      data-cl-gap={v.gap}
      data-cl-title-size={v.titleSize}
      style={{
        borderRadius: `${v.radius}px`,
        padding: `${v.padding}px`,
      }}
    >
      <PlaceholderMedia
        aspect={direction1.aspect}
        mediaIndex={direction1.mediaIndex}
        radius={inner}
        className="card-lab__frame-media"
      />
      <div
        className="card-lab__frame-copy"
        data-cl-copy
        style={{ marginTop: `${v.gap}px`, gap: "0px" }}
      >
        <p
          className="card-lab__frame-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__frame-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
    </div>
  );
}

function Direction2Card({ v }: { v: Direction2Variant }) {
  return (
    <div
      data-cl-card
      data-cl-direction="2"
      data-cl-variant={v.id}
      data-cl-radius={v.radius}
      data-cl-gutter={v.gutter}
      data-cl-gap={v.captionGap}
      data-cl-title-size={v.titleSize}
    >
      <div
        className="card-lab__tile-grid"
        data-cl-tile-grid
        style={{ gap: `${v.gutter}px` }}
      >
        <PlaceholderMedia
          aspect={direction2.aspect}
          mediaIndex={direction2.mediaIndex}
          radius={v.radius}
          className="card-lab__tile-media"
        />
        <PlaceholderMedia
          aspect={direction2.aspect}
          mediaIndex={direction2.mediaIndex}
          radius={v.radius}
          className="card-lab__tile-media"
        />
      </div>
      <div
        className="card-lab__tile-caption"
        data-cl-copy
        style={{ marginTop: `${v.captionGap}px` }}
      >
        <p
          className="card-lab__tile-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__tile-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
    </div>
  );
}

function Direction3Card({ v }: { v: Direction3Variant }) {
  return (
    <div
      className="card-lab__text-row"
      data-cl-card
      data-cl-direction="3"
      data-cl-variant={v.id}
      data-cl-hover-ms={v.hoverMs}
      data-cl-title-size={v.titleSize}
      style={{ minHeight: `${v.rowMinHeight}px` }}
    >
      <div className="card-lab__text-copy" data-cl-copy>
        <p
          className="card-lab__text-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__text-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
      <div
        className="card-lab__preview"
        data-cl-preview
        style={{
          transition: `opacity ${v.hoverMs}ms ease-out, transform ${v.hoverMs}ms ease-out`,
        }}
      >
        <PlaceholderMedia
          aspect={direction3.aspect}
          mediaIndex={direction3.mediaIndex}
          className="card-lab__preview-media"
        />
      </div>
    </div>
  );
}

export default function CardLabClient() {
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const showGrid = searchParams.get("grid") === "1";

  const [theme, setTheme] = useState<ThemeName>(() =>
    themeParam === "light" || themeParam === "dark" ? themeParam : "light"
  );

  useEffect(() => {
    const apply = () => setTheme(resolveTheme(themeParam));
    apply();
    if (themeParam === "light" || themeParam === "dark") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [themeParam]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.setAttribute("data-card-lab", "1");
    html.removeAttribute("data-intro");
    html.setAttribute("data-theme", theme);
    const prevBg = body.style.background;
    const prevCursor = body.style.cursor;
    body.style.background = theme === "dark" ? "#141414" : "#F4F4F4";
    body.style.cursor = "auto";
    return () => {
      html.removeAttribute("data-card-lab");
      body.style.background = prevBg;
      body.style.cursor = prevCursor;
    };
  }, [theme]);

  const d1 = useMemo(
    () =>
      direction1.variants.map((v) =>
        applyOverrides("d1", v.id, v, searchParams)
      ),
    [searchParams]
  );
  const d2 = useMemo(
    () =>
      direction2.variants.map((v) =>
        applyOverrides("d2", v.id, v, searchParams)
      ),
    [searchParams]
  );
  const d3 = useMemo(
    () =>
      direction3.variants.map((v) =>
        applyOverrides("d3", v.id, v, searchParams)
      ),
    [searchParams]
  );

  // Equal stage cells within each direction (desktop stretch + mobile stack).
  useEffect(() => {
    const equalize = () => {
      document.querySelectorAll<HTMLElement>("[data-cl-row]").forEach((row) => {
        const stages = [
          ...row.querySelectorAll<HTMLElement>("[data-cl-stage]"),
        ];
        stages.forEach((s) => {
          s.style.minHeight = "";
        });
        let max = 0;
        for (const s of stages) {
          max = Math.max(max, s.getBoundingClientRect().height);
        }
        const h = Math.ceil(max);
        stages.forEach((s) => {
          s.style.minHeight = `${h}px`;
        });
      });
    };
    equalize();
    const id = requestAnimationFrame(equalize);
    window.addEventListener("resize", equalize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", equalize);
    };
  }, [theme, d1, d2, d3]);

  return (
    <div
      className="card-lab"
      data-theme={theme}
      data-cl-root
      style={{ position: "relative" }}
    >
      {showGrid ? <div className="card-lab__grid" data-cl-grid aria-hidden="true" /> : null}
      <div className="card-lab__inner">
        <h1 className="card-lab__title" data-cl-page-title>
          Card lab
        </h1>

        <div className="card-lab__sections">
          <section data-cl-section="1" aria-labelledby="cl-d1-name">
            <header className="card-lab__section-head" data-cl-section-head>
              <h2 id="cl-d1-name" className="card-lab__section-name">
                {direction1.name}
              </h2>
              <p className="card-lab__section-intent">{direction1.intent}</p>
            </header>
            <div className="card-lab__row" data-cl-row>
              {d1.map((v) => (
                <div
                  key={v.id}
                  className="card-lab__variant"
                  data-cl-variant-cell
                  data-cl-direction="1"
                  data-cl-variant={v.id}
                >
                  <div className="card-lab__stage" data-cl-stage>
                    <Direction1Card v={v} />
                  </div>
                  <p
                    className="card-lab__spec"
                    data-cl-spec
                    style={{ marginLeft: `${v.padding}px` }}
                  >
                    {labelD1(v)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section data-cl-section="2" aria-labelledby="cl-d2-name">
            <header className="card-lab__section-head" data-cl-section-head>
              <h2 id="cl-d2-name" className="card-lab__section-name">
                {direction2.name}
              </h2>
              <p className="card-lab__section-intent">{direction2.intent}</p>
            </header>
            <div className="card-lab__row" data-cl-row>
              {d2.map((v) => (
                <div
                  key={v.id}
                  className="card-lab__variant"
                  data-cl-variant-cell
                  data-cl-direction="2"
                  data-cl-variant={v.id}
                >
                  <div className="card-lab__stage" data-cl-stage>
                    <Direction2Card v={v} />
                  </div>
                  <p className="card-lab__spec" data-cl-spec>
                    {labelD2(v)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section data-cl-section="3" aria-labelledby="cl-d3-name">
            <header className="card-lab__section-head" data-cl-section-head>
              <h2 id="cl-d3-name" className="card-lab__section-name">
                {direction3.name}
              </h2>
              <p className="card-lab__section-intent">{direction3.intent}</p>
            </header>
            <div className="card-lab__row" data-cl-row>
              {d3.map((v) => (
                <div
                  key={v.id}
                  className="card-lab__variant"
                  data-cl-variant-cell
                  data-cl-direction="3"
                  data-cl-variant={v.id}
                >
                  <div className="card-lab__stage" data-cl-stage>
                    <Direction3Card v={v} />
                  </div>
                  <p className="card-lab__spec" data-cl-spec>
                    {labelD3(v)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
