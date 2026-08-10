/**
 * Same-layout ATF placeholder for case-study navigations.
 * Matches .cs-layout / hero structure so a brief flash reads as continuous
 * chrome rather than a spinner or gray shimmer. Prefer prefetch so this
 * rarely paints at all.
 */
export default function CaseStudyLoadingSilhouette({
  heroBg = "var(--color-placeholder)",
  /** Media box aspect — UCLA Mux hero ~16/9; sviz screenshot 1596/1388. */
  mediaAspect = "16 / 9",
  /** When true, only the hero ATF block (for Suspense inside page chrome). */
  contentOnly = false,
}: {
  heroBg?: string;
  mediaAspect?: string;
  contentOnly?: boolean;
}) {
  const hero = (
    <header className="cs-hero-header">
      <div className="cs-hero-tagline-wrap">
        <div
          style={{
            width: "42%",
            maxWidth: 220,
            height: 14,
            borderRadius: 4,
            background: "var(--color-border-subtle)",
            margin: "0 0 var(--space-2)",
            opacity: 0.55,
          }}
        />
      </div>
      <div className="cs-hero-title-wrap">
        <div
          style={{
            width: "78%",
            maxWidth: 420,
            height: "calc(var(--fs-hero) * 1.1)",
            borderRadius: 6,
            background: "var(--color-border-subtle)",
            margin: "0 0 var(--space-4)",
            opacity: 0.45,
          }}
        />
      </div>
      <div className="cs-hero-media-wrap">
        <div
          style={{
            background: heroBg,
            borderRadius: "var(--radius-card)",
            overflow: "hidden",
            aspectRatio: mediaAspect,
            width: "100%",
          }}
        />
      </div>
    </header>
  );

  if (contentOnly) return <div aria-hidden>{hero}</div>;

  return (
    <div
      style={{ fontFamily: "var(--font-sans)", background: "var(--color-bg)" }}
      aria-hidden
    >
      <div className="cs-layout">
        <aside className="cs-aside">
          <div style={{ height: 120 }} />
        </aside>

        <div className="cs-content" style={{ maxWidth: "var(--content-max-w)", minWidth: 0 }}>
          <div className="cs-mobile-back" style={{ height: 28, marginBottom: "var(--space-1)" }} />
          {hero}
        </div>
      </div>
    </div>
  );
}
