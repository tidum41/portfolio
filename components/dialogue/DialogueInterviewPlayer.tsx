import {
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH,
} from "@/lib/caseStudies/dialoguePlacementStill";

const PLAYED = 14.04;
const BUFFERED = 17.269;

function PlayIcon() {
  return (
    <svg className="dp-qplayer__icon" viewBox="0 0 18 18" aria-hidden>
      <path d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637" />
    </svg>
  );
}

/** Skip forward 10, exactly as exported from Paper. Skip back is this glyph mirrored. */
function SkipIcon({ back = false }: { back?: boolean }) {
  return (
    <span className="dp-qplayer__skip" data-back={back ? "" : undefined}>
      <svg className="dp-qplayer__icon" viewBox="0 0 18 18" aria-hidden>
        <path d="M9 1a7.98 7.98 0 0 1 6.132 2.867l1.441-1.44a.25.25 0 0 1 .427.177V6.75a.25.25 0 0 1-.25.25h-4.146a.25.25 0 0 1-.177-.427L13.71 5.29A5.99 5.99 0 0 0 9 3a6 6 0 0 0-4.242 10.242l-1.415 1.415A8 8 0 0 1 9 1" />
      </svg>
      <svg className="dp-qplayer__skip-label" viewBox="0 0 14 14" aria-hidden>
        <text x={back ? 5.8 : 8.2} y="11.1" textAnchor="middle">10</text>
      </svg>
    </span>
  );
}

function VolumeIcon() {
  return (
    <svg className="dp-qplayer__icon" viewBox="0 0 18 18" aria-hidden>
      <path d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7" />
      <path d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402" />
    </svg>
  );
}

function PipIcon() {
  return (
    <svg className="dp-qplayer__icon" viewBox="0 0 18 18" aria-hidden>
      <path d="M13 2a4 4 0 0 1 4 4v2.036A3.5 3.5 0 0 0 16.5 8H15V6.273C15 5.018 13.96 4 12.679 4H4.32C3.04 4 2 5.018 2 6.273v5.454C2 12.982 3.04 14 4.321 14H6v1.5q0 .255.036.5H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" />
      <rect width="10" height="7" x="8" y="10" rx="2" />
      <path d="M7.129 5.547a.6.6 0 0 0-.656.13L3.677 8.473A.6.6 0 0 0 4.102 9.5h2.796c.332 0 .602-.27.602-.602V6.103a.6.6 0 0 0-.371-.556" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className="dp-qplayer__icon" viewBox="0 0 18 18" aria-hidden>
      <path d="M9.57 3.617A1 1 0 0 0 8.646 3H4c-.552 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1 1 1 0 0 0 .706-.293l4.647-4.647a1 1 0 0 0 .216-1.089m4.812 4.812a1 1 0 0 0-1.089.217l-4.647 4.647a.998.998 0 0 0 .708 1.706H14c.552 0 1-.449 1-1V9.353a1 1 0 0 0-.618-.924" />
    </svg>
  );
}

/** Paper player (file 01M58MSRB3KSVHQR7762JKXVX7, node 597-0): blurred still, glass control bar, static. */
export function DialogueInterviewPlayer() {
  return (
    <div className="dp-qplayer" data-placement-crop="player" data-annotate-part="player">
      <div
        className="dp-qplayer__still-box"
        style={{ aspectRatio: `${DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH} / ${DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-dialogue-placement-still="true"
          data-annotate-part="player-still"
          src={DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC}
          alt=""
          width={1920}
          height={888}
          className="dp-qplayer__still"
        />
        <div
          aria-hidden
          data-face-blur="true"
          data-annotate-part="player-face-blur"
          className="dp-qplayer__face-blur"
        />
      </div>
      <div className="dp-qplayer__gradient" aria-hidden data-annotate-part="player-gradient" />
      <div className="dp-qplayer__bar" aria-hidden data-annotate-part="player-controls">
        <div className="dp-qplayer__group">
          <span className="dp-qplayer__btn" data-annotate-part="player-play"><PlayIcon /></span>
          <span className="dp-qplayer__btn" data-annotate-part="player-skip-back"><SkipIcon back /></span>
          <span className="dp-qplayer__btn" data-annotate-part="player-skip-forward"><SkipIcon /></span>
        </div>
        <div className="dp-qplayer__time-controls">
          <span className="dp-qplayer__time" data-annotate-part="player-time-current">01:39</span>
          <div className="dp-qplayer__scrub">
            <div className="dp-qplayer__track" data-annotate-part="player-track">
              <span className="dp-qplayer__buffered" style={{ width: `${BUFFERED}%` }} />
              <span className="dp-qplayer__played" style={{ width: `${PLAYED}%` }} />
            </div>
          </div>
          <span className="dp-qplayer__time" data-annotate-part="player-time-total">11:45</span>
        </div>
        <div className="dp-qplayer__group dp-qplayer__group--end">
          <span className="dp-qplayer__btn dp-qplayer__btn--text" data-annotate-part="player-speed">1×</span>
          <span className="dp-qplayer__btn" data-annotate-part="player-volume"><VolumeIcon /></span>
          <span className="dp-qplayer__btn" data-annotate-part="player-pip"><PipIcon /></span>
          <span className="dp-qplayer__btn" data-annotate-part="player-fullscreen"><FullscreenIcon /></span>
        </div>
        <span className="dp-qplayer__bar-ring" aria-hidden />
      </div>
      <span className="dp-qplayer__frame-ring" aria-hidden />
    </div>
  );
}
