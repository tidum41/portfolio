import manifest from "@/lib/caseStudies/dialogueExportFrameManifest.json";

export type DialogueExportRoute = keyof typeof manifest.routes;

export function dialogueExportFrame(route: string): { width: number; height: number } {
  const key = route as DialogueExportRoute;
  const frame = manifest.routes[key];
  if (!frame) {
    throw new Error(`Unknown dialogue export route: ${route}`);
  }
  return { width: frame.width, height: frame.height };
}

export const DIALOGUE_STATIC_EXPORT_BASE = "/dev/dialogue-static/export";

export function dialogueExportSrc(route: string): string {
  const file = route === "hero" ? "hero.html" : `${route}.html`;
  return `${DIALOGUE_STATIC_EXPORT_BASE}/${file}`;
}
