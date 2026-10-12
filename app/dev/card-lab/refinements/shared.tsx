import type { CSSProperties, ReactNode } from "react";
import ControlledMedia, {
  CONTROLLED_ASPECT,
} from "../shell/ControlledMedia";

/** Same project text on every refinement card — controlled comparison. */
export const REF_PROJECT = {
  title: "Simplifying UCLA subleasing",
  meta: "product design + frontend",
  role: "Product designer",
  year: "2026",
} as const;

export type ChipKind =
  | "none"
  | "outline"
  | "tint"
  | "mono"
  | "year"
  | "role";

export type ChipPlace = "below" | "over";

export type RefCardProps = {
  forceHover?: boolean;
  direction?: number;
  /** data-cl-variant + label id */
  id: string;
  axis: "type" | "colour" | "chips" | "spacing" | "hover";
  titleWeight?: number;
  metaWeight?: number;
  titleSize?: number;
  metaSize?: number;
  letterSpacing?: string;
  metaFace?: "sans" | "mono" | "smallcaps";
  titleColor?: string;
  metaColor?: string;
  surface?: string;
  accent?: boolean;
  dark?: boolean;
  chip?: ChipKind;
  chipPlace?: ChipPlace;
  chipRadius?: number;
  chipSize?: number;
  gap?: number;
  inlineMeta?: boolean;
  radius?: number;
  border?: boolean;
  insetShadow?: boolean;
  hover?: "none" | "arrow" | "underline" | "scale" | "meta-shift";
  children?: ReactNode;
  style?: CSSProperties;
};

function Chip({
  kind,
  place,
  radius,
  size,
  accent,
}: {
  kind: ChipKind;
  place: ChipPlace;
  radius: number;
  size: number;
  accent?: boolean;
}) {
  if (kind === "none") return null;
  const text =
    kind === "year"
      ? REF_PROJECT.year
      : kind === "role"
        ? REF_PROJECT.role
        : kind === "mono"
          ? "CASE STUDY"
          : REF_PROJECT.role;
  return (
    <span
      className={`cl-ref__chip cl-ref__chip--${kind}${place === "over" ? " cl-ref__chip--over" : ""}`}
      data-cl-ref-chip={kind}
      data-cl-ref-chip-place={place}
      style={{
        fontSize: size,
        borderRadius: radius >= 99 ? 999 : radius,
        ...(accent && kind === "tint"
          ? { background: "color-mix(in srgb, var(--cl-accent) 16%, transparent)", color: "var(--cl-accent)" }
          : null),
      }}
    >
      {text}
    </span>
  );
}

export function RefinementCard(p: RefCardProps) {
  const force = !!p.forceHover;
  const gap = p.gap ?? 8;
  const radius = p.radius ?? 4;
  const chip = p.chip ?? "none";
  const chipPlace = p.chipPlace ?? "below";
  const chipRadius = p.chipRadius ?? 4;
  const chipSize = p.chipSize ?? 11;
  const hover = p.hover ?? "none";
  const metaFace = p.metaFace ?? "sans";
  const titleW = p.titleWeight ?? 500;
  const metaW = p.metaWeight ?? 400;
  const titlePx = p.titleSize ?? 18;
  const metaPx = p.metaSize ?? 13;

  return (
    <div
      className={`cl-ref${force ? " cl-ref--force-hover" : ""}${p.dark ? " cl-ref--dark" : ""}`}
      data-cl-card
      data-cl-kind="refinement"
      data-cl-direction={p.direction != null ? String(p.direction) : undefined}
      data-cl-axis={p.axis}
      data-cl-variant={p.id}
      data-cl-force-hover={force ? "1" : "0"}
      data-cl-hover={hover}
      data-cl-ref-dark={p.dark ? "1" : "0"}
      style={{
        gap,
        background: p.surface,
        ...p.style,
      }}
    >
      <div
        className="cl-ref__media-wrap"
        data-cl-media-wrap
        data-cl-stage
        style={{
          borderRadius: radius,
          border: p.border ? "1px solid var(--cl-ref-border)" : undefined,
          boxShadow: p.insetShadow
            ? "inset 0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
            : undefined,
        }}
      >
        <ControlledMedia
          aspect={CONTROLLED_ASPECT}
          radius={radius}
          className="cl-ref__media"
        />
        {chip !== "none" && chipPlace === "over" ? (
          <Chip
            kind={chip}
            place="over"
            radius={chipRadius}
            size={chipSize}
            accent={p.accent}
          />
        ) : null}
      </div>

      <div className="cl-ref__copy" data-cl-copy>
        <div
          className={`cl-ref__title-row${p.inlineMeta ? " cl-ref__title-row--inline" : ""}`}
        >
          <div className="cl-ref__title-wrap">
            <p
              className="cl-ref__title"
              data-cl-card-title
              style={{
                fontWeight: titleW,
                fontSize: titlePx,
                lineHeight: `${titlePx >= 18 ? 24 : 20}px`,
                letterSpacing: p.letterSpacing,
                color: p.titleColor,
                textDecoration:
                  hover === "underline" && force ? "underline" : undefined,
                textUnderlineOffset: 3,
              }}
            >
              {REF_PROJECT.title}
            </p>
            {hover === "arrow" ? (
              <span className="cl-ref__arrow" data-cl-ref-arrow aria-hidden>
                →
              </span>
            ) : null}
          </div>
          {p.inlineMeta ? (
            <span
              className="cl-ref__year"
              style={{
                fontWeight: metaW,
                fontSize: metaPx,
                lineHeight: "20px",
                color: p.metaColor,
              }}
            >
              {REF_PROJECT.year}
            </span>
          ) : null}
        </div>

        {!p.inlineMeta ? (
          <p
            className={`cl-ref__meta cl-ref__meta--${metaFace}`}
            data-cl-card-desc
            style={{
              fontWeight: metaW,
              fontSize: metaPx,
              lineHeight: "20px",
              color:
                hover === "meta-shift" && force
                  ? "var(--cl-accent)"
                  : p.metaColor,
              letterSpacing: metaFace === "smallcaps" ? "0.06em" : undefined,
            }}
          >
            {REF_PROJECT.meta}
          </p>
        ) : (
          <p className="cl-ref__meta" data-cl-card-desc hidden>
            {REF_PROJECT.meta}
          </p>
        )}

        {chip !== "none" && chipPlace === "below" ? (
          <div className="cl-ref__chip-row">
            <Chip
              kind={chip}
              place="below"
              radius={chipRadius}
              size={chipSize}
              accent={p.accent}
            />
          </div>
        ) : null}
      </div>
      {p.children}
    </div>
  );
}
