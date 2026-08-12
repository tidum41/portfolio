/**
 * Attribute first Work→About hitch: long tasks + what mounted.
 * Usage: node scripts/profile-about-first.cjs
 */
const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu-sandbox", "--use-gl=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4500);

  await page.evaluate(() => {
    window.__prof = { marks: [], longTasks: [], mounts: [] };
    performance.mark("prof-armed");
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration >= 30) {
            window.__prof.longTasks.push({
              d: Math.round(e.duration),
              s: Math.round(e.startTime),
              name: e.name,
            });
          }
        }
      });
      obs.observe({ type: "longtask", buffered: true });
    } catch (_) {}

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          const tag = n.tagName?.toLowerCase?.() || "";
          const cls = typeof n.className === "string" ? n.className.slice(0, 80) : "";
          const id = n.id || "";
          if (
            id.includes("about") ||
            cls.includes("about") ||
            tag === "mux-player" ||
            n.querySelector?.("mux-player, canvas, [data-player-sizer], .about-hero")
          ) {
            window.__prof.mounts.push({
              t: Math.round(performance.now()),
              tag,
              id,
              cls,
              hasCanvas: !!n.querySelector?.("canvas"),
              hasPlayerSizer: !!n.querySelector?.("[data-player-sizer]"),
              hasAboutHero: !!n.querySelector?.(".about-hero"),
              hasCdSlot: !!n.querySelector?.("#about-cd-slot"),
            });
          }
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  });

  // Continuous mouse during nav
  const mover = (async () => {
    for (let i = 0; i < 50; i++) {
      await page.mouse.move(200 + (i % 20) * 40, 240 + Math.sin(i / 3) * 80);
      await page.waitForTimeout(16);
    }
  })();

  await page.evaluate(() => {
    performance.mark("prof-pre-click");
    window.__prof.marks.push({ phase: "pre-click", t: Math.round(performance.now()) });
    sessionStorage.setItem("soft-nav", "1");
    window.dispatchEvent(new CustomEvent("soft-nav-start"));
    const a = document.querySelector('a[href="/about"]');
    a.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    a.click();
  });

  await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 15000 });
  await page.evaluate(() => {
    performance.mark("prof-arrived");
    window.__prof.marks.push({ phase: "arrived", t: Math.round(performance.now()) });
  });
  await mover;

  const snapshot = async (label) => {
    const snap = await page.evaluate((phase) => {
      const arrived = window.__prof.marks.find((m) => m.phase === "arrived")?.t ?? 0;
      const pre = window.__prof.marks.find((m) => m.phase === "pre-click")?.t ?? 0;
      const cdLive = !!document.querySelector("#about-cd-slot [data-player-sizer], #about-cd-slot canvas");
      const motionNodes = document.querySelectorAll(".about-hero [style*='opacity'], .about-hero").length;
      const framerHint = !!document.querySelector(".about-hero [data-projection-id], .about-hero > div");
      return {
        phase,
        tSinceArrive: Math.round(performance.now() - arrived),
        clickToArrive: arrived - pre,
        aboutHero: !!document.querySelector(".about-hero"),
        cdSlot: !!document.querySelector("#about-cd-slot"),
        cdLive,
        hasPlayerSizer: !!document.querySelector("[data-player-sizer]"),
        experienceHint: (document.body?.innerText || "").includes("experience"),
        longTasksNear: window.__prof.longTasks
          .filter((t) => t.s >= pre - 50 && t.s <= arrived + 2000)
          .map((t) => ({ d: t.d, at: t.s - pre })),
        mountsWithCd: window.__prof.mounts.filter((m) => m.hasPlayerSizer).slice(0, 5),
        framerHint,
        motionNodes,
      };
    }, label);
    return snap;
  };

  const at0 = await snapshot("arrive+0");
  await page.waitForTimeout(500);
  const at500 = await snapshot("arrive+500");
  await page.waitForTimeout(1500);
  const at2000 = await snapshot("arrive+2000");
  // Scroll toward CD and confirm it can still arm
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(2200);
  const afterScroll = await snapshot("after-scroll");

  const result = { at0, at500, at2000, afterScroll };
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
