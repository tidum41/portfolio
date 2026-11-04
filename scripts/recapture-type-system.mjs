import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const LOCAL = 'http://localhost:3000';
const PROD = 'https://www.muditm.com';
const TMP = '/tmp/type-system-shots';
const OUT = '/opt/cursor/artifacts/screenshots';
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

async function waitReady(page, { home = false } = {}) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => { await document.fonts.ready; });

  if (home) {
    await page.waitForFunction(() => {
      const intro = document.documentElement.getAttribute('data-intro');
      const gateOpen = intro !== 'playing';
      const sub = document.querySelector('[data-hero-sub], .hero-sub');
      const subOk = sub && parseFloat(getComputedStyle(sub).opacity) > 0.9;
      const cards = [...document.querySelectorAll('.portfolio-grid-card')].filter(c => {
        const r = c.getBoundingClientRect();
        return r.height > 20 && parseFloat(getComputedStyle(c).opacity) > 0.5;
      });
      return gateOpen && subOk && cards.length >= 2;
    }, { timeout: 20000 });
  } else {
    await page.evaluate(() => {
      const html = document.documentElement;
      if (html.getAttribute('data-intro') === 'playing') {
        html.setAttribute('data-intro', 'done');
        window.dispatchEvent(new CustomEvent('intro-done'));
      }
    });
    await page.waitForTimeout(800);
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && parseFloat(getComputedStyle(h1).opacity) > 0.9;
    }, { timeout: 12000 }).catch(() => {});
  }
}

async function slowScrollFullPage(page) {
  const height = await page.evaluate(() => Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  ));
  const step = 240;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, left: 0, behavior: 'instant' }), y);
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'instant' }));
  await page.waitForTimeout(2000);
}

async function scrollToTop(page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
  await page.waitForFunction(() => (window.scrollY || document.documentElement.scrollTop) < 2, { timeout: 5000 });
  await page.waitForTimeout(500);
}

async function capturePair(page, tag, width, { home = false, mid = false } = {}) {
  const route = tag.startsWith('cs') ? '/ucla-sublease' : tag === 'about' ? '/about' : '/';
  for (const [label, base] of [['before', PROD], ['after', LOCAL]]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitReady(page, { home });
    // Ensure we start at top with content visible, then slow-scroll whole page
    await scrollToTop(page);
    await slowScrollFullPage(page);
    if (mid) {
      await page.evaluate(() => {
        const el = document.querySelector('#research') || document.querySelector('#process');
        el?.scrollIntoView({ block: 'start' });
      });
      await page.waitForTimeout(500);
    } else {
      await scrollToTop(page);
      // Home: assert hero/sub visible before capture
      if (home) {
        await page.waitForFunction(() => {
          const sub = document.querySelector('[data-hero-sub]');
          const h1 = document.querySelector('h1');
          const y = window.scrollY || document.documentElement.scrollTop;
          return y < 2 && sub && parseFloat(getComputedStyle(sub).opacity) > 0.9
            && h1 && h1.getBoundingClientRect().top > 0 && h1.getBoundingClientRect().top < 400;
        }, { timeout: 8000 });
      }
      if (tag === 'about') {
        await page.waitForFunction(() => {
          const h1 = [...document.querySelectorAll('h1')].find(h => /Hello/.test(h.textContent||''));
          const y = window.scrollY || document.documentElement.scrollTop;
          return y < 2 && h1 && h1.getBoundingClientRect().top >= 0 && h1.getBoundingClientRect().top < 300;
        }, { timeout: 8000 });
      }
      if (tag === 'cs-top') {
        await page.waitForFunction(() => {
          const h1 = document.querySelector('.cs-content h1, article h1');
          const y = window.scrollY || document.documentElement.scrollTop;
          return y < 2 && h1 && h1.getBoundingClientRect().top >= 0 && h1.getBoundingClientRect().top < 400;
        }, { timeout: 8000 });
      }
    }
    const path = join(TMP, `${label}-${tag}-${width}.png`);
    await page.screenshot({ path, fullPage: false });
    console.log('wrote', path);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const w of [1440, 390]) {
  await capturePair(page, 'home', w, { home: true });
  await capturePair(page, 'about', w);
  await capturePair(page, 'cs-top', w);
  await capturePair(page, 'cs-mid', w, { mid: true });
}

// Final sanity on after-home-1440 content via image isn't possible here — DOM check:
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(LOCAL + '/', { waitUntil: 'domcontentloaded' });
await waitReady(page, { home: true });
await scrollToTop(page);
const sanity = await page.evaluate(() => {
  const h1 = document.querySelector('h1');
  const sub = document.querySelector('[data-hero-sub]');
  const menu = [...document.querySelectorAll('*')].find(el => el.childNodes.length && el.textContent?.trim() === 'Menu' && el.getClientRects().length);
  return {
    scrollY: window.scrollY,
    h1: h1?.textContent?.slice(0, 50),
    h1Top: h1?.getBoundingClientRect().top,
    sub: sub?.textContent?.trim(),
    subOpacity: sub && getComputedStyle(sub).opacity,
    menuOpacity: menu && getComputedStyle(menu).opacity,
    menuTop: menu?.getBoundingClientRect().top,
  };
});
console.log('sanity', JSON.stringify(sanity, null, 2));
await browser.close();
