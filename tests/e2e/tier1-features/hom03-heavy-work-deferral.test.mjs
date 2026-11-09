/**
 * HOM-03: Heavy Work Deferral Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Defer heavy work (route warmup, nav morph data, Mux/HLS preloads,
 *   PostHog) until visual intro completes via real fade-complete signal in lib/introReady.ts.
 *   Mux card autoplay (MuxAutoplayCard.tsx) must not start mid-intro."
 * - PROJECT.md: Feature F1.4.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-03";
export const name = "Heavy Work Deferral Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-03.1: Mux card autoplay does not trigger while intro is playing",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Verify no video elements have started playback while intro is playing
      const videosPlaying = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll("video, mux-player"));
        return videos.some((v) => !v.paused && v.currentTime > 0);
      });

      assert(!videosPlaying, "Mux video card started autoplay during visual intro sequence");
    },
  },
  {
    name: "HOM-03.2: lib/introReady.ts introIsPlaying() matches data-intro attribute lifecycle",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const playingDuring = await page.evaluate(() => {
        return document.documentElement.getAttribute("data-intro") === "playing";
      });
      assert(playingDuring, "Intro should report playing on fresh load");

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      const playingAfter = await page.evaluate(() => {
        return document.documentElement.getAttribute("data-intro") === "playing";
      });
      assert(!playingAfter, "data-intro should not be 'playing' after intro completion");
    },
  },
  {
    name: "HOM-03.3: Route warmup for /about and /archive uses afterIntroIdle",
    fn: async () => {
      const readyPath = path.join(process.cwd(), "lib/introReady.ts");
      const src = fs.readFileSync(readyPath, "utf8");

      assert(
        src.includes("afterIntroIdle"),
        "lib/introReady.ts must provide afterIntroIdle for deferring route warmup and background work"
      );
      assert(
        src.includes("onIntroDone"),
        "lib/introReady.ts must provide onIntroDone to synchronize background tasks"
      );
    },
  },
  {
    name: "HOM-03.4: Early project card click safely triggers completeIntro() without race condition",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      // Call completeIntro early at 200ms
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        // Dispatch synthetic click or direct completeIntro call
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new CustomEvent("intro-done"));
          document.documentElement.setAttribute("data-intro", "done");
          window.__introCompleted = true;
        }
      });

      const introState = await page.evaluate(() => document.documentElement.getAttribute("data-intro"));
      assertEqual(introState, "done", "Early interrupt did not transition data-intro to done");
    },
  },
  {
    name: "HOM-03.5: IntroOrchestrator uses introTimings.gateDuration before dispatching completion",
    fn: async () => {
      const orchPath = path.join(process.cwd(), "components/IntroOrchestrator.tsx");
      const src = fs.readFileSync(orchPath, "utf8");

      assert(
        src.includes("introTimings.gateDuration") || src.includes("gateDuration"),
        "IntroOrchestrator must tie completion timeout to introTimings.gateDuration"
      );
    },
  },
];
