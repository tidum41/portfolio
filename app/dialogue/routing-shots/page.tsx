import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import RoutingAnswer from "@/components/dialogue/routing/RoutingAnswer";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/routing/routing-demo.css";
import {
  resolveClips,
  resolveCountSplit,
  resolveQuotes,
  resolveSegmentComparison,
  resolveThin,
} from "@/lib/dialogue/routing/sampleDataset";

export const dynamic = "force-static";

const SHOTS = [
  {
    id: "count_split",
    question: "How do shoppers read 'Arrives by Friday'?",
    template: "count_split" as const,
    data: resolveCountSplit("friday_reading"),
    initialSide: "this_friday",
  },
  {
    id: "segment_comparison",
    question: "Compare address friction on mobile vs desktop",
    template: "segment_comparison" as const,
    data: resolveSegmentComparison("address_friction", "device"),
  },
  {
    id: "quote_list",
    question: "What did shoppers say about returns?",
    template: "quote_list" as const,
    data: resolveQuotes("returns"),
  },
  {
    id: "clip_list",
    question: "Play clips about the Friday label",
    template: "clip_list" as const,
    data: resolveClips("friday_reading"),
    initialPlaying: "Ana",
  },
  {
    id: "thin_data",
    question: "How many shoppers mentioned damaged packaging?",
    template: "thin_data" as const,
    data: resolveThin("packaging_damage"),
  },
] as const;

/** Dev harness for Playwright screenshots of each routing template. */
export default function RoutingShotsPage() {
  return (
    <main className="dialogue-product-root">
      {SHOTS.map((shot) => (
        <section
          key={shot.id}
          id={`shot-${shot.id}`}
          className="dlg-route-shot dlg-route-demo"
          data-shot={shot.id}
        >
          <div className="dlg-route-shot__panel">
            <StudyChatShell compact hideHeader hideComposer>
              <UserMessageBubble>{shot.question}</UserMessageBubble>
              <RoutingAnswer
                template={shot.template}
                data={shot.data}
                initialSide={"initialSide" in shot ? shot.initialSide : null}
                initialPlaying={"initialPlaying" in shot ? shot.initialPlaying : null}
              />
            </StudyChatShell>
          </div>
        </section>
      ))}
    </main>
  );
}
