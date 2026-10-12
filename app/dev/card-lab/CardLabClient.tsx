"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./card-lab.css";
import { CONCEPTS } from "./concepts/registry";
import type { ThemeName } from "./concepts/types";
import ConceptSection from "./shell/ConceptSection";

function resolveTheme(param: string | null): ThemeName {
  if (param === "light" || param === "dark") return param;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function CardLabClient() {
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const showGrid = searchParams.get("grid") === "1";
  const hoverAll = searchParams.get("hover") === "all";

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

  const resolved = useMemo(
    () =>
      CONCEPTS.map((concept) => ({
        concept,
        variants: concept.variants.map((v) =>
          concept.applyOverrides(v, searchParams)
        ),
      })),
    [searchParams]
  );

  // Equal card heights within each concept row (skip expand/list concepts).
  useEffect(() => {
    const equalize = () => {
      document.querySelectorAll<HTMLElement>("[data-cl-row]").forEach((row) => {
        const cards = [...row.querySelectorAll<HTMLElement>("[data-cl-card]")].filter(
          (c) => c.getAttribute("data-cl-skip-equalize") !== "1"
        );
        cards.forEach((c) => {
          c.style.minHeight = "";
        });
        if (!cards.length) return;
        let max = 0;
        for (const c of cards) {
          max = Math.max(max, c.getBoundingClientRect().height);
        }
        const h = Math.ceil(max);
        cards.forEach((c) => {
          c.style.minHeight = `${h}px`;
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
  }, [theme, resolved, hoverAll]);

  return (
    <div
      className="card-lab"
      data-theme={theme}
      data-cl-root
      data-cl-concept-count={CONCEPTS.length}
      data-cl-hover-all={hoverAll ? "1" : "0"}
      style={{ position: "relative" }}
    >
      {showGrid ? (
        <div className="card-lab__grid" data-cl-grid aria-hidden="true" />
      ) : null}
      <div className="card-lab__inner">
        <h1 className="card-lab__title" data-cl-page-title>
          Card lab
        </h1>

        <div className="card-lab__sections">
          {resolved.map(({ concept, variants }, i) => (
            <ConceptSection
              key={concept.id}
              concept={concept}
              index={i + 1}
              variants={variants}
              compareHover={hoverAll}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
