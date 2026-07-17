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
    dotSize: [2, 1, 12, 1],
    blurAmount: [0.5, 0, 5, 0.1],
    textAlphaMult: [1.1, 0.5, 3, 0.1],
    patternAlphaMult: [1.3, 0.5, 3, 0.1],
    thresholdMult: [48, 5, 100, 1],
    thresholdOffset: [28, 0, 50, 1],
    offsetX: [-2, -10, 10, 0.1],
    offsetY: [0, -10, 10, 0.1],
    stiffness: [150, 10, 1000, 5],
    damping: [15, 2, 100, 1],
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
          <VolumeControl />
          <ThemeToggle />
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
