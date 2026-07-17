import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // iPhone X/11/12/13 viewport
  await page.setViewport({
    width: 375,
    height: 812,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  console.log('Navigating to http://localhost:3005 ...');
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });

  // Wait for the Nav to load
  await page.waitForSelector('.nav-link');

  // Find the 'About' link
  const links = await page.$$('.nav-link');
  let aboutLink;
  for (const link of links) {
    const text = await page.evaluate(el => el.textContent, link);
    console.log(`Found link: "${text}"`);
    if (text === 'aboutabout') {
      aboutLink = link;
      break;
    }
  }

  if (aboutLink) {
    console.log('Found About link, taking pre-tap screenshot...');
    await page.screenshot({ path: '/Users/m/.gemini/antigravity/brain/4c2026ed-afc6-4c7c-80b1-1b1b7cbf2e69/mobile_1_pretap.png' });

    console.log('Tapping the link...');
    // We want to trigger the touch/pointer events, then capture screenshots during the morph
    
    // Dispatch touchstart to simulate tap down
    await aboutLink.evaluate(el => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    console.log('Taking rapid screenshots of the animation...');
    // Take screenshots every 50ms for the next 500ms
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 50));
      await page.screenshot({ path: `/Users/m/.gemini/antigravity/brain/4c2026ed-afc6-4c7c-80b1-1b1b7cbf2e69/mobile_2_anim_${i}.png` });
    }
    
    // Dispatch touchend
    await aboutLink.evaluate(el => {
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    });
    
    // Wait for the tap to register and the reverse animation to start
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 100));
      await page.screenshot({ path: `/Users/m/.gemini/antigravity/brain/4c2026ed-afc6-4c7c-80b1-1b1b7cbf2e69/mobile_3_anim_out_${i}.png` });
    }
    
    console.log('Done capturing!');
  } else {
    console.log('Could not find About link.');
  }

  await browser.close();
})();
