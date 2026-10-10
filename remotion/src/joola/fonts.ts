import { loadFont } from "@remotion/fonts";
import { cancelRender, continueRender, delayRender } from "remotion";
import w400 from "../../assets/joola-b2b/fonts/FKGroteskNeue-400-normal.woff2";
import w500 from "../../assets/joola-b2b/fonts/FKGroteskNeue-500-normal.woff2";
import w700 from "../../assets/joola-b2b/fonts/FKGroteskNeue-700-normal.woff2";

/** Family name declared in the prototype's @font-face rules. */
export const FONT = "FKGroteskNeue";

const handle = delayRender("Loading FK Grotesk");

Promise.all([
  loadFont({ family: FONT, url: w400, weight: "400", style: "normal", format: "woff2" }),
  loadFont({ family: FONT, url: w500, weight: "500", style: "normal", format: "woff2" }),
  loadFont({ family: FONT, url: w700, weight: "700", style: "normal", format: "woff2" }),
])
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err));
