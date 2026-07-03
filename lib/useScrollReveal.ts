import { useEffect, useRef } from "react";

// Attaches IntersectionObserver to a container element.
// Children with className "reveal" gain "visible" when they enter the viewport.
// CSS transition is defined in globals.css (.reveal / .reveal.visible).
export function useScrollReveal(rootMargin = "0px 0px -60px 0px") {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const els = Array.from(container.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [rootMargin]);

  return ref;
}
