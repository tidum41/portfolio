import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  console.log('Navigating to http://localhost:3005 ...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

  await page.screenshot({ path: '/Users/m/.gemini/antigravity/brain/4c2026ed-afc6-4c7c-80b1-1b1b7cbf2e69/mobile_render_check.png' });
  console.log('Screenshot taken!');

  await browser.close();
})();
