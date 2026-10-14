/**
 * Film timeline: pure numbers + camera maths, no Remotion imports.
 * Tunables live in film-config.ts; createTimelineState() derives frame numbers.
 */
import { DEFAULT_FILM_CONFIG } from "./film-config";
import { createTimelineState } from "./timeline-state";

const defaultState = createTimelineState(DEFAULT_FILM_CONFIG);

export type { Cam, Move, TimelineState } from "./timeline-state";
export { bezier, clamp01, lerp, createTimelineState } from "./timeline-state";
export type { FilmConfig } from "./film-config";
export { DEFAULT_FILM_CONFIG, mergeFilmConfig } from "./film-config";

export const FPS = defaultState.FPS;
export const CAM_E = defaultState.CAM_E;
export const PUSH_E = defaultState.PUSH_E;
export const SETTLE = defaultState.SETTLE;
export const UI_E = defaultState.UI_E;
export const FADE_E = defaultState.FADE_E;
export const PTR_E = defaultState.PTR_E;
export const MOVE_E = defaultState.MOVE_E;
export const EASE_OUT = defaultState.EASE_OUT;
export const INOUT_E = defaultState.INOUT_E;
export const MORPH = defaultState.MORPH;
export const UI_IN = defaultState.UI_IN;
export const LEAD = defaultState.LEAD;
export const CLICK = defaultState.CLICK;
export const ENTER = defaultState.ENTER;
export const TYPE_SEARCH = defaultState.TYPE_SEARCH;
export const DROPDOWN_OPEN = defaultState.DROPDOWN_OPEN;
export const RESULT_HOVER = defaultState.RESULT_HOVER;
export const INSERT = defaultState.INSERT;
export const ROW_HL = defaultState.ROW_HL;
export const TYPE_QTY = defaultState.TYPE_QTY;
export const QTY_SET = defaultState.QTY_SET;
export const PAN_AB = defaultState.PAN_AB;
export const TPL_HOVER = defaultState.TPL_HOVER;
export const POP_IN = defaultState.POP_IN;
export const POP_HOVER = defaultState.POP_HOVER;
export const TPL_ROWS = defaultState.TPL_ROWS;
export const PAN_BC = defaultState.PAN_BC;
export const PILL_FILL = defaultState.PILL_FILL;
export const CART_CUT = defaultState.CART_CUT;
export const CART_FADE = defaultState.CART_FADE;
export const PAN_CART = defaultState.PAN_CART;
export const CREDIT_ANIM = defaultState.CREDIT_ANIM;
export const CONF_CUT = defaultState.CONF_CUT;
export const CONF_MORPH = defaultState.CONF_MORPH;
export const CONF_XFADE = defaultState.CONF_XFADE;
export const CONF_HOLD = defaultState.CONF_HOLD;
export const END_FADE = defaultState.END_FADE;
export const DURATION = defaultState.DURATION;
export const MORPH_OUT = defaultState.MORPH_OUT;
export const POINTER_OFF = defaultState.POINTER_OFF;
export const CUTS = defaultState.CUTS;
export const CONTENT_ANIMS = defaultState.CONTENT_ANIMS;
export const OW = defaultState.OW;
export const OH = defaultState.OH;
export const UI_W = defaultState.UI_W;
export const UI_H = defaultState.UI_H;
export const PAN_E = defaultState.PAN_E;
export const SHOT_A = defaultState.SHOT_A;
export const SHOT_B = defaultState.SHOT_B;
export const SHOT_B2 = defaultState.SHOT_B2;
export const SHOT_SUM = defaultState.SHOT_SUM;
export const SHOT_D = defaultState.SHOT_D;
export const WIDE = defaultState.WIDE;
export const CART_CAM = defaultState.CART_CAM;
export const CONF_CAM = defaultState.CONF_CAM;
export const MOVES = defaultState.MOVES;
export const clampCam = defaultState.clampCam;
export const confCam = defaultState.confCam;
export const camAt = defaultState.camAt;
export const prog = defaultState.prog;
