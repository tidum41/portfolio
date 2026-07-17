import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

  const links = await page.$$eval('.nav-link', els => els.map(el => ({
    text: el.textContent,
    bounds: {
      x: el.getBoundingClientRect().x,
      y: el.getBoundingClientRect().y,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
    },
    opacity: window.getComputedStyle(el).opacity,
    display: window.getComputedStyle(el).display,
  })));

  console.log("Nav Links:", links);

  await browser.close();
})();
