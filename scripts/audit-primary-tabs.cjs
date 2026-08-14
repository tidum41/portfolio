/**
 * Click-path audit for keep-alive primary tabs.
 *
 * Pass: destination shell `display` is not `none` inside the click handler;
 * About/Archive replay `.ps3-enter` on primary-tab arrival; Archive does not
 * paint on Work/About; intro plays on cold `/` then clears.
 *
 * Usage: BENCH_BASE=http://localhost:3030 node scripts/audit-primary-tabs.cjs
 */
const { chromium } = require("playwright");

const BASE = process.env.BENCH_BASE || "http://localhost:3030";

function shellDisplay(page, name) {
  return page.evaluate((n) => {
    const el = document.querySelector(`[data-primary-shell="${n}"]`);
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      ariaHidden: el.getAttribute("aria-hidden"),
    };
  }, name);
}

async function waitIntroDone(page) {
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-intro") !== "playing",
    null,
    { timeout: 15000 },
  );
}

async function clickNavMeasure(page, href, expectedShell) {
  return page.evaluate(
    ({ href, expectedShell }) => {
      const a = document.querySelector(`nav a[href="${href}"]`);
      if (!a) throw new Error(`missing nav link ${href}`);
      const shell = document.querySelector(`[data-primary-shell="${expectedShell}"]`);
      const archive = document.querySelector(`[data-primary-shell="archive"]`);
      const about = document.querySelector(`[data-primary-shell="about"]`);
      const work = document.querySelector(`[data-primary-shell="work"]`);

      let displayInHandler = null;
      let archiveDisplayInHandler = null;
      const origClick = a.click.bind(a);

      const record = () => {
        displayInHandler = shell ? getComputedStyle(shell).display : "missing";
        archiveDisplayInHandler = archive ? getComputedStyle(archive).display : "missing";
      };

      a.addEventListener(
        "click",
        () => {
          // After our onClick (bubble, same target, later listener — too late).
          // Use a capturing listener on window that runs AFTER the link's
          // bubble handler by queueing a microtask from capture? Instead,
          // hook after preventDefault path via rAF 0 is too late.
        },
        true,
      );

      // The nav handler calls markPrimaryShow then preventDefault. React 18+
      // flushes sync setState from discrete clicks before the listener
      // returns. Read display after dispatching the click.
      a.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerType: "mouse",
          button: 0,
          clientX: 10,
          clientY: 10,
        }),
      );
      a.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
      record();

      const hero =
        expectedShell === "work"
          ? document.querySelector("[data-work-hero]")
          : expectedShell === "about"
            ? document.querySelector("[data-primary-shell='about'] h1")
            : document.querySelector("[data-primary-shell='archive']");
      const heroOpacity = hero ? getComputedStyle(hero).opacity : null;
      const enterCount = document.querySelectorAll(
        `[data-primary-shell="${expectedShell}"] .ps3-enter`,
      ).length;

      const leak = {
        archiveDisplay: archive ? getComputedStyle(archive).display : "missing",
        aboutDisplay: about ? getComputedStyle(about).display : "missing",
        workDisplay: work ? getComputedStyle(work).display : "missing",
      };

      return {
        href,
        expectedShell,
        displayInHandler,
        archiveDisplayInHandler,
        heroOpacity,
        enterCount,
        leak,
        intro: document.documentElement.getAttribute("data-intro"),
        pathname: location.pathname,
      };
    },
    { href, expectedShell },
  );
}

async function snapshot(page) {
  return page.evaluate(() => {
    const read = (n) => {
      const el = document.querySelector(`[data-primary-shell="${n}"]`);
      if (!el) return { missing: true };
      return { display: getComputedStyle(el).display };
    };
    const aboutH1 = document.querySelector("[data-primary-shell='about'] h1");
    const workCard = document.querySelector("[data-grid-card]");
    return {
      pathname: location.pathname,
      intro: document.documentElement.getAttribute("data-intro"),
      work: read("work"),
      about: read("about"),
      archive: read("archive"),
      aboutH1Opacity: aboutH1 ? getComputedStyle(aboutH1).opacity : null,
      aboutEnter: document.querySelectorAll("[data-primary-shell='about'] .ps3-enter").length,
      archiveEnter: document.querySelectorAll("[data-primary-shell='archive'] .ps3-enter").length,
      workCardOpacity: workCard ? getComputedStyle(workCard).opacity : null,
      archiveVisibleTiles: document.querySelectorAll(
        "[data-primary-shell='archive'] .bento-cell, [data-primary-shell='archive'] canvas",
      ).length,
    };
  });
}

async function waitEnterMs(page, ms = 1250) {
  await page.waitForTimeout(ms);
}

async function expectArchiveEnter(page, step, results) {
  await page.waitForFunction(
    () => document.querySelectorAll("[data-primary-shell='archive'] .ps3-enter").length > 0,
    null,
    { timeout: 8000 },
  );
  const count = await page.evaluate(
    () => document.querySelectorAll("[data-primary-shell='archive'] .ps3-enter").length,
  );
  results.push({ step, archiveEnter: count });
  if (count === 0) {
    return fail(`${step}: expected .ps3-enter on archive tiles`);
  }
  return true;
}

function fail(msg, extra) {
  console.error("FAIL:", msg, extra ? JSON.stringify(extra, null, 2) : "");
  return false;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-gpu-sandbox", "--use-gl=swiftshader"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const results = [];
  let ok = true;

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  const introPlaying = await page.evaluate(
    () => document.documentElement.getAttribute("data-intro") === "playing",
  );
  if (!introPlaying) {
    ok = fail("cold / did not start with data-intro=playing") && ok;
  }
  await waitIntroDone(page);
  const introAfter = await page.evaluate(() =>
    document.documentElement.getAttribute("data-intro"),
  );
  if (introAfter === "playing") {
    ok = fail("intro stuck on playing after wait") && ok;
  }
  results.push({ step: "cold-intro", introPlaying, introAfter });

  // Work → About (first)
  let m = await clickNavMeasure(page, "/about", "about");
  results.push({ step: "work-to-about-1", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("Work→About first: about not display:block in click handler", m) && ok;
  }
  if (m.leak.archiveDisplay !== "none") {
    ok = fail("Work→About: archive leaked", m) && ok;
  }
  if (m.enterCount === 0) {
    ok = fail("Work→About first: expected .ps3-enter on about content", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 10000 });
  // Let the first About enter finish — the bug is finished CSS not restarting.
  await waitEnterMs(page);

  // About → Work (first return — shell instant, content may be entering)
  m = await clickNavMeasure(page, "/", "work");
  results.push({ step: "about-to-work-1", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("About→Work first: work not display:block in click handler", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
  await waitEnterMs(page);

  // Work → About (second — content enter should replay after the first finished)
  m = await clickNavMeasure(page, "/about", "about");
  results.push({ step: "work-to-about-2", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("Work→About second: about not display:block in click handler", m) && ok;
  }
  if (m.enterCount === 0) {
    ok = fail("Work→About second: expected .ps3-enter on about content", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 10000 });
  await waitEnterMs(page);

  // Repeat About a few more times — enter must not die after the first couple.
  for (let i = 3; i <= 5; i++) {
    m = await clickNavMeasure(page, "/", "work");
    if (m.displayInHandler !== "block") {
      ok = fail(`About→Work ${i}: work not display:block in click handler`, m) && ok;
    }
    await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
    await waitEnterMs(page);
    m = await clickNavMeasure(page, "/about", "about");
    results.push({ step: `work-to-about-${i}`, ...m });
    if (m.displayInHandler !== "block") {
      ok = fail(`Work→About ${i}: about not display:block in click handler`, m) && ok;
    }
    if (m.enterCount === 0) {
      ok = fail(`Work→About ${i}: expected .ps3-enter on about content`, m) && ok;
    }
    await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 10000 });
    await waitEnterMs(page);
  }

  // About → Work
  m = await clickNavMeasure(page, "/", "work");
  results.push({ step: "about-to-work-after-repeats", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("About→Work after repeats: work not display:block in click handler", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });

  // Work → Archive
  m = await clickNavMeasure(page, "/archive", "archive");
  results.push({ step: "work-to-archive", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("Work→Archive: archive not display:block in click handler", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/archive", null, { timeout: 10000 });
  if (!(await expectArchiveEnter(page, "work-to-archive-enter", results))) ok = false;
  const onArchive = await snapshot(page);
  results.push({ step: "on-archive", ...onArchive });
  if (onArchive.work.display !== "none" || onArchive.about.display !== "none") {
    ok = fail("On archive: other shells not none", onArchive) && ok;
  }
  await waitEnterMs(page);

  // Archive → Work
  m = await clickNavMeasure(page, "/", "work");
  results.push({ step: "archive-to-work", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("Archive→Work: work not display:block in click handler", m) && ok;
  }
  if (m.archiveDisplayInHandler !== "none") {
    ok = fail("Archive→Work: archive still visible in handler", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
  await waitEnterMs(page);

  // About → Archive → About
  m = await clickNavMeasure(page, "/about", "about");
  results.push({ step: "work-to-about-for-archive", ...m });
  if (m.enterCount === 0) {
    ok = fail("Work→About before archive: expected .ps3-enter", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 10000 });
  await waitEnterMs(page);
  m = await clickNavMeasure(page, "/archive", "archive");
  results.push({ step: "about-to-archive", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("About→Archive: archive not display:block in click handler", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/archive", null, { timeout: 10000 });
  if (!(await expectArchiveEnter(page, "about-to-archive-enter", results))) ok = false;
  await waitEnterMs(page);
  m = await clickNavMeasure(page, "/about", "about");
  results.push({ step: "archive-to-about", ...m });
  if (m.displayInHandler !== "block") {
    ok = fail("Archive→About: about not display:block in click handler", m) && ok;
  }
  if (m.enterCount === 0) {
    ok = fail("Archive→About: expected .ps3-enter on about content", m) && ok;
  }
  await page.waitForFunction(() => location.pathname === "/about", null, { timeout: 10000 });

  // Browser back / forward — destination snaps (no .ps3-enter replay)
  await page.goBack();
  await page.waitForTimeout(200);
  const back1 = await snapshot(page);
  results.push({ step: "back-to-archive", ...back1 });
  if (back1.archive.display !== "block") {
    ok = fail("Back: expected archive visible", back1) && ok;
  }
  if (back1.archiveEnter !== 0) {
    ok = fail("Back to archive: expected snap (no .ps3-enter)", back1) && ok;
  }
  await page.goForward();
  await page.waitForTimeout(200);
  const fwd1 = await snapshot(page);
  results.push({ step: "forward-to-about", ...fwd1 });
  if (fwd1.about.display !== "block") {
    ok = fail("Forward: expected about visible", fwd1) && ok;
  }
  if (fwd1.aboutEnter !== 0) {
    ok = fail("Forward to about: expected snap (no .ps3-enter)", fwd1) && ok;
  }

  // Case-study Back button snaps Work; primary About after that still enters.
  await clickNavMeasure(page, "/", "work");
  await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
  const caseHref = await page.evaluate(() => {
    const a = document.querySelector(".portfolio-grid a[href^='/']");
    return a ? a.getAttribute("href") : null;
  });
  if (caseHref && caseHref !== "/" && caseHref !== "/about" && caseHref !== "/archive") {
    await page.click(`.portfolio-grid a[href="${caseHref}"]`);
    await page.waitForFunction((h) => location.pathname === h, caseHref, { timeout: 15000 });
    const onCase = await snapshot(page);
    results.push({ step: "on-case-study", caseHref, ...onCase });
    if (onCase.work.display !== "none") {
      ok = fail("Case study: work shell should be hidden", onCase) && ok;
    }
    const backBtn = await page.$(".cs-back-desktop, .cs-back-mobile");
    if (backBtn) {
      await backBtn.click();
      await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
      const afterCsBack = await snapshot(page);
      results.push({ step: "case-study-back-button", ...afterCsBack });
      if (afterCsBack.work.display !== "block") {
        ok = fail("Case-study Back: work should be visible", afterCsBack) && ok;
      }
      if (afterCsBack.workCardOpacity != null && Number(afterCsBack.workCardOpacity) < 0.99) {
        ok = fail("Case-study Back: work content should snap at rest", afterCsBack) && ok;
      }
    } else {
      m = await clickNavMeasure(page, "/", "work");
      results.push({ step: "case-to-work-nav", ...m });
      if (m.displayInHandler !== "block") {
        ok = fail("Case→Work nav: work not display:block in click handler", m) && ok;
      }
      await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
    }
    m = await clickNavMeasure(page, "/about", "about");
    results.push({ step: "work-to-about-after-case", ...m });
    if (m.displayInHandler !== "block") {
      ok = fail("After case, Work→About: about not display:block", m) && ok;
    }
    if (m.enterCount === 0) {
      ok = fail("After case, Work→About: expected .ps3-enter", m) && ok;
    }
  } else {
    results.push({ step: "case-study", skipped: true, caseHref });
  }

  // Touch pointerup path
  await clickNavMeasure(page, "/", "work");
  await page.waitForFunction(() => location.pathname === "/", null, { timeout: 10000 });
  const touch = await page.evaluate(() => {
    const a = document.querySelector('nav a[href="/about"]');
    const shell = document.querySelector('[data-primary-shell="about"]');
    const box = a.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    a.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "touch",
        pointerId: 1,
        clientX: x,
        clientY: y,
      }),
    );
    a.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerType: "touch",
        pointerId: 1,
        clientX: x,
        clientY: y,
      }),
    );
    return {
      display: shell ? getComputedStyle(shell).display : "missing",
      enterCount: document.querySelectorAll("[data-primary-shell='about'] .ps3-enter").length,
    };
  });
  results.push({ step: "touch-pointerup-about", ...touch });
  if (touch.display !== "block") {
    ok = fail("Touch pointerup About: not display:block", touch) && ok;
  }
  if (touch.enterCount === 0) {
    ok = fail("Touch pointerup About: expected .ps3-enter", touch) && ok;
  }

  console.log(JSON.stringify({ ok, results }, null, 2));
  await browser.close();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
