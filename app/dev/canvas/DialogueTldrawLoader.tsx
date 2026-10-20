"use client";

import dynamic from "next/dynamic";
import type { DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import type { DialogueImageSize } from "@/lib/caseStudies/dialogueCanvasImageMeta";

const DialogueTldrawClient = dynamic(() => import("./DialogueTldrawClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        top: "var(--nav-h)",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      }}
    >
      Loading canvas…
    </div>
  ),
});

type Props = {
  sections: DialogueCanvasSection[];
  imageMeta: Record<string, DialogueImageSize>;
};

export default function DialogueTldrawLoader(props: Props) {
  return <DialogueTldrawClient {...props} />;
}
