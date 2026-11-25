/**
 * Case-study media `sizes` for next/image. Mirrors the CSS in globals.css:
 * mobile = viewport minus margins; tablet (768-1199) hero = the centred
 * --content-max-w (750px) lane, or viewport minus margins if narrower;
 * desktop lane = grid cols 3-10 = 2/3 vw - 40px, never wider than the
 * 2200px site cap's lane (1426px).
 */
export const CASE_STUDY_MEDIA_SIZES =
  "(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) min(750px, calc(100vw - 48px)), min(1426px, calc(66.667vw - 40px))";
