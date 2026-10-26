import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import PlayButton from "@/components/dialogue/product/PlayButton";
import { ADDRESS_FOLLOWUP } from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/** The counter-evidence rows, as restored in the study's own block. */
const DID_NOT_ROWS = [
  { name: "Elena R.", time: "08:12", quote: "The address form just took it, no errors…", photo: "clip-01" },
  { name: "Avery C.", time: "25:02", quote: "Autocomplete filled my address in right…", photo: "clip-02" },
  { name: "Alex P.", time: "18:22", quote: "My address was already saved, so I skipped…", photo: "clip-05" },
] as const;

/** Round N counts: the page's one data viz. The bar reads counts, and the
    "6 of 24 did not" segment is selected, with a connector into the panel
    beneath it holding those participants' quote and clip rows. */
export default function CountsFigure() {
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
    <ChartVizCard title={ADDRESS_FOLLOWUP.summary}>
      <ChartStackedBar
        total={24}
        segments={[
          { label: "Raised it", value: 18, display: "18 of 24", focal: true },
          { label: "Did not", value: 6, display: "6 of 24", selected: true },
        ]}
      />
      <div className="dp-counts__connector" aria-hidden />
      <div className="dp-counts__panel" data-annotate-part="counts-panel">
        <p className="dp-counts__panel-title">6 of 24 did not</p>
        {DID_NOT_ROWS.map((row) => (
          <div key={row.name} className="dp-counts__row" data-annotate-part={`counts-row-${row.name.replace(" ", "-")}`}>
            <span className="dp-counts__thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/dev/dialogue-static/clip-photos/${row.photo}.jpg`} alt="" loading="eager" decoding="sync" />
              <span className="dp-counts__thumb-play" aria-hidden />
            </span>
            <div className="dp-counts__body">
              <p className="dp-counts__who">
                <WaveformIcon className="dp-counts__wave" />
                <span className="dp-counts__name">{row.name}</span>
                <span className="dp-counts__time">{row.time}</span>
              </p>
              <p className="dp-counts__quote">{row.quote}</p>
            </div>
            <PlayButton label={`Play ${row.name}'s clip`} />
          </div>
        ))}
      </div>
    </ChartVizCard>
    </StudyChatShell>
  );
}
