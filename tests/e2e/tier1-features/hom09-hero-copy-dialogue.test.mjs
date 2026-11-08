/**
 * HOM-09: Hero Copy & /dialogue Invariant Verification
 * 
 * Authoritative Source:
 * - ORIGINAL_REQUEST.md: "Invariants: keep hero copy unchanged ('I'm Mudit, an AI-native product designer
 *   with a love for prototyping, tinkering, and visuals.' / 'Leading Cursor @ UCLA · Previously designing @ JOOLA'
 *   linking to /joola), no cursor ripples (intersection points shift toward cursor), do not touch /dialogue".
 * - PROJECT.md: HOM-09.
 */
import { assert, assertEqual } from "../helpers/assertions.mjs";
import { CANONICAL_COPY } from "../helpers/env.mjs";

export const id = "HOM-09";
export const name = "Hero Copy & /dialogue Invariant Verification";
export const tier = "tier1-features";

export const tests = [
  {
    name: "HOM-09.1: Hero heading verbatim matches canonical copy exactly",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const headingText = await page.evaluate(() => {
        const h = document.querySelector("#hero h1, .hero-title, h1");
        return h ? h.innerText.trim() : "";
      });

      assertEqual(
        headingText,
        CANONICAL_COPY.heroHeading,
        `Hero heading mismatch.\nExpected: "${CANONICAL_COPY.heroHeading}"\nActual:   "${headingText}"`
      );
    },
  },
  {
    name: "HOM-09.2: Hero subtitle verbatim contains canonical text",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const subText = await page.evaluate(() => {
        const sub = document.querySelector("#hero .hero-sub, .hero-sub, [data-hero] p");
        return sub ? sub.innerText.trim() : "";
      });

      assert(
        subText.includes(CANONICAL_COPY.heroSubtitle),
        `Hero subtitle mismatch.\nExpected to include: "${CANONICAL_COPY.heroSubtitle}"\nActual:              "${subText}"`
      );
    },
  },
  {
    name: "HOM-09.3: Link for @ JOOLA links to /joola",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      await page.goto(ctx.targetUrl);

      const linkHref = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("#hero a, .hero-sub a"));
        const joola = links.find((a) => a.textContent.includes("JOOLA"));
        return joola ? joola.getAttribute("href") : null;
      });

      assertEqual(linkHref, CANONICAL_COPY.joolaHref, `Expected @ JOOLA link href to be '/joola', got '${linkHref}'`);
    },
  },
  {
    name: "HOM-09.4: Route /dialogue returns HTTP status 200",
    fn: async (ctx) => {
      const page = await ctx.createPage();
      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      const res = await page.goto(dialogueUrl);

      const status = res ? res.status() : 200;
      assertEqual(status, 200, `Expected /dialogue to return HTTP 200, got ${status}`);
    },
  },
  {
    name: "HOM-09.5: /dialogue preserves sticky .cs-aside component intact",
    fn: async (ctx) => {
      const page = await ctx.createPage({ viewport: { width: 1440, height: 900 } });
      const dialogueUrl = new URL("/dialogue", ctx.targetUrl).toString();
      await page.goto(dialogueUrl);

      const stickyExists = await page.evaluate(() => {
        const aside = document.querySelector(".cs-aside, aside");
        if (!aside) return false;
        const pos = window.getComputedStyle(aside).position;
        return pos === "sticky";
      });

      assert(stickyExists, "Expected sticky aside (.cs-aside) on /dialogue");
    },
  },
];
