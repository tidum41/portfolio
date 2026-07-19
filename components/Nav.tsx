"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import VolumeControl from "./VolumeControl";
import HalftoneNavLink from "./HalftoneNavLink";
import { useDialKit } from "dialkit";

const links = [
  { href: "/",           label: "work" },
  { href: "/playground", label: "play" },
  { href: "/about",      label: "about" },
];

export default function Nav() {
  const pathname = usePathname();

  // DialKit auto-generates each slider's on-screen label from its key name
  // (camelCase -> "Title Case") and has no separate description field, so
  // the key names below ARE the UI copy — chosen to be readable with no
  // prior vocabulary, grouped into folders by what part of the effect they
  // touch. A parallel plain-English glossary (what each one does + which
  // way to drag it) lives in docs/halftone-dial-guide.md.
  const dk = useDialKit("Nav Links", {
    enabled: true,
    // Pins the effect active regardless of real hover/tap, so it stays
    // visible while you move the mouse to this panel and drag a slider —
    // without it, leaving the target element to reach the panel fires
    // onMouseLeave and springs the effect back to rest before you can see
    // what changed. Dev-only: this panel never mounts in production, so
    // this always resolves to its false default for real visitors.
    keepEffectOn: false,

    dotShape: {
      _collapsed: true,
      // Grid spacing (CSS px) between candidate dot positions. Smaller =
      // more, denser dots.
      dotSpacing: [2.25, 1.5, 8, 0.25],
      // Each dot's radius at full ink coverage and full activation. Kept
      // comfortably under half of dotSpacing — even a fully-inked dot
      // leaves a visible gap to its neighbors instead of merging into a
      // solid blob, which is what "individual ink droplets" requires.
      dotSize: [0.8, 0.4, 4, 0.1],
      // How dramatically dot size varies between "mostly ink" and "edge of
      // a stroke" — higher shrinks partial-coverage dots more aggressively,
      // giving more visible size variation instead of most dots looking
      // similarly big.
      sizeContrast: [0.95, 0.3, 2.5, 0.05],
      // Cells with less ink coverage than this are dropped entirely (no dot
      // at all) — raises the bar for how faint a sliver of a letterform can
      // be and still get a dot.
      minVisibility: [0.07, 0, 0.3, 0.01],
      gridShiftX: [0, -3, 3, 0.1],
      gridShiftY: [0, -3, 3, 0.1],
    },

    ripple: {
      _collapsed: true,
      // Fraction of the timeline spent on the per-dot cascade — 0 is every
      // dot moving in lockstep, higher spreads dots' fill-in/recede across
      // a wider window for the "ink droplets settling individually" read.
      rippleSpread: [0.1, 0, 0.9, 0.05],
      // Blend between "ripples outward from the center" (0) and a stable
      // per-dot random order (1), so the cascade isn't a perfectly clean
      // ring.
      rippleRandomness: [0.25, 0, 1, 0.05],
      // true = dots fill in starting from the center and spreading outward;
      // false = starting from the edges and closing inward.
      rippleOutward: true,
    },

    // --- The "melt" — the crisp text/icon blurring and fusing into dots,
    // see HalftoneDotField.tsx's draw(). This is the group that controls
    // whether it reads as one shape morphing vs. two things crossfading. ---
    meltEffect: {
      // Peak blur (CSS px) applied to the text/icon + dots together at the
      // most intense point of the transition. Higher = softer, hazier peak.
      // Too high lets the fused mass balloon past the actual letterform
      // into a generic blob instead of hugging its real shape.
      blurStrength: [0.35, 0, 4, 0.1],
      // Where in the transition (0 = very start, 1 = very end) the blur/
      // fusion peaks. Below 0.5 front-loads the melt into the early part of
      // the "show" animation, leaving a longer tail for dots to visibly
      // separate before settling.
      meltPeakTiming: [0.45, 0.15, 0.85, 0.05],
      // How much extra each dot temporarily grows at the melt's peak, so
      // neighboring dots actually overlap and have something to fuse
      // instead of just softening in place. Higher = bigger, more connected
      // fused mass. No effect at rest (start/end of the transition).
      dotOverlapAmount: [1.25, 1, 4, 0.1],
      // How crisp vs. soft the fused mass's outer edge looks at the melt's
      // peak. Higher = a harder, more defined edge; lower = a fuzzier one.
      edgeSharpness: [12, 6, 40, 1],
      // Shrinks the fused mass back down toward the dots' true footprint at
      // the melt's peak. Higher = tighter to the real letterform; lower =
      // the fused mass balloons outward past it.
      fusionTightness: [6, 2, 15, 0.5],
      // How much of the transition the crisp text/icon spends actively
      // fading away (activating) or back in (deactivating), as a fraction
      // of the same 0-1 timeline meltPeakTiming uses. Keep this close to
      // meltPeakTiming, not much smaller — verified live that too small a
      // value makes the crisp shape finish fading to fully transparent
      // *before* blurStrength has ramped up, which reads as a flat
      // transparency dissolve on a still-sharp shape (a plain fade) instead
      // of the shape visibly softening/deforming as it disappears (a melt).
      // At the current default, the shape isn't fully gone until blur is
      // already ~97% of its peak.
      textMeltDuration: [0.4, 0.05, 0.7, 0.01],
      // Optional flat, constant blur over the whole dot layer regardless of
      // transition progress — cheap, off by default. Unlike blurStrength
      // above (which varies through the transition and returns to exactly
      // 0 at rest), this stays on the whole time the dots are visible —
      // don't combine the two by default, it'd double-soften.
      extraSoftness: [0, 0, 2, 0.1],
    },

    showHideSpeed: {
      // How long (ms) the crisp text/icon takes to fade out and the dot
      // layer takes to fade in, on hover/tap-in. This is a separate, fixed
      // timer from the melt/spring physics above — see
      // useHalftoneMorph.ts's doc comment for why.
      showDurationMs: [220, 50, 800, 10],
      // Same, but for fading back on mouse-out — slower than showDurationMs
      // so the fade stays visible across roughly the same real-time span
      // the (much slower, bouncier) settle physics below take to finish.
      hideDurationMs: [550, 50, 2000, 10],
      // Debug-only: stretches the whole physics timeline by this factor (1
      // = normal speed) so the transition can be watched frame by frame
      // instead of happening in a blink. Does not affect showDurationMs/
      // hideDurationMs above, only the Bounce Physics group below.
      slowMotion: [1, 1, 30, 1],
    },

    bouncePhysics: {
      _collapsed: true,
      // Spring physics for the dots settling into place on activation
      // (higher activateSpeed = snappier start) and on release (lower
      // settleSpeed + low settleWobbleControl = a slow, underdamped
      // settle that overshoots and wobbles before stopping — reads as ink
      // surface tension rather than a flat mechanical stop). Lower
      // activateSmoothness/settleWobbleControl = more overshoot/bounce;
      // higher = calms down faster with less bounce.
      activateSpeed: [260, 10, 1000, 5],
      activateSmoothness: [20, 2, 100, 1],
      settleSpeed: [13, 1, 1000, 1],
      settleWobbleControl: [3.2, 1, 100, 0.5],
      // How much the crisp text (textEndScale) and the dot overlay
      // (dotsEndScale) each scale up/down by the time the transition is
      // fully complete. 1 = no size change.
      textEndScale: [1, 0.5, 1.5, 0.01],
      dotsEndScale: [1, 0.5, 1.5, 0.01],
    },
  });

  return (
    <header className="intro-hide" style={{ background: "transparent", position: "relative", zIndex: 40 }}>
      <div style={{ maxWidth: "var(--grid-max-w)", margin: "0 auto", paddingLeft: "var(--page-px)", paddingRight: "var(--page-px)" }}>
        <nav
          className="flex items-center justify-end"
          style={{ gap: 40, paddingTop: 24, paddingBottom: 24 }}
          aria-label="Main navigation"
        >
          <VolumeControl dk={dk} />
          <ThemeToggle dk={dk} />
          {links.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <HalftoneNavLink
                key={href}
                href={href}
                label={label}
                isActive={isActive}
                dk={dk}
              />
            );
          })}
        </nav>
      </div>
    </header>
  );
}
