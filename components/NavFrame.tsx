import Nav from "./Nav";
import { setSsrSlot } from "@/lib/ssrSlot";
import RestingOutlineWord from "./RestingOutlineWord";
import { OUTLINE_META } from "./outlineMorphMeta";
import { RESTING_PATHS } from "./outlineRestingPaths";
import { NAV_WORDS_SSR_KEY, type NavWordsSsr } from "./navWordsSsr";

const LABELS = ["Work", "Archive", "About"] as const;

let ssrMarkup: NavWordsSsr | null = null;
function navWordsMarkup(): NavWordsSsr {
  ssrMarkup ??= Object.fromEntries(
    LABELS.map((label) => [
      label,
      (RESTING_PATHS[label] ?? []).map((d) => `<path d="${d}" fill="currentColor"></path>`).join(""),
    ]),
  );
  return ssrMarkup;
}

function size(label: string): [number, number] {
  const entry = OUTLINE_META.find(([name]) => name === label);
  return entry ? [entry[1], entry[2]] : [0, 0];
}

/** Server wrapper so the resting nav letters are not part of the client graph. */
export default function NavFrame() {
  // Same process renders RSC then SSR, so the client component's server pass
  // can read this without the paths being serialized as props.
  setSsrSlot(NAV_WORDS_SSR_KEY, navWordsMarkup());
  const word = (label: (typeof LABELS)[number]) => {
    const [width, height] = size(label);
    return <RestingOutlineWord label={label} width={width} height={height} />;
  };
  return (
    <Nav
      words={{
        Work: word("Work"),
        Archive: word("Archive"),
        About: word("About"),
      }}
    />
  );
}
