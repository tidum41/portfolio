import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ScrollReveal";
import HeroTextWithRabbit from "@/components/HeroTextWithRabbit";
import InteractiveBadge from "@/components/InteractiveBadge";
import { getProjects } from "@/lib/sanity/queries";

export const revalidate = 60;

const PS3Silk         = dynamic(() => import("@/components/PS3Silk"));
const PS3ControlPanel = dynamic(() => import("@/components/PS3ControlPanel"));
const CDPlayer        = dynamic(() => import("@/components/CDPlayer"));
const MuxAutoplayCard = dynamic(() => import("@/components/MuxAutoplayCard"));
const PhoneEmbed      = dynamic(() => import("@/components/PhoneEmbed"));

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
          paddingLeft: "var(--page-px)",
          paddingRight: "var(--page-px)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          <HeroTextWithRabbit />
        </div>
      </section>

      {/* ── Project grid ── */}
      <div style={{ maxWidth: "var(--grid-max-w)", marginInline: "auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}>
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
                  <div key={p._id} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <MuxAutoplayCard
                      playbackId={p.muxPlaybackId}
                      href={p.href}
                      title={p.title}
                      sub={p.subtitle}
                      aspectRatio={p.aspectRatio}
                    />
                  </div>
                ) : p.image?.asset?.url ? (
                  <div key={p._id} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div className="project-img-wrap" style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <Image
                          src={p.image.asset.url}
                          alt={p.title}
                          fill
                          className="project-image"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </div>
                ) : null
              )}

            {/* CDPlayer — always in left column after Sanity projects */}
            <div data-cursor-label="click around!" data-cursor-timed style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="project-image" style={{ borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4 / 3" }}>
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
                  <div key={p._id} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <MuxAutoplayCard
                      playbackId={p.muxPlaybackId}
                      href={p.href}
                      title={p.title}
                      sub={p.subtitle}
                      aspectRatio={p.aspectRatio}
                    />
                  </div>
                ) : p.image?.asset?.url ? (
                  <div key={p._id} className="project-card" style={{ display: "flex", flexDirection: "column", gap: 8 }} {...(p.caseStudy ? { "data-cursor-label": "View Case Study" } : {})}>
                    <Link href={p.href} prefetch style={{ textDecoration: "none", display: "block" }}>
                      <div className="project-img-wrap" style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-placeholder)", aspectRatio: p.aspectRatio, position: "relative" }}>
                        <Image
                          src={p.image.asset.url}
                          alt={p.title}
                          fill
                          className="project-image"
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </Link>
                    <CardLabel title={p.title} sub={p.subtitle} />
                  </div>
                ) : null
              )}

            {/* Habit tracker — phone embed */}
            <div data-cursor-label="click around!" data-cursor-timed style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ borderRadius: 4, overflow: "hidden", background: "var(--color-phone-bg)", position: "relative" }}>
                <div style={{ position: "absolute", top: 5, right: 5, zIndex: 10, pointerEvents: "none" }}>
                  <InteractiveBadge />
                </div>
                <PhoneEmbed
                  url="https://sprightly-stroopwafel-8f1061.netlify.app/"
                  frameSrcLight="/phonemockup-light.webp"
                  frameSrcDark="/phonemockup-dark.webp"
                />
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
