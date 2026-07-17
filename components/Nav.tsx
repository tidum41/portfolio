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

  const dk = useDialKit("Nav Links", {
    enabled: true,
    // "Active" endpoint (t=1) — today's fully-halftoned end state.
    dotSize: [2, 1, 12, 1],
    blurAmount: [0.5, 0, 5, 0.1],
    thresholdMult: [48, 5, 100, 1],
    thresholdOffset: [28, 0, 50, 1],
    // "Rest" endpoint (t=0) — crisp text, no dot grid. thresholdMultRest=1/
    // thresholdOffsetRest=0 is an identity pass-through of the feColorMatrix
    // (output alpha = input alpha), i.e. genuinely no effect at rest.
    dotSizeRest: [1, 0.5, 4, 0.25],
    blurAmountRest: [0, 0, 2, 0.1],
    thresholdMultRest: [1, 0.5, 5, 0.1],
    thresholdOffsetRest: [0, 0, 10, 0.5],
    offsetX: [-4.4, -10, 10, 0.1],
    offsetY: [0, -10, 10, 0.1],
    stiffnessIn: [260, 10, 1000, 5],
    dampingIn: [20, 2, 100, 1],
    // Underdamped on purpose (damping well below the ~7.2 critical value for
    // this stiffness) — the dot grid overshoots past its rest size and
    // settles back with a visible wobble, reading as dots bubbling back into
    // place like ink surface tension rather than a flat, mechanical fade.
    stiffnessOut: [13, 1, 1000, 1],
    dampingOut: [3.2, 1, 100, 0.5],
    hoverScaleBase: [1, 0.5, 1.5, 0.01],
    hoverScaleHalf: [1, 0.5, 1.5, 0.01],
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
