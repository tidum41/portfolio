import { OUTLINE_WORDS } from "./outlineMorphData";

/**
 * Resting nav letter, rendered on the server from the same droplet outlines
 * the morph uses at progress 0. The animated end-state paths stay out of the
 * first-load JavaScript and load with the morph on hover.
 * Color is inherited so the client link can mark the current page.
 */
export default function RestingOutlineWord({ label }: { label: string }) {
  const word = OUTLINE_WORDS.find((entry) => entry.label === label);
  if (!word) {
    return <span>{label}</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: word.height,
        color: "inherit",
      }}
    >
      <svg
        width={word.width}
        height={word.height}
        viewBox={`0 0 ${word.width} ${word.height}`}
        aria-hidden
        style={{ display: "block", overflow: "visible" }}
      >
        {word.droplets.map((droplet, index) => (
          <path key={index} d={droplet.start} fill="currentColor" />
        ))}
      </svg>
    </span>
  );
}
