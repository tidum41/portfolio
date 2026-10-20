/** Pixel layout shared by study host + floating placement overlay (keep in sync with DialogueStudyHostPage). */

/** Video frame only (no control chrome in placement tiles). */
export const PLACEMENT_PLAYER_VIDEO_HEIGHT = 168;
export const PLACEMENT_PLAYER_TOTAL_HEIGHT = PLACEMENT_PLAYER_VIDEO_HEIGHT;

export const STUDY_HEADER_BLOCK_HEIGHT = 62;
export const STUDY_PLAYER_PAD_TOP = 8;
export const STUDY_PLAYER_PAD_BOTTOM = 8;
export const STUDY_PLAYER_PAD_X = 16;

/** Y where the player block starts (below study header). */
export function studyPlayerBlockTopY(): number {
  return STUDY_HEADER_BLOCK_HEIGHT + 1 + STUDY_PLAYER_PAD_TOP;
}

/** Y offset where transcript begins. */
export function studyTranscriptTopY(_columnWidth?: number): number {
  return (
    studyPlayerBlockTopY() + PLACEMENT_PLAYER_TOTAL_HEIGHT + STUDY_PLAYER_PAD_BOTTOM
  );
}
