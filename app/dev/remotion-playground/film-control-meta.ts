/**
 * Plain-language DialKit notes + conditional rules for the JOOLA playground.
 * Frame ranges come from remotion/src/joola/timeline.ts (pass 40) and the
 * live duration overrides in movesAt() / pillMotion() / logoOutEnd().
 */
import {
  CART_CUT,
  CONF_RECENTER,
  LOGO_OUT,
  OPEN_MOVE,
  PILL_SHOT,
  REVEAL,
  ZOOM_LINES,
  ZOOM_OUT,
} from "@/remotion/src/joola/timeline";

const openStart = OPEN_MOVE[0];
const zoomOutStart = ZOOM_OUT[0];
const revealStart = REVEAL[0];
const zoomLinesStart = ZOOM_LINES[0];
const pillStart = PILL_SHOT;
const recenterStart = CONF_RECENTER[0];
const logoStart = LOGO_OUT[0];
const cartCut = CART_CUT;

/** Notes keyed by DialKit path (dot-separated). */
export const FILM_CONTROL_NOTES: Record<string, string> = {
  // Film Camera — Shot A (search field; open push lands here)
  "shotA.zoom": `Camera zoom on the search field after the open push (from frame ${openStart})`,
  "shotA.cx": `Camera X aim on the search field hold after the open push (from frame ${openStart})`,
  "shotA.cy": `Camera Y aim on the search field hold after the open push (from frame ${openStart})`,

  // Shot Qty (line / chips; ZOOM_OUT)
  "shotQty.zoom": `Camera zoom on the qty line, starting frame ${zoomOutStart}`,
  "shotQty.cx": `Camera X aim on the qty chips and line total (from frame ${zoomOutStart})`,
  "shotQty.cy": `Camera Y aim on the qty chips and line total (from frame ${zoomOutStart})`,

  // Shot Saved (pull-back; REVEAL)
  "shotSaved.zoom": `Camera zoom on Saved / Match kit, starting frame ${revealStart}`,
  "shotSaved.cx": `Camera X aim on the saved-orders pull-back hold (from frame ${revealStart})`,
  "shotSaved.cy": `Camera Y aim on the saved-orders pull-back hold (from frame ${revealStart})`,

  // Shot Order (kit lines; ZOOM_LINES)
  "shotOrder.zoom": `Camera zoom on the whole order / kit lines, starting frame ${zoomLinesStart}`,
  "shotOrder.cx": `Camera X aim on the kit-lines hold (from frame ${zoomLinesStart})`,
  "shotOrder.cy": `Camera Y aim on the kit-lines hold (from frame ${zoomLinesStart})`,

  // Cards
  "cards.scale": `Shared scale for the order-summary and order-placed cards (from cart cut, frame ${cartCut})`,

  // Film Timing
  camEase:
    "Easing preset applied to every camera move (open push, mid-film zooms, order-placed recenter)",
  "content.logoOutDuration": `How long the logo takes to leave at the open (starts frame ${logoStart})`,
  "content.pillFillDuration": `Pill width, digit roll, and badge share this length (starts frame ${pillStart})`,
  "openPush.openMoveDuration": `Length of the open camera push to the search field (starts frame ${openStart}; shown while Cam Ease is CAM_E)`,
  "midFilm.zoomOutDuration": `Length of the zoom-out to the qty line (starts frame ${zoomOutStart}; shown while Cam Ease is FLOW_E)`,
  "midFilm.revealDuration": `Length of the pull-back to saved orders (starts frame ${revealStart}; shown while Cam Ease is FLOW_E)`,
  "midFilm.zoomLinesDuration": `Length of the zoom-out to kit lines (starts frame ${zoomLinesStart}; shown while Cam Ease is FLOW_E)`,
  "confirm.confRecenterDuration": `Length of the order-placed card recenter (starts frame ${recenterStart}; shown while Cam Ease is MOVE_E)`,

  // Film Cursor
  ptrEase:
    "Cursor travel easing — PTR_E by default, or FLOW_E on every travel segment",
  cursorScale:
    "On-screen cursor size (drawn outside the camera, so zoom does not change it)",
};

/** Human labels DialKit shows for each path (folder title + control label). */
export const FILM_CONTROL_LABELS: Record<string, { folder?: string; label: string }> =
  {
    "shotA.zoom": { folder: "Shot A", label: "Zoom" },
    "shotA.cx": { folder: "Shot A", label: "Cx" },
    "shotA.cy": { folder: "Shot A", label: "Cy" },
    "shotQty.zoom": { folder: "Shot Qty", label: "Zoom" },
    "shotQty.cx": { folder: "Shot Qty", label: "Cx" },
    "shotQty.cy": { folder: "Shot Qty", label: "Cy" },
    "shotSaved.zoom": { folder: "Shot Saved", label: "Zoom" },
    "shotSaved.cx": { folder: "Shot Saved", label: "Cx" },
    "shotSaved.cy": { folder: "Shot Saved", label: "Cy" },
    "shotOrder.zoom": { folder: "Shot Order", label: "Zoom" },
    "shotOrder.cx": { folder: "Shot Order", label: "Cx" },
    "shotOrder.cy": { folder: "Shot Order", label: "Cy" },
    "cards.scale": { folder: "Cards", label: "Scale" },
    camEase: { label: "Cam Ease" },
    "content.logoOutDuration": { folder: "Content", label: "Logo Out Duration" },
    "content.pillFillDuration": { folder: "Content", label: "Pill Fill Duration" },
    "openPush.openMoveDuration": {
      folder: "Open Push",
      label: "Open Move Duration",
    },
    "midFilm.zoomOutDuration": { folder: "Mid Film", label: "Zoom Out Duration" },
    "midFilm.revealDuration": { folder: "Mid Film", label: "Reveal Duration" },
    "midFilm.zoomLinesDuration": {
      folder: "Mid Film",
      label: "Zoom Lines Duration",
    },
    "confirm.confRecenterDuration": {
      folder: "Confirm",
      label: "Conf Recenter Duration",
    },
    ptrEase: { label: "Ptr Ease" },
    cursorScale: { label: "Cursor Scale" },
  };
