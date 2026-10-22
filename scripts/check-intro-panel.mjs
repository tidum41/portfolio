#!/usr/bin/env node
/**
 * Homepage PS3 menu intro reveal gate (HOM-01).
 *   npm run check:intro-panel -- <preview-url>
 *
 * Fresh storage at 1440 and 390, unthrottled and 4× CPU + Slow 3G, 2 runs each.
 * Fails unless:
 *   - the panel's reveal commits (inert off, opacity style 1) within 1000ms of
 *     the hero heading reaching computed opacity 1
 *   - no panel control is focusable while the panel is still hidden (inert)
 *
 * SELFTEST=failsafe  — suppress intro-done; prove the 3000ms fail-safe still
 *                      shows the panel (must exit 0).
 * SELFTEST=nofailsafe — suppress intro-done and set __PS3CP_DISABLE_FAILSAFE;
 *                       the normal timing check must fail (must exit 1).
 */
import { chromium } from "playwright";

const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!arg) {
  console.error("usage: check-intro-panel.mjs <preview-url>");
  process.exit(2);
}
const base = new URL(arg);
const share = base.searchParams.get("_vercel_share");
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const selftest = process.env.SELFTEST || "";
const homeUrl = () => {
  const u = new URL("/", base.origin);
  if (share) u.searchParams.set("_vercel_share", share);
  if (secret) {
    u.searchParams.set("x-vercel-protection-bypass", secret);
    u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  }
  return u.toString();
};

const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

const SLOW_3G = {
  offline: false,
  // Chrome DevTools "Slow 3G": 400 kbps down/up, 400 ms RTT
  downloadThroughput: Math.floor((400 * 1000) / 8),
  uploadThroughput: Math.floor((400 * 1000) / 8),
  latency: 400,
};

async function applyThrottle(page, on) {
  const client = await page.context().newCDPSession(page);
  if (on) {
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await client.send("Network.emulateNetworkConditions", {
      ...SLOW_3G,
      connectionType: "cellular3g",
    });
  } else {
    await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }
  return client;
}

function suppressIntroDoneInit() {
  // Swallow intro-done so the normal reveal path never runs.
  const proto = EventTarget.prototype;
  const orig = proto.dispatchEvent;
  proto.dispatchEvent = function (ev) {
    if (ev && ev.type === "intro-done") return true;
    return orig.call(this, ev);
  };
}

async function runOnce(browser, { width, throttle, label, mode, forceNofailsafe = false }) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    // Fresh storage every run — first-load intro only.
    storageState: undefined,
  });
  const page = await ctx.newPage();

  if (mode === "failsafe" || mode === "nofailsafe" || forceNofailsafe) {
    await page.addInitScript(suppressIntroDoneInit);
  }
  if (mode === "nofailsafe" || forceNofailsafe) {
    await page.addInitScript(() => {
      window.__PS3CP_DISABLE_FAILSAFE = true;
    });
  }

  await applyThrottle(page, throttle);

  const res = await page.goto(homeUrl(), { waitUntil: "domcontentloaded", timeout: 120000 });
  if (!res || res.status() >= 400) {
    log(false, `${label}: status ${res && res.status()}`);
    await ctx.close();
    return;
  }

  // Probe while the intro plays: no panel control may accept focus.
  const focusWhileHidden = await page.evaluate(async () => {
    const deadline = performance.now() + 8000;
    const bad = [];
    while (performance.now() < deadline) {
      const panel = document.querySelector(".ps3cp");
      if (!panel) {
        await new Promise((r) => requestAnimationFrame(r));
        continue;
      }
      if (!panel.hasAttribute("inert")) break;
      const controls = panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      for (const el of controls) {
        const prev = document.activeElement;
        try {
          el.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
        if (document.activeElement === el) {
          bad.push((el.getAttribute("aria-label") || el.tagName).slice(0, 40));
          try {
            prev && prev.focus({ preventScroll: true });
          } catch {
            /* ignore */
          }
          break;
        }
      }
      if (bad.length) break;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return bad;
  });
  log(
    focusWhileHidden.length === 0,
    `${label} no panel control focusable while hidden${
      focusWhileHidden.length ? ` (got focus: ${focusWhileHidden.join(", ")})` : ""
    }`,
  );

  // Wait for hero + panel reveal timestamps (ms from timeOrigin).
  const timing = await page.evaluate(async ({ mode, failsafeWaitMs }) => {
    const heroSel = ".hero-heading";
    const panelSel = ".ps3cp";
    const deadline =
      performance.now() + (mode === "failsafe" || mode === "nofailsafe" ? failsafeWaitMs + 2000 : 12000);

    let heroAt = null;
    let panelAt = null;

    while (performance.now() < deadline) {
      const hero = document.querySelector(heroSel);
      const panel = document.querySelector(panelSel);
      if (hero && heroAt == null) {
        const o = parseFloat(getComputedStyle(hero).opacity);
        if (o >= 0.99) heroAt = performance.now();
      }
      if (panel && panelAt == null) {
        // Reveal commit: inert off and opacity style target is 1 (same as
        // removing aria-hidden). Do not wait for the CSS fade to finish —
        // REVEAL_MS alone is > 1000ms.
        const styleOpacity = panel.style.opacity;
        const revealed =
          !panel.hasAttribute("inert") &&
          (styleOpacity === "1" || parseFloat(getComputedStyle(panel).opacity) >= 0.99);
        if (revealed) panelAt = performance.now();
      }
      if (heroAt != null && panelAt != null) break;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return {
      heroAt,
      panelAt,
      intro: document.documentElement.getAttribute("data-intro"),
      inert: document.querySelector(panelSel)?.hasAttribute("inert") ?? null,
      panelOpacity: document.querySelector(panelSel)
        ? parseFloat(getComputedStyle(document.querySelector(panelSel)).opacity)
        : null,
    };
  }, { mode, failsafeWaitMs: 3000 });

  if (mode === "failsafe") {
    log(
      timing.panelAt != null && timing.inert === false,
      `${label} fail-safe revealed panel (panelAt=${timing.panelAt != null ? Math.round(timing.panelAt) : "null"}ms, opacity=${timing.panelOpacity})`,
    );
  } else if (mode === "nofailsafe") {
    // Expect the normal check to fail: panel should not reveal.
    const stillHidden = timing.panelAt == null || timing.inert === true;
    log(
      stillHidden,
      `${label} nofailsafe keeps panel hidden (panelAt=${timing.panelAt != null ? Math.round(timing.panelAt) : "null"}, inert=${timing.inert})`,
    );
  } else {
    const okHero = timing.heroAt != null;
    const okPanel = timing.panelAt != null;
    log(okHero, `${label} hero reached opacity 1${okHero ? ` at ${Math.round(timing.heroAt)}ms` : ""}`);
    log(okPanel, `${label} panel reveal committed${okPanel ? ` at ${Math.round(timing.panelAt)}ms` : ""}`);
    if (okHero && okPanel) {
      const delta = timing.panelAt - timing.heroAt;
      log(
        delta <= 1000,
        `${label} panel within 1000ms of hero (Δ=${Math.round(delta)}ms)`,
      );
    } else {
      log(false, `${label} panel within 1000ms of hero (missing timestamps)`);
    }
  }

  await ctx.close();
}

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

try {
  if (selftest === "failsafe") {
    console.log("SELFTEST=failsafe (suppress intro-done; expect fail-safe reveal)");
    for (const width of [1440, 390]) {
      await runOnce(browser, {
        width,
        throttle: false,
        label: `SELFTEST failsafe @${width}`,
        mode: "failsafe",
      });
    }
  } else if (selftest === "nofailsafe") {
    console.log("SELFTEST=nofailsafe (suppress intro-done + disable fail-safe; expect the check to FAIL)");
    // Same assertions as a normal run; without intro-done and without the
    // fail-safe the panel never reveals, so this must exit non-zero.
    await runOnce(browser, {
      width: 1440,
      throttle: false,
      label: "SELFTEST nofailsafe @1440",
      mode: "normal",
      forceNofailsafe: true,
    });
  } else {
    const widths = [1440, 390];
    const throttles = [false, true];
    for (const width of widths) {
      for (const throttle of throttles) {
        for (let run = 1; run <= 2; run++) {
          const label = `@${width} ${throttle ? "4xCPU+slow3G" : "unthrottled"} run${run}`;
          await runOnce(browser, { width, throttle, label, mode: "normal" });
        }
      }
    }
  }
} finally {
  await browser.close();
}

if (selftest === "nofailsafe") {
  // Expect failures: exit 1 proves the check catches a missing fail-safe.
  console.log(
    failures.length
      ? `\nSELFTEST nofailsafe: check failed as required (${failures.length} FAIL)`
      : "\nSELFTEST nofailsafe BROKEN (check unexpectedly passed)",
  );
  process.exit(failures.length ? 1 : 0);
}

console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
process.exit(failures.length ? 1 : 0);
