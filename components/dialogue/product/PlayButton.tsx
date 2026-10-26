import { PlayIcon } from "@/components/dialogue/product/icons";

/** Round N play affordance: a 28px cherry circle on a 44px hit target.
    Plays the response inline in the chat; it is not an external link. */
export default function PlayButton({ label = "Play clip" }: { label?: string }) {
  return (
    <button type="button" className="dp-play-btn" data-interactive aria-label={label}>
      <span className="dp-play-btn__circle">
        <PlayIcon className="dp-play-btn__icon" />
      </span>
    </button>
  );
}
