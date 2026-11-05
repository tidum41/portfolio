const { chromium } = require('playwright');
const OUT='/workspace/research/grid-v3';
(async()=>{const b=await chromium.launch();
const settle=async(p,u='/')=>{await p.goto('http://localhost:3417'+u,{waitUntil:'networkidle'});await p.waitForTimeout(4500);
 await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}scrollTo(0,0);});await p.waitForTimeout(1500);};
for(const [w,h,m] of [[1440,900,false],[390,844,true]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m,deviceScaleFactor:m?3:1});
 await settle(p); await p.screenshot({path:`${OUT}/home-${w}-v2.png`,fullPage:true});
 const cols=await p.$$eval('.portfolio-grid-col',c=>c.map(e=>[...e.querySelectorAll('.portfolio-grid-card')].map(x=>x.dataset.gridCard+':'+(x.getBoundingClientRect().bottom+scrollY).toFixed(1)).join(' ')));console.log(w,JSON.stringify(cols));
 if(m){const d=await p.$('[data-grid-card="project-dialogue"] [role=button]');await d.scrollIntoViewIfNeeded();await d.tap();await p.waitForTimeout(300);
  console.log('note',await p.$eval('.dialogue-tap-note',e=>e.textContent),p.url());
  const bb=await (await p.$('[data-grid-card="project-dialogue"]')).boundingBox();await p.screenshot({path:`${OUT}/dialogue-tap.png`,clip:bb});
  await p.waitForTimeout(2200);console.log('after',JSON.stringify(await p.$eval('.dialogue-tap-note',e=>e.textContent)));}
 else{await p.focus('[data-grid-card="project-dialogue"] [role=button]');await p.keyboard.press('Enter');await p.waitForTimeout(200);console.log('enter',await p.$eval('.dialogue-tap-note',e=>e.textContent),p.url());
  await settle(p,'/about');const s=p.getByText('Favorite Albums').first();await s.scrollIntoViewIfNeeded();await p.waitForTimeout(2500);const bb=await s.boundingBox();await p.screenshot({path:`${OUT}/about-albums.png`,clip:{x:0,y:Math.max(0,bb.y-20),width:1440,height:640}});}
 await p.close();}
await b.close();})();
