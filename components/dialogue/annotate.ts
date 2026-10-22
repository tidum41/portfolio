/** Stable, readable part id from a label: "Address field" becomes "address-field". */
export function annotateSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
