/** Pixel layout shared by study host + floating placement overlay (keep in sync with DialogueStudyHostPage). */

export const PLACEMENT_PLAYER_ASSET_WIDTH = 1336;
export const PLACEMENT_PLAYER_ASSET_HEIGHT = 468;

export const STUDY_HEADER_BLOCK_HEIGHT = 61;
export const STUDY_PLAYER_PAD_TOP = 12;
export const STUDY_PLAYER_PAD_BOTTOM = 10;
export const STUDY_PLAYER_PAD_X = 16;

export function studyPlayerRenderHeight(columnInnerWidth: number): number {
  return Math.round(
    columnInnerWidth * (PLACEMENT_PLAYER_ASSET_HEIGHT / PLACEMENT_PLAYER_ASSET_WIDTH),
  );
}

/** Y offset where transcript begins (floating chat should start here or below). */
export function studyTranscriptTopY(columnWidth: number): number {
  const inner = columnWidth - STUDY_PLAYER_PAD_X * 2;
  return (
    STUDY_HEADER_BLOCK_HEIGHT +
    1 +
    STUDY_PLAYER_PAD_TOP +
    studyPlayerRenderHeight(inner) +
    STUDY_PLAYER_PAD_BOTTOM
  );
}
