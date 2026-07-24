/** Northeast arrow — same glyph as GlobalCustomCursor's ARROW_ICON_SVG. */
export default function NortheastArrow({ size = 13 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <line x1="2" y1="10" x2="10" y2="2" />
      <polyline points="4,2 10,2 10,8" />
    </svg>
  );
}
