/**
 * Reflow a prebuilt Dialogue export document to the placed column width.
 * No parent transform — chat UI runs at native CSS size inside the iframe.
 */
export function reflowExportDocument(doc: Document, placedWidth: number): number {
  const pad = 24;
  const chatMax = Math.max(260, placedWidth - pad);

  const style = doc.createElement("style");
  style.textContent = `
    html, body { width: 100% !important; max-width: ${placedWidth}px !important; margin: 0 auto !important; }
    [data-export-section-canvas], [data-export-canvas] { width: 100% !important; max-width: ${placedWidth}px !important; height: auto !important; }
    [data-export-chat-panel] { width: 100% !important; max-width: ${chatMax}px !important; margin: 0 auto !important; }
  `;
  doc.head.appendChild(style);

  doc.documentElement.style.overflow = "hidden";
  doc.body.style.margin = "0";
  doc.body.style.padding = "0";
  doc.body.style.overflow = "visible";
  doc.body.style.background = "transparent";

  const canvases = doc.querySelectorAll<HTMLElement>(
    "[data-export-section-canvas], [data-export-canvas]",
  );
  canvases.forEach((el) => {
    el.style.width = "100%";
    el.style.maxWidth = `${placedWidth}px`;
    el.style.height = "auto";
    el.style.minHeight = "0";
    el.style.overflow = "visible";
    el.style.margin = "0 auto";
    el.style.boxSizing = "border-box";
  });

  doc.querySelectorAll<HTMLElement>("[data-export-ui-group]").forEach((el) => {
    el.style.position = "relative";
    el.style.left = "0";
    el.style.top = "0";
    el.style.transform = "none";
    el.style.width = "100%";
    el.style.maxWidth = `${placedWidth}px`;
  });

  doc.querySelectorAll<HTMLElement>("[data-export-design-frame]").forEach((el) => {
    el.style.width = "100%";
    el.style.height = "auto";
    el.style.maxWidth = `${placedWidth}px`;
    el.style.margin = "0 auto";
    el.style.display = "block";
  });

  doc.querySelectorAll<HTMLElement>('[style*="width:1152px"]').forEach((el) => {
    el.style.width = "100%";
    el.style.maxWidth = `${placedWidth}px`;
    el.style.height = "auto";
  });

  doc.querySelectorAll<HTMLElement>('[style*="width:400px"]').forEach((el) => {
    el.style.width = "100%";
    el.style.maxWidth = `${chatMax}px`;
    el.style.marginLeft = "auto";
    el.style.marginRight = "auto";
  });

  const expandWidth = (el: HTMLElement | null) => {
    let node: HTMLElement | null = el;
    while (node && node !== doc.body) {
      node.style.width = "100%";
      node.style.maxWidth = `${chatMax}px`;
      node.style.marginLeft = "auto";
      node.style.marginRight = "auto";
      node.style.boxSizing = "border-box";
      node = node.parentElement;
    }
  };

  doc.querySelectorAll<HTMLElement>("[data-export-chat-panel]").forEach((panel) => {
    panel.style.width = "100%";
    panel.style.maxWidth = `${chatMax}px`;
    expandWidth(panel);
  });

  doc.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const t = el.style.transform;
    if (t && /scale\(/i.test(t)) {
      el.style.transform = "none";
    }
  });

  doc.querySelectorAll<HTMLElement>(".grid.grid-cols-2").forEach((el) => {
    if (placedWidth < 520) {
      el.classList.remove("grid-cols-2");
      el.classList.add("grid-cols-1");
    }
  });

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

  return Math.ceil(doc.body.scrollHeight);
}
