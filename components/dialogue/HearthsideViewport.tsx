"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import StaticFigure from "@/components/dialogue/StaticFigure";
import ScaledChatViewport from "@/components/dialogue/product/ScaledChatViewport";

function usePhone(query = "(max-width: 480px)") {
  const [phone, setPhone] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return phone;
}

/** A round P figure body: children rendered at their real product width
    inside ScaledChatViewport. On phones the scale also fits the figure
    under the round's height cap (hero 560, other figures 520) instead of
    reflowing taller, and nothing is cropped. */
export default function HearthsideViewport({
  name,
  title,
  innerWidth = 448,
  phoneCap,
  children,
}: {
  name: string;
  title: string;
  innerWidth?: number;
  phoneCap: number;
  children: ReactNode;
}) {
  const phone = usePhone();
  return (
    <StaticFigure
      figure={name}
      className="dialogue-product-block dialogue-product-block--static"
      aria-label={title}
    >
      <ScaledChatViewport
        innerWidth={innerWidth}
        maxScale={1}
        maxHeight={phone ? phoneCap : undefined}
      >
        {children}
      </ScaledChatViewport>
    </StaticFigure>
  );
}
