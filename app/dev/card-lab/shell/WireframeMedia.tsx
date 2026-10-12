import type { WireframeKind } from "../concepts/projects";

/**
 * Low-cost CSS wireframe of a UI screen. No network images.
 * Varies per project so cards are not identical grey blocks.
 */
export default function WireframeMedia({
  kind,
  aspect,
  radius,
  className,
  dimmed = false,
  play = false,
  fill = false,
}: {
  kind: WireframeKind;
  aspect: string;
  radius?: number;
  className?: string;
  /** Soft dim for dual-CTA hover (~40% veil over the wireframe). */
  dimmed?: boolean;
  /** Subtle CSS “play” shimmer for status-line hover. */
  play?: boolean;
  /** Stretch to parent height instead of locking aspect ratio. */
  fill?: boolean;
}) {
  return (
    <div
      className={`cl-wire${className ? ` ${className}` : ""}${dimmed ? " cl-wire--dimmed" : ""}${play ? " cl-wire--play" : ""}${fill ? " cl-wire--fill" : ""}`}
      data-cl-media
      data-cl-wireframe={kind}
      data-cl-aspect={fill ? "fill" : aspect}
      style={{
        aspectRatio: fill ? undefined : aspect,
        borderRadius: radius !== undefined ? `${radius}px` : undefined,
      }}
    >
      <div className="cl-wire__chrome" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {kind === "listings" ? (
        <div className="cl-wire__body cl-wire__body--listings" aria-hidden="true">
          <aside className="cl-wire__side">
            <i />
            <i />
            <i />
            <i />
          </aside>
          <div className="cl-wire__main">
            <div className="cl-wire__toolbar">
              <i className="cl-wire__search" />
              <i className="cl-wire__btn" />
            </div>
            <div className="cl-wire__cards">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      ) : null}
      {kind === "tasks" ? (
        <div className="cl-wire__body cl-wire__body--tasks" aria-hidden="true">
          <div className="cl-wire__toolbar">
            <i className="cl-wire__titlebar" />
            <i className="cl-wire__btn" />
          </div>
          <ul className="cl-wire__list">
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line" />
            </li>
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line cl-wire__line--mid" />
            </li>
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line cl-wire__line--short" />
            </li>
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line" />
            </li>
          </ul>
        </div>
      ) : null}
      {kind === "video" ? (
        <div className="cl-wire__body cl-wire__body--video" aria-hidden="true">
          <div className="cl-wire__stage">
            <i className="cl-wire__playbtn" />
          </div>
          <div className="cl-wire__meta">
            <i className="cl-wire__line" />
            <i className="cl-wire__line cl-wire__line--short" />
          </div>
        </div>
      ) : null}
      {kind === "player" ? (
        <div className="cl-wire__body cl-wire__body--player" aria-hidden="true">
          <i className="cl-wire__disc" />
          <div className="cl-wire__deck">
            <i className="cl-wire__line" />
            <i className="cl-wire__slider" />
            <div className="cl-wire__controls">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      ) : null}
      {kind === "habits" ? (
        <div className="cl-wire__body cl-wire__body--habits" aria-hidden="true">
          <div className="cl-wire__phone">
            <i className="cl-wire__titlebar" />
            <div className="cl-wire__grid">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <i className="cl-wire__btn cl-wire__btn--wide" />
          </div>
        </div>
      ) : null}
      {dimmed ? <span className="cl-wire__veil" aria-hidden="true" /> : null}
      {play ? <span className="cl-wire__shimmer" aria-hidden="true" /> : null}
    </div>
  );
}
