import type { WireframeKind } from "../concepts/projects";

/**
 * Low-cost CSS wireframe of a UI screen. No network images.
 * Varies per project so cards are not identical grey blocks.
 * Layouts fill the media frame — chrome + body stretch to the bottom.
 */
export default function WireframeMedia({
  kind,
  aspect,
  radius,
  className,
  dimmed = false,
  play = false,
  fill = false,
  /** Reserve a clear top band (px) so an overlay chip does not cover chrome. */
  topClear = 0,
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
  topClear?: number;
}) {
  return (
    <div
      className={`cl-wire${className ? ` ${className}` : ""}${dimmed ? " cl-wire--dimmed" : ""}${play ? " cl-wire--play" : ""}${fill ? " cl-wire--fill" : ""}${topClear > 0 ? " cl-wire--top-clear" : ""}`}
      data-cl-media
      data-cl-wireframe={kind}
      data-cl-aspect={fill ? "fill" : aspect}
      style={{
        aspectRatio: fill ? undefined : aspect,
        borderRadius: radius !== undefined ? `${radius}px` : undefined,
        ["--cl-wire-top-clear" as string]: topClear > 0 ? `${topClear}px` : undefined,
      }}
    >
      {topClear > 0 ? (
        <div className="cl-wire__clear" data-cl-wire-clear aria-hidden="true" />
      ) : null}
      <div className="cl-wire__chrome" data-cl-wire-chrome aria-hidden="true">
        <span />
        <span />
        <span />
        <i className="cl-wire__chrome-bar" />
      </div>
      {kind === "listings" ? (
        <div className="cl-wire__body cl-wire__body--listings" data-cl-wire-body aria-hidden="true">
          <aside className="cl-wire__side">
            <i />
            <i />
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
              <i />
              <i />
            </div>
          </div>
        </div>
      ) : null}
      {kind === "tasks" ? (
        <div className="cl-wire__body cl-wire__body--tasks" data-cl-wire-body aria-hidden="true">
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
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line cl-wire__line--mid" />
            </li>
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line" />
            </li>
            <li>
              <i className="cl-wire__check" />
              <i className="cl-wire__line cl-wire__line--short" />
            </li>
          </ul>
        </div>
      ) : null}
      {kind === "video" ? (
        <div className="cl-wire__body cl-wire__body--video" data-cl-wire-body aria-hidden="true">
          <div className="cl-wire__stage">
            <i className="cl-wire__playbtn" />
          </div>
          <div className="cl-wire__meta">
            <i className="cl-wire__line" />
            <i className="cl-wire__line cl-wire__line--mid" />
            <i className="cl-wire__line cl-wire__line--short" />
          </div>
          <div className="cl-wire__related">
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : null}
      {kind === "player" ? (
        <div className="cl-wire__body cl-wire__body--player" data-cl-wire-body aria-hidden="true">
          <div className="cl-wire__player-main">
            <i className="cl-wire__disc" />
            <div className="cl-wire__deck">
              <i className="cl-wire__line" />
              <i className="cl-wire__line cl-wire__line--mid" />
              <i className="cl-wire__slider" />
              <div className="cl-wire__controls">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <ul className="cl-wire__playlist">
            <li>
              <i className="cl-wire__line" />
            </li>
            <li>
              <i className="cl-wire__line cl-wire__line--mid" />
            </li>
            <li>
              <i className="cl-wire__line cl-wire__line--short" />
            </li>
          </ul>
        </div>
      ) : null}
      {kind === "habits" ? (
        <div className="cl-wire__body cl-wire__body--habits" data-cl-wire-body aria-hidden="true">
          <div className="cl-wire__phone">
            <i className="cl-wire__titlebar" />
            <div className="cl-wire__grid cl-wire__grid--dense">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <i className="cl-wire__btn cl-wire__btn--wide" />
            <i className="cl-wire__line" />
          </div>
        </div>
      ) : null}
      {dimmed ? <span className="cl-wire__veil" aria-hidden="true" /> : null}
      {play ? <span className="cl-wire__shimmer" aria-hidden="true" /> : null}
    </div>
  );
}
