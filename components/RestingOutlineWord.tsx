import { NAV_WORD_ASSETS } from "./navWordAssets";

/**
 * Resting nav letter: the same droplet outlines the morph uses at progress 0,
 * baked into a static, content-hashed SVG (scripts/bake-nav-svgs.mjs) and
 * referenced with an external <use>, so the path data is cached across pages
 * instead of being written into every document. The paths are still drawn as
 * vectors in place (a CSS mask rasterizes them as an image and shifts the
 * antialiasing), and fill follows currentColor so the link can mark the
 * current page.
 */
export default function RestingOutlineWord({ label }: { label: keyof typeof NAV_WORD_ASSETS }) {
  const a = NAV_WORD_ASSETS[label];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: a.height,
        color: "inherit",
      }}
    >
      <svg
        width={a.width}
        height={a.height}
        viewBox={`0 0 ${a.width} ${a.height}`}
        aria-hidden
        style={{ display: "block", overflow: "visible" }}
      >
        <use href={`${a.url}#w`} fill="currentColor" />
      </svg>
    </span>
  );
}
