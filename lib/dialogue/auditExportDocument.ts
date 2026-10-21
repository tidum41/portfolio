export type ExportAuditHit = {
  kind: "doc-scroll" | "el-scroll" | "text-clip";
  detail: string;
};

export function auditExportDocument(doc: Document, frameWidth?: number): ExportAuditHit[] {
  const hits: ExportAuditHit[] = [];
  const de = doc.documentElement;
  const limitW = frameWidth ?? de.clientWidth;
  if (de.scrollWidth > limitW + 1) {
    hits.push({
      kind: "doc-scroll",
      detail: `document scrollWidth ${de.scrollWidth} > limit ${limitW}`,
    });
  }

  const overflowEls = doc.querySelectorAll<HTMLElement>("*");
  overflowEls.forEach((el) => {
    const st = getComputedStyle(el);
    const ox = st.overflowX;
    const oy = st.overflowY;
    const clipsX = ox === "hidden" || ox === "clip" || ox === "auto" || ox === "scroll";
    const clipsY = oy === "hidden" || oy === "clip" || oy === "auto" || oy === "scroll";
    if (clipsX && el.scrollWidth > el.clientWidth + 1) {
      hits.push({
        kind: "el-scroll",
        detail: `${el.tagName}.${el.className?.toString().slice(0, 40)} scrollW ${el.scrollWidth} > clientW ${el.clientWidth}`,
      });
    }
    if (clipsY && el.scrollHeight > el.clientHeight + 1) {
      hits.push({
        kind: "el-scroll",
        detail: `${el.tagName}.${el.className?.toString().slice(0, 40)} scrollH ${el.scrollHeight} > clientH ${el.clientHeight}`,
      });
    }
  });

  const textHosts = doc.querySelectorAll<HTMLElement>(
    "p, span, li, td, th, label, h1, h2, h3, button, [data-export-chat-panel]",
  );
  textHosts.forEach((el) => {
    const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (text.length < 4) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;

    let clipper: HTMLElement | null = el.parentElement;
    while (clipper && clipper !== doc.body) {
      const st = getComputedStyle(clipper);
      const clips =
        st.overflowX === "hidden" ||
        st.overflowX === "clip" ||
        st.overflow === "hidden" ||
        st.overflow === "clip";
      if (clips) {
        const cRect = clipper.getBoundingClientRect();
        if (rect.right > cRect.right + 1.5 || rect.left < cRect.left - 1.5) {
          hits.push({
            kind: "text-clip",
            detail: `"${text.slice(0, 48)}" outside ${clipper.tagName} by ${Math.round(rect.right - cRect.right)}px`,
          });
        }
        break;
      }
      clipper = clipper.parentElement;
    }
  });

  return hits;
}
