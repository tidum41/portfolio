/** Helvetica Neue webfiles are not committed; production may host them under /fonts or a blob base URL. */
const BASE = process.env.NEXT_PUBLIC_HN_FONT_BASE_URL?.replace(/\/$/, "") ?? "";

function hnWoff2(filename: string) {
  return BASE ? `${BASE}/${filename}` : `/fonts/${filename}`;
}

export const HN_REGULAR_WOFF2 = hnWoff2("HelveticaNeue-Regular.woff2");
export const HN_MEDIUM_WOFF2 = hnWoff2("HelveticaNeue-Medium.woff2");
