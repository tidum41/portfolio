/** Resolve a file under Vite `public/` for the current embed base (`/joola-proto/qo/` or `round5/`). */
type ViteImportMeta = ImportMeta & { env?: { BASE_URL?: string } };

export function publicAsset(relativePath: string): string {
  const base = (import.meta as ViteImportMeta).env?.BASE_URL ?? "/";
  const cleaned = relativePath.replace(/^\//, "");
  return `${base}${cleaned}`;
}
