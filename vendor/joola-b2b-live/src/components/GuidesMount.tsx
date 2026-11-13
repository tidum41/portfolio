import { GuidesOverlay } from "./GuidesOverlay";
import { useGuidesDialEnabled } from "./guidesDialState";

/** Always mounted so `?guides=1` works in clean mode. */
export function GuidesMount() {
  const dial = useGuidesDialEnabled();
  return <GuidesOverlay enabled={dial} />;
}
