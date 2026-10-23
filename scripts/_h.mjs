import { chromium } from "playwright";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(process.argv[2] + "/dialogue", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
console.log(JSON.stringify(await page.evaluate(() => { let e=document.querySelector('#thin-data .dp-study-chat'); const out=[]; for(;e&&e.id!=="thin-data";e=e.parentElement){const c=getComputedStyle(e);out.push([String(e.className).slice(0,30),c.overflow,c.overflowClipMargin,c.contain,c.clipPath])} return out; }),null,0));
await b.close();
