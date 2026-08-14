/** Instant archive chrome while the gallery RSC payload arrives.
 *  Without this, Next keeps the previous page on screen until Sanity
 *  returns — archive nav clicks felt dead. */
export default function Loading() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bg)",
      }}
    />
  );
}
