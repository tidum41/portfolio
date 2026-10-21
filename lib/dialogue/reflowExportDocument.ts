import { auditExportDocument } from "@/lib/dialogue/auditExportDocument";
import { dialogueExportFrame } from "@/lib/caseStudies/dialogueExportFrames";

export type ReflowMode = "default" | "hero-fill" | "placement";

const FONT_STACK =
  '"Helvetica Neue", "TeX Gyre Heros", "Nimbus Sans L", Nimbus Sans, Helvetica, Arial, sans-serif';

function injectBaseStyles(doc: Document, placedWidth: number) {
  const id = "dialogue-portfolio-reflow";
  let style = doc.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = id;
    doc.head.appendChild(style);
  }
  style.textContent = `
    @font-face {
      font-family: "Helvetica Neue";
      src: local("Helvetica Neue"), local("HelveticaNeue"), local("TeX Gyre Heros"), local("Nimbus Sans L"), local("Arial");
      font-weight: 100 900;
      font-style: normal;
    }
    html, body {
      width: 100% !important;
      max-width: ${placedWidth}px !important;
      margin: 0 auto !important;
      overflow-x: visible !important;
      overflow-y: visible !important;
      font-family: ${FONT_STACK} !important;
    }
    body * {
      font-family: inherit !important;
      box-sizing: border-box;
    }
    [data-export-section-canvas],
    [data-export-canvas],
    .export-section-canvas-weight-cap {
      width: 100% !important;
      max-width: ${placedWidth}px !important;
      min-width: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      position: relative !important;
      left: 0 !important;
      top: 0 !important;
      right: auto !important;
      bottom: auto !important;
      margin: 0 auto !important;
      transform: none !important;
    }
    [data-export-ui-group],
    [data-export-design-frame],
    [data-export-app-shell],
    [data-export-hero-compose] {
      position: relative !important;
      left: 0 !important;
      top: 0 !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      width: 100% !important;
      max-width: ${placedWidth}px !important;
      min-width: 0 !important;
      overflow: visible !important;
    }
    [data-export-chat-panel],
    [data-export-popup-chat],
    [data-export-docked-chat] {
      overflow: visible !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
    .overflow-hidden,
    .overflow-x-hidden,
    .overflow-y-hidden {
      overflow: visible !important;
    }
    .recharts-responsive-container,
    .recharts-wrapper,
    svg.recharts-surface {
      overflow: visible !important;
      max-width: 100% !important;
      width: 100% !important;
    }
    table { table-layout: fixed !important; width: 100% !important; }
    td, th { word-break: break-word !important; overflow-wrap: anywhere !important; }
    [data-export-frame-label],
    [data-export-callout-label] {
      color: #1a1816 !important;
    }
    .bg-amber-100, .bg-yellow-100, [class*="bg-amber"] {
      color: #1a1816 !important;
    }
    .text-white, .text-neutral-0 {
      color: #1a1816 !important;
    }
  `;
}

function resetInlineLayout(doc: Document, placedWidth: number) {
  doc.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    const raw = el.getAttribute("style") ?? "";
    if (/left:\s*-/i.test(raw) || /right:\s*\d/i.test(raw)) {
      el.style.left = "0";
      el.style.right = "auto";
    }
    if (/top:\s*-/i.test(raw)) {
      el.style.top = "0";
    }
    if (/position:\s*absolute/i.test(raw) && el.hasAttribute("data-export-chat-panel")) {
      el.style.position = "relative";
    }
    if (/transform:\s*scale/i.test(raw)) {
      el.style.transform = "none";
    }
    const wMatch = raw.match(/width:\s*(\d+(?:\.\d+)?)px/);
    if (wMatch && Number(wMatch[1]) > placedWidth) {
      el.style.width = "100%";
      el.style.maxWidth = "100%";
    }
  });

  doc.querySelectorAll<HTMLElement>("[data-export-chat-panel]").forEach((panel) => {
    const chatW = Math.min(placedWidth, Math.max(260, placedWidth - 24));
    panel.style.width = "100%";
    panel.style.maxWidth = `${chatW}px`;
    panel.style.margin = "0 auto";
    panel.style.position = "relative";
    panel.style.left = "0";
    let node: HTMLElement | null = panel.parentElement;
    while (node && node !== doc.body) {
      node.style.overflow = "visible";
      node.style.maxWidth = `${placedWidth}px`;
      node.style.minWidth = "0";
      node = node.parentElement;
    }
  });

  doc.querySelectorAll<HTMLElement>(".grid").forEach((grid) => {
    grid.classList.remove("grid-cols-2", "md:grid-cols-2", "lg:grid-cols-2", "sm:grid-cols-2");
    grid.classList.add("grid-cols-1");
    grid.style.width = "100%";
    grid.style.maxWidth = "100%";
    grid.style.overflow = "visible";
  });

  doc.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > placedWidth + 2) {
      const tag = el.tagName.toLowerCase();
      if (tag !== "html" && tag !== "body") {
        el.style.maxWidth = "100%";
        if (el.hasAttribute("data-export-design-frame") || el.hasAttribute("data-export-ui-group")) {
          el.style.width = "100%";
        }
      }
    }
  });
}

function clampCharts(doc: Document, placedWidth: number) {
  doc.querySelectorAll<HTMLElement>(".recharts-responsive-container").forEach((container) => {
    container.style.width = "100%";
    container.style.maxWidth = `${Math.max(200, placedWidth - 32)}px`;
    container.style.height = "auto";
    container.style.minHeight = "200px";
  });
  doc.defaultView?.dispatchEvent(new Event("resize"));
}

function reflowPlacement(doc: Document, placedWidth: number) {
  const canvas = doc.querySelector<HTMLElement>("[data-export-section-canvas]");
  if (canvas) {
    canvas.style.minHeight = `${Math.round(placedWidth * 0.72)}px`;
  }
  doc.querySelectorAll<HTMLElement>("[data-export-popup-chat]").forEach((popup) => {
    popup.style.position = "relative";
    popup.style.right = "auto";
    popup.style.bottom = "auto";
    popup.style.width = `${Math.min(360, placedWidth - 32)}px`;
    popup.style.margin = "12px 12px 12px auto";
    popup.style.display = "block";
    popup.style.visibility = "visible";
    popup.style.opacity = "1";
  });
  doc.querySelectorAll<HTMLElement>("[data-export-docked-chat]").forEach((dock) => {
    dock.style.position = "relative";
    dock.style.width = `${Math.min(340, Math.round(placedWidth * 0.44))}px`;
    dock.style.minHeight = "360px";
    dock.style.flexShrink = "0";
    dock.style.display = "flex";
    dock.style.visibility = "visible";
  });
  doc.querySelectorAll<HTMLElement>("[data-export-popup-chat]").forEach((popup) => {
    popup.style.display = "block";
    popup.style.visibility = "visible";
    popup.style.opacity = "1";
    popup.style.pointerEvents = "auto";
  });
  const row = doc.querySelector<HTMLElement>("[data-export-study-layout]");
  if (row) {
    row.style.display = "flex";
    row.style.flexDirection = placedWidth < 520 ? "column" : "row";
    row.style.gap = "12px";
    row.style.width = "100%";
    row.style.overflow = "visible";
  }
}

function reflowHeroFill(doc: Document, placedWidth: number) {
  const shell = doc.querySelector<HTMLElement>("[data-export-app-shell]");
  doc
    .querySelectorAll<HTMLElement>(
      "[data-export-hero-clips-panel], [data-export-mini-card], [data-export-floating-shell], [data-export-popup-shell], [data-export-anatomy]",
    )
    .forEach((el) => {
      el.style.display = "none";
    });
  const orphanPanel = doc.querySelector<HTMLElement>("[data-export-chat-panel]");
  if (shell && orphanPanel && !shell.contains(orphanPanel)) {
    shell.appendChild(orphanPanel);
  }
  doc.querySelectorAll<HTMLElement>("[data-export-chat-panel]").forEach((panel) => {
    panel.style.position = "relative";
    panel.style.left = "0";
    panel.style.right = "auto";
    panel.style.top = "0";
    panel.style.width = "100%";
    panel.style.maxWidth = `${Math.min(placedWidth - 40, 560)}px`;
    panel.style.margin = "0 auto";
    panel.style.transform = "none";
  });

  const frameH = Math.round(placedWidth * (2 / 3));
  const canvas =
    doc.querySelector<HTMLElement>("[data-export-section-canvas]") ??
    doc.querySelector<HTMLElement>("[data-export-canvas]");
  const compose =
    shell ??
    doc.querySelector<HTMLElement>("[data-export-hero-compose]") ??
    doc.querySelector<HTMLElement>("[data-export-ui-group]");

  if (canvas) {
    canvas.style.width = `${placedWidth}px`;
    canvas.style.maxWidth = `${placedWidth}px`;
    canvas.style.height = `${frameH}px`;
    canvas.style.minHeight = `${frameH}px`;
    canvas.style.overflow = "hidden";
    canvas.style.display = "flex";
    canvas.style.alignItems = "center";
    canvas.style.justifyContent = "center";
    canvas.style.background = "#f4f1ec";
    canvas.style.padding = "0";
  }

  if (compose && compose.offsetWidth > 40) {
    compose.style.position = "relative";
    compose.style.margin = "0 auto";
    compose.style.transformOrigin = "top center";
    const naturalW = compose.offsetWidth || compose.scrollWidth || placedWidth;
    const naturalH = compose.offsetHeight || compose.scrollHeight || frameH;
    const scale = placedWidth / naturalW;
    compose.style.transform = `scale(${scale})`;
    compose.style.width = `${naturalW}px`;
    compose.style.maxWidth = "none";
    const scaledH = naturalH * scale;
    if (scaledH > frameH) {
      compose.style.marginTop = `-${Math.round((scaledH - frameH) / 2)}px`;
    } else {
      compose.style.marginTop = `${Math.round((frameH - scaledH) / 2)}px`;
    }
    if (canvas) {
      canvas.style.overflow = "hidden";
      canvas.style.height = `${frameH}px`;
    }
  }
}

function forceReflowWidths(doc: Document, placedWidth: number) {
  doc.querySelectorAll<HTMLElement>(".flex, [class*='flex-row']").forEach((row) => {
    if (row.scrollWidth > placedWidth + 2) {
      row.style.flexDirection = "column";
      row.style.flexWrap = "nowrap";
      row.style.alignItems = "stretch";
    }
  });
  for (let pass = 0; pass < 2; pass += 1) {
    doc.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      if (el.scrollWidth > placedWidth + 2) {
        el.style.width = "100%";
        el.style.maxWidth = `${placedWidth}px`;
        el.style.minWidth = "0";
      }
    });
  }
}

function fitDocumentToWidth(doc: Document, placedWidth: number) {
  let docW = doc.documentElement.scrollWidth;
  if (docW <= placedWidth + 2) return;
  const scale = placedWidth / docW;
  const root =
    doc.querySelector<HTMLElement>("[data-export-ui-group]") ??
    doc.querySelector<HTMLElement>("[data-export-design-frame]") ??
    doc.body;
  root.style.transform = `scale(${scale})`;
  root.style.transformOrigin = "top left";
  root.style.width = `${docW}px`;
  const scaledH = root.scrollHeight * scale;
  doc.body.style.height = `${scaledH}px`;
  doc.documentElement.style.height = `${scaledH}px`;
  doc.documentElement.style.overflow = "hidden";
  doc.body.style.overflow = "hidden";
  doc.documentElement.style.width = `${placedWidth}px`;
  doc.body.style.width = `${placedWidth}px`;
}

export function reflowExportDocument(
  doc: Document,
  placedWidth: number,
  mode: ReflowMode = "default",
  exportRoute?: string,
): number {
  injectBaseStyles(doc, placedWidth);
  doc.documentElement.style.overflow = "visible";
  doc.body.style.overflow = "visible";
  doc.body.style.margin = "0";
  doc.body.style.padding = "0";
  doc.body.style.width = `${placedWidth}px`;
  doc.body.style.maxWidth = `${placedWidth}px`;

  let intrinsic = placedWidth;
  if (exportRoute) {
    try {
      const frame = dialogueExportFrame(exportRoute);
      intrinsic = frame.width;
    } catch {
      /* unknown route */
    }
  }

  resetInlineLayout(doc, placedWidth);
  clampCharts(doc, placedWidth);

  if (mode === "placement") reflowPlacement(doc, placedWidth);
  if (mode === "hero-fill") reflowHeroFill(doc, placedWidth);

  if (mode === "hero-fill") {
    const frameH = Math.round(placedWidth * (2 / 3));
    doc.querySelectorAll<HTMLElement>("body *").forEach((node) => {
      if (node === doc.body || node === doc.documentElement) return;
      if (node.scrollWidth > placedWidth + 4 && !node.closest("[data-export-app-shell]")) {
        node.style.maxWidth = `${placedWidth}px`;
      }
    });
    doc.documentElement.style.width = `${placedWidth}px`;
    doc.documentElement.style.maxWidth = `${placedWidth}px`;
    doc.documentElement.style.overflow = "hidden";
    doc.body.style.width = `${placedWidth}px`;
    doc.body.style.maxWidth = `${placedWidth}px`;
    doc.body.style.height = `${frameH}px`;
    doc.body.style.overflow = "hidden";
    doc.documentElement.style.height = `${frameH}px`;
  } else {
    if (placedWidth < 900) {
      doc
        .querySelectorAll<HTMLElement>("[data-export-hero-clips-panel], [data-export-mini-card]")
        .forEach((node) => {
          node.style.display = "none";
        });
    }
    forceReflowWidths(doc, placedWidth);
    if (doc.documentElement.scrollWidth > placedWidth + 2) {
      doc.querySelectorAll<HTMLElement>("[data-export-design-frame]").forEach((frame) => {
        frame.style.width = "100%";
        frame.style.maxWidth = `${placedWidth}px`;
      });
      fitDocumentToWidth(doc, placedWidth);
    }
  }

  const typeRoots = [
    ...doc.querySelectorAll<HTMLElement>('[style*="--text-body-size"]'),
    doc.body,
  ];
  typeRoots.forEach((root) => {
    root.style.setProperty("--text-body-size", "16px");
    root.style.setProperty("--text-body-leading", "24px");
    root.style.setProperty("--text-meta-size", "14px");
    root.style.setProperty("--text-meta-leading", "20px");
  });

  if (mode !== "hero-fill" && doc.documentElement.scrollWidth > placedWidth + 2) {
    fitDocumentToWidth(doc, placedWidth);
  }

  return Math.ceil(doc.body.scrollHeight);
}

export function reflowAndAudit(
  doc: Document,
  placedWidth: number,
  mode: ReflowMode = "default",
  exportRoute?: string,
) {
  const height = reflowExportDocument(doc, placedWidth, mode, exportRoute);
  const audit = auditExportDocument(doc);
  return { height, audit };
}
