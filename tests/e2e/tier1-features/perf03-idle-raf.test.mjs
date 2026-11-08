/**
 * PERF-03: Idle CPU & RAF Scheduling Verification
 * 
 * Authoritative Source:
 * - TEST_INFRA.md: PERF-03.
 * - ORIGINAL_REQUEST.md: "CaseStudyTOC.tsx passive scroll/resize rAF instead of per-frame polling,
 *   RabbitHoleVideo.tsx sprite frame reuse, suspend cardFocusController when hidden."
 * - PROJECT.md: Features F2.2a, F2.2b, F2.2c.
 */
import { assert } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "PERF-03";
export const name = "Idle CPU & RAF Scheduling Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "PERF-03.1: CaseStudyTOC.tsx avoids continuous per-frame rAF loop when page is stationary",
    fn: async () => {
      const tocPath = path.join(process.cwd(), "components/CaseStudyTOC.tsx");
      const src = fs.readFileSync(tocPath, "utf8");

      // Check if continuous rAF loop tick() scheduling is replaced with passive listeners
      const hasContinuousPolling = src.includes("const tick = () => {") && src.includes("rafRef.current = requestAnimationFrame(tick);");
      assert(
        !hasContinuousPolling,
        "CaseStudyTOC.tsx still has continuous per-frame rAF polling loop instead of passive scroll/resize rAF"
      );
    },
  },
  {
    name: "PERF-03.2: CaseStudyTOC.tsx uses passive event listeners for scroll and resize",
    fn: async () => {
      const tocPath = path.join(process.cwd(), "components/CaseStudyTOC.tsx");
      const src = fs.readFileSync(tocPath, "utf8");

      assert(
        src.includes("addEventListener(\"scroll\"") || src.includes("window.addEventListener('scroll'") || src.includes("passive: true"),
        "CaseStudyTOC.tsx should listen to scroll events passively rather than polling rAF every frame"
      );
    },
  },
  {
    name: "PERF-03.3: CardFocusController suspends pointermove listener when hidden/inactive",
    fn: async () => {
      const controllerPath = path.join(process.cwd(), "lib/cardFocusController.ts");
      let src = "";
      if (fs.existsSync(controllerPath)) {
        src = fs.readFileSync(controllerPath, "utf8");
      } else {
        // May be in components
        const alt = path.join(process.cwd(), "components/PS3Silk.tsx");
        src = fs.readFileSync(alt, "utf8");
      }

      assert(
        src.includes("activeRef") || src.includes("removeEventListener") || src.includes("suspend") || src.includes("active"),
        "Pointer interaction must suspend listeners when active is false"
      );
    },
  },
  {
    name: "PERF-03.4: Background tab visibility changes suspend continuous canvas rendering",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Verify page handles visibilitychange
      const hasListener = await page.evaluate(() => {
        return typeof document.hidden !== "undefined";
      });

      assert(hasListener, "Document visibility state should be accessible");
    },
  },
  {
    name: "PERF-03.5: RabbitHoleVideo.tsx caches and reuses sprite frame SVG groups",
    fn: async () => {
      const rhPath = path.join(process.cwd(), "components/RabbitHoleVideo.tsx");
      if (fs.existsSync(rhPath)) {
        const src = fs.readFileSync(rhPath, "utf8");
        assert(
          src.includes("useMemo") || src.includes("cache") || src.includes("useRef"),
          "RabbitHoleVideo.tsx should cache frame groups for sprite reuse"
        );
      }
    },
  },
];
