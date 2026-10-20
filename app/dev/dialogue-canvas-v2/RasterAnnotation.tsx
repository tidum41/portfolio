"use client";

import { useCallback, useState } from "react";
import type { DialogueCanvasAsset } from "@/lib/caseStudies/dialogueCanvasCatalog";

type Props = {
  asset: DialogueCanvasAsset;
  children: React.ReactNode;
};

export default function RasterAnnotation({ asset, children }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(asset.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* optional */
    }
  }, [asset.id]);

  return (
    <div className="dc-raster" id={asset.id}>
      <div className="dc-raster__meta">
        <button type="button" className="dc-raster__chip" onClick={onCopy}>
          {asset.id}
          {copied ? " · copied" : ""}
        </button>
        <span className={`dc-raster__status dc-raster__status--${asset.status}`}>
          {asset.status}
        </span>
        <p className="dc-raster__note">{asset.visualNote}</p>
      </div>
      {children}
    </div>
  );
}
