/**
 * HOM-07: Controls Menu Cleanup & Continuous Sliders Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Clean controls menu: remove Y offset controls entirely (keep default offset constant),
 *   disable/hide non-essential controls (keep Halftone/Wave toggle, intensity, and at most 1–2 essential controls;
 *   list every removed or hidden control and rationale), make mode buttons compact segmented toggle (min 32px touch hit area).
 *   Coherent continuous sliders: draw track and fill as opaque or pre-blended colors so nothing double-darkens
 *   or shows track through thumb; continuous live updates (step="any" or 0.001) with display rounding;
 *   preserve keyboard and a11y."
 * - PROJECT.md: Features F1.8, F1.9, F1.10, F1.11.
 */
import { assert, assertGreaterThanOrEqual, assertEqual } from "../helpers/assertions.mjs";
import { SPEC_TIMINGS } from "../helpers/env.mjs";
import fs from "fs";
import path from "path";

export const id = "HOM-07";
export const name = "Controls Menu Cleanup & Sliders Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-07.1: Y offset controls are completely removed from the controls panel DOM",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const hasYOffsetInDom = await page.evaluate(() => {
        const panel = document.getElementById("control-panel") || document.querySelector("[data-intro-panel]");
        if (!panel) return false;
        const text = panel.innerText || "";
        const inputs = Array.from(panel.querySelectorAll("input, label"));
        const labels = inputs.map((i) => (i.getAttribute("name") || i.getAttribute("aria-label") || i.textContent || ""));
        return text.includes("Y Offset") || labels.some((l) => /y-?offset/i.test(l));
      });

      assert(!hasYOffsetInDom, "Y Offset controls must be removed from the controls panel DOM");
    },
  },
  {
    name: "HOM-07.2: Mode toggle buttons meet minimum 32px touch hit area requirement",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const hitAreas = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("#mode-halftone, #mode-wave, .segmented-btn"));
        return btns.map((b) => {
          const rect = b.getBoundingClientRect();
          return { id: b.id || b.textContent, width: rect.width, height: rect.height };
        });
      });

      assert(hitAreas.length >= 2, "Expected at least 2 mode toggle buttons");
      for (const btn of hitAreas) {
        assertGreaterThanOrEqual(
          btn.height,
          SPEC_TIMINGS.minTouchTargetPx,
          `Button ${btn.id} height was ${btn.height}px, expected >= ${SPEC_TIMINGS.minTouchTargetPx}px`
        );
        assertGreaterThanOrEqual(
          btn.width,
          SPEC_TIMINGS.minTouchTargetPx,
          `Button ${btn.id} width was ${btn.width}px, expected >= ${SPEC_TIMINGS.minTouchTargetPx}px`
        );
      }
    },
  },
  {
    name: "HOM-07.3: Sliders declare step='any' or step <= 0.001 for continuous dragging",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const steps = await page.evaluate(() => {
        const sliders = Array.from(document.querySelectorAll("#control-panel input[type='range']"));
        return sliders.map((s) => ({
          name: s.getAttribute("name") || s.getAttribute("aria-label") || s.id,
          step: s.getAttribute("step"),
        }));
      });

      assert(steps.length > 0, "No sliders found in control panel");
      for (const s of steps) {
        const isContinuous = s.step === "any" || (!isNaN(parseFloat(s.step)) && parseFloat(s.step) <= 0.001);
        assert(
          isContinuous,
          `Slider ${s.name} step attribute is '${s.step}', expected 'any' or <= 0.001 for continuous updates`
        );
      }
    },
  },
  {
    name: "HOM-07.4: Sliders have valid ARIA attributes and labels for accessibility",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const slidersA11y = await page.evaluate(() => {
        const sliders = Array.from(document.querySelectorAll("#control-panel input[type='range']"));
        return sliders.map((s) => ({
          hasLabel: !!(s.getAttribute("aria-label") || s.labels?.length || s.getAttribute("aria-labelledby")),
          min: s.getAttribute("min"),
          max: s.getAttribute("max"),
        }));
      });

      for (const s of slidersA11y) {
        assert(s.hasLabel, "Slider must have an accessible label (aria-label or label element)");
        assert(s.min !== null, "Slider must define min attribute");
        assert(s.max !== null, "Slider must define max attribute");
      }
    },
  },
  {
    name: "HOM-07.5: Sliders respond to keyboard ArrowLeft and ArrowRight navigation",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      await page.waitForFunction(() => window.__introCompleted === true, { timeout: 6000 });

      // Focus intensity slider and press ArrowRight
      await page.focus("#slider-intensity");
      const valBefore = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));
      await page.keyboard.press("ArrowRight");
      const valAfter = await page.evaluate(() => parseFloat(document.getElementById("slider-intensity").value));

      assert(valAfter > valBefore, `ArrowRight did not increment slider value (before: ${valBefore}, after: ${valAfter})`);
    },
  },
];
