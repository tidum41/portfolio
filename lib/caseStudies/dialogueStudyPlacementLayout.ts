/** Pixel layout shared by study host + floating placement overlay (keep in sync with DialogueStudyHostPage). */

export const PLACEMENT_PLAYER_TOTAL_HEIGHT = 200;
export const PLACEMENT_PLAYER_CONTROL_HEIGHT = 36;
export const PLACEMENT_PLAYER_VIDEO_HEIGHT =
  PLACEMENT_PLAYER_TOTAL_HEIGHT - PLACEMENT_PLAYER_CONTROL_HEIGHT;

export const STUDY_HEADER_BLOCK_HEIGHT = 61;
export const STUDY_PLAYER_PAD_TOP = 12;
export const STUDY_PLAYER_PAD_BOTTOM = 10;
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
