/** ABC Areal is gitignored locally; production may host the woff2 at this path or via env. */
export const ABC_AREAL_WOFF2_PATH =
  process.env.NEXT_PUBLIC_AREAL_URL?.trim() || "/fonts/ABCArealVariable.woff2";

export const ABC_AREAL_STACK =
  '"ABC Areal", "Helvetica Neue", system-ui, sans-serif';
