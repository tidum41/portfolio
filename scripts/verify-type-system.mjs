import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = '/opt/cursor/artifacts/screenshots';
const TMP = '/tmp/type-system-shots';
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const LOCAL = 'http://localhost:3000';
const PROD = 'https://www.muditm.com';

async function waitFonts(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  // skip intro if present
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-intro', 'done');
  });
  await page.waitForTimeout(400);
}

async function fontReport(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const fonts = [...document.fonts].map(f => ({
      family: f.family,
      weight: f.weight,
      status: f.status,
    }));
    const areal = fonts.filter(f => /areal/i.test(f.family));
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { sel, family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing };
    };
    return {
      arealLoaded: areal.some(f => f.status === 'loaded'),
      areal,
      body: pick('body'),
      nav: pick('nav') || pick('header') || pick('[data-nav]') || pick('a.nav-link'),
      toc: pick('.cs-aside button') || pick('.cs-aside a') || pick('.cs-back-mobile-label'),
      card: pick('.portfolio-grid-card') || pick('.project-card'),
      h1: pick('h1'),
      h2: pick('h2'),
    };
  });
}

async function shot(page, url, name, width) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitFonts(page);
  const path = join(TMP, `${name}-${width}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function measureCardGaps(page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('.portfolio-grid-card')].filter(el => el.getClientRects().length);
    const gaps = [];
    for (let i = 1; i < cards.length; i++) {
      const a = cards[i - 1].getBoundingClientRect();
      const b = cards[i].getBoundingClientRect();
      gaps.push(Math.round((b.top - a.bottom) * 10) / 10);
    }
    return gaps;
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Local font checks
const routes = ['/', '/about', '/ucla-sublease', '/archive'];
const reports = {};
for (const r of routes) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LOCAL + r, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitFonts(page);
  reports[r] = await fontReport(page);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(LOCAL + '/', { waitUntil: 'domcontentloaded' });
await waitFonts(page);
const gaps390 = await measureCardGaps(page);

// Screenshots: after (local) + before (prod)
const targets = [
  { route: '/', tag: 'home' },
  { route: '/about', tag: 'about' },
  { route: '/ucla-sublease', tag: 'cs-top' },
];

for (const t of targets) {
  for (const w of [1440, 390]) {
    await shot(page, PROD + t.route, `before-${t.tag}`, w);
    await shot(page, LOCAL + t.route, `after-${t.tag}`, w);
  }
}

// CS mid-section: scroll to research
for (const [label, base] of [['before', PROD], ['after', LOCAL]]) {
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    await page.goto(base + '/ucla-sublease', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitFonts(page);
    await page.evaluate(() => {
      const el = document.querySelector('#research') || document.querySelector('#process');
      el?.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(TMP, `${label}-cs-mid-${w}.png`), fullPage: false });
  }
}

console.log(JSON.stringify({ reports, gaps390 }, null, 2));
await browser.close();
