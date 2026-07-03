import Link from "next/link";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import { getProjects } from "@/lib/sanity/queries";

const PS3Silk         = dynamic(() => import("@/components/PS3Silk"));
const PS3ControlPanel = dynamic(() => import("@/components/PS3ControlPanel"));
const CDPlayer        = dynamic(() => import("@/components/CDPlayer"));
const MuxAutoplayCard = dynamic(() => import("@/components/MuxAutoplayCard"));

// ─── Interactive badge ─────────────────────────────────────────────────
function InteractiveBadge() {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "8px 12px",
      background: "var(--color-badge-bg)",
      border: "1px solid var(--color-border-subtle)",
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      color: "var(--color-text-card-sub)",
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width={20} height={20} style={{ flexShrink: 0 }}>
        <path d="M64,76a52,52,0,0,1,104,0" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M72,224,42.68,174a20,20,0,0,1,34.64-20L96,184V76a20,20,0,0,1,40,0v56a20,20,0,0,1,40,0v16a20,20,0,0,1,40,0v36c0,24-8,40-8,40" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: 15,
        lineHeight: "18px",
        color: "var(--color-text-card-sub)",
        whiteSpace: "nowrap",
      }}>interactive</span>
    </div>
  );
}

// ─── Card label ────────────────────────────────────────────────────────
function CardLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: 0 }}>
      <p style={{
        fontFamily: "var(--font-sans-medium)",
        fontWeight: "var(--fw-card-title)" as React.CSSProperties["fontWeight"],
        fontSize: 18,
        lineHeight: 1.4,
        color: "var(--color-text-primary)",
        margin: 0,
      }}>{title}</p>
      {sub && (
        <p style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--color-text-tertiary)",
          margin: "4px 0 0",
          letterSpacing: "0.01em",
        }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Home page (server component — fetches projects from Sanity) ───────
export default async function Home() {
  const projects = await getProjects();

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Hero — full-viewport width, no max-width constraint ── */}
      <section
        aria-label="Introduction"
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <PS3Silk
          mode={1}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />
        <div style={{
          position: "relative",
          maxWidth: "var(--grid-max-w)",
          marginInline: "auto",
          paddingLeft: 40,
          paddingRight: 40,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          <HeroTextWithRabbit />
        </div>
      </section>

      {/* ── Project grid ── */}
      <div style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: 40, paddingRight: 40 }}>
      <ScrollReveal>
        <section
          aria-label="Portfolio"
          className="project-grid portfolio-grid"
          style={{
            paddingTop: 48,
            paddingBottom: 48,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(1px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
            {projects
              .filter((_, i) => i % 2 === 0)
              .map((p) =>
                p.mediaType === "video" && p.muxPlaybackId ? (
                  <MuxAutoplayCard
                    key={p._id}
                    playbackId={p.muxPlaybackId}
                    href={p.href}
                    title={p.title}
                    sub={p.subtitle}
                    aspectRatio={p.aspectRatio}
                  />
                ) : p.image?.asset?.url ? (
                  <div key={p._id} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <img
                          src={p.image.asset.url}
                          alt={p.title}
                          loading="lazy"
                          className="project-image"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </div>
                ) : null
              )}

            {/* CDPlayer — always in left column after Sanity projects */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "1296 / 1080" }}>
                <CDPlayer />
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
              </div>
              <CardLabel title="Drag a CD" sub="exploration" />
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
            {projects
              .filter((_, i) => i % 2 === 1)
              .map((p) =>
                p.mediaType === "video" && p.muxPlaybackId ? (
                  <MuxAutoplayCard
                    key={p._id}
                    playbackId={p.muxPlaybackId}
                    href={p.href}
                    title={p.title}
                    sub={p.subtitle}
                    aspectRatio={p.aspectRatio}
                  />
                ) : p.image?.asset?.url ? (
                  <div key={p._id} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <img
                          src={p.image.asset.url}
                          alt={p.title}
                          loading="lazy"
                          className="project-image"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </div>
                ) : null
              )}

            {/* Habit tracker placeholder — always in right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-warm-bg)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: 5 }}>
                  <InteractiveBadge />
                </div>
                <div style={{ display: "flex", justifyContent: "center", paddingBottom: 10 }}>
                  <div style={{ width: 200, height: 360, background: "var(--color-warm-inner)", borderRadius: 24 }} />
                </div>
              </div>
              <CardLabel title="dumb habit tracker" sub="product design + frontend" />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <PS3ControlPanel />
      </div>
    </div>
  );
}
