import { Easing, interpolate } from "remotion";

/** Colors taken from the B2B prototype (joola.com tokens, not invented accents). */
export const C = {
  canvas: "#EDEDEC",
  paper: "#FFFFFF",
  ink: "#1A1A1A",
  muted: "#595959",
  faint: "#808080",
  dim: "#B0B0B0",
  line: "#ECECEA",
  lineStrong: "#DEDEDE",
  field: "#F6F6F6",
  band: "#FAFAF9",
  blue: "#2C3EE0",
  blueWash: "#E7E9FB",
  green: "#198754",
  greenWash: "#E7F4EE",
  black: "#000000",
  buttonText: "#EAEAEA",
} as const;

/** Strong ease-out for entrances. Matches a restrained product-film settle. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** Ease-in-out for elements already on screen. */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const rise = (frame: number, delay: number, distance = 12) => {
  const p = interpolate(frame, [delay, delay + 16], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
  };
};

/** Brief press. Scale stays near 1 — nothing pops in from zero. */
export const press = (frame: number, at: number) =>
  interpolate(frame, [at, at + 3, at + 10], [1, 0.98, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
