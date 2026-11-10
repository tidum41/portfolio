import { chromium } from 'playwright-core';
import fs from 'fs';
const b = await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p = await b.newPage({viewport:{width:1440,height:900}});
for (const [name,url] of [['meganphi-tally','https://www.meganphi.com/projects/tally'],['meganyap-splunk','https://meganyap.me/work/splunk'],['natalie-notionmail','https://nataliealmosa.ca/notion-mail'],['jessfong-patreon','https://jessfong.com/work/patreon-free-content'],['jessfong-reddit','https://jessfong.com/work/reddit']]) {
 try{
 await p.goto(url,{waitUntil:'networkidle',timeout:60000}); await p.waitForTimeout(2500);
 const H = await p.evaluate(()=>{const s=[...document.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+500&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)&&e.clientHeight>500); window.__s=s||document.scrollingElement; return window.__s.scrollHeight;});
 // scroll through to trigger lazy load
 for(let y=0;y<H;y+=700){await p.evaluate(y=>window.__s.scrollTo(0,y),y); await p.waitForTimeout(250);}
 await p.evaluate(()=>window.__s.scrollTo(0,0)); await p.waitForTimeout(800);
 const r = await p.evaluate(()=>{
  const out=[]; const sy=window.__s.scrollTop;
  for(const e of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,figcaption,img,video,iframe,li,blockquote')){
   const bb=e.getBoundingClientRect(); if(bb.width<20||bb.height<5) continue;
   const t=e.tagName; const isM=/IMG|VIDEO|IFRAME/.test(t);
   if(!isM && e.closest('li')&&t==='P') continue;
   const txt=isM?(e.currentSrc||e.src||'').split('/').pop().slice(0,40):e.innerText.trim().replace(/\s+/g,' ');
   if(!txt&&!isM) continue; const cs=getComputedStyle(e);
   let bg=''; if(isM){let a=e.parentElement;for(let k=0;k<4&&a;k++,a=a.parentElement){const c=getComputedStyle(a).backgroundColor;if(c&&c!=='rgba(0, 0, 0, 0)'){bg=' bg'+c.replace(/ /g,'')+' wrapW'+Math.round(a.getBoundingClientRect().width)+' r'+getComputedStyle(a).borderRadius;break;}}}
   out.push(`${t} y${Math.round(bb.top+sy)} x${Math.round(bb.left)} w${Math.round(bb.width)} h${Math.round(bb.height)}${isM?bg+(t==='VIDEO'?' autoplay='+e.autoplay+' loop='+e.loop+' controls='+e.controls+' muted='+e.muted:'')+' r'+cs.borderRadius:' fs'+cs.fontSize+' '+cs.fontFamily.split(',')[0]+' w'+cs.fontWeight+' c'+cs.color+' tt'+cs.textTransform} | ${txt}`);}
  return out;});
 fs.writeFileSync(`../shots/refs/${name}-layout.txt`, url+'\nheight '+H+'\n'+r.join('\n'));
 for (let i=0;i*900<H && i<20;i++){ await p.evaluate(y=>window.__s.scrollTo(0,y),i*900); await p.waitForTimeout(700); await p.screenshot({path:`../shots/refs/${name}-${i}.png`}); }
 console.log(name,H,r.length);
 }catch(err){console.log(name,'ERR',err.message.slice(0,200));}
}
await b.close();
