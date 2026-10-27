import { OUTLINE_META } from "./outlineMorphMeta";
import { RESTING_PATHS } from "./outlineRestingPaths";

/**
 * Resting nav letter, rendered on the server from the same droplet outlines
 * the morph uses at progress 0 (stored as compact relative paths, same
 * geometry). The animated end-state paths stay out of the first-load
 * JavaScript and load with the morph on hover.
 * Color is inherited so the client link can mark the current page.
 */
export default function RestingOutlineWord({ label }: { label: string }) {
  const entry =
    OUTLINE_META.find(([name]) => name === label) ||
    OUTLINE_META.find(([name]) => name.toLowerCase() === label.toLowerCase());
  const paths = entry && RESTING_PATHS[entry[0]];
  if (!entry || !paths) {
    return <span>{label}</span>;
  }
  const [, width, height] = entry;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height,
        color: "inherit",
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
        style={{ display: "block", overflow: "visible" }}
      >
        {paths.map((d, index) => (
          <path key={index} d={d} fill="currentColor" />
        ))}
      </svg>
    </span>
  );
}
