const { chromium } = require('/workspace/preview/node_modules/playwright');
const fs = require('fs');
const OUT = process.argv[2];
const V = [['ref','b056865',3201],['p3','P3 localhost 4bfc4c4',3202],['p4','P4 5e6deae',3203]];
(async () => {
  const b = await chromium.launch();
  const data = {};
  for (const [key,label,port] of V) for (const theme of ['light','dark']) {
    const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
    await ctx.addInitScript(t => { if (t==='light') localStorage.setItem('theme','light'); else localStorage.removeItem('theme'); }, theme);
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${port}/dialogue/ds-parity`, { waitUntil:'networkidle', timeout:180000 });
    await p.addStyleTag({content: `[data-parity-live]{background:${theme==='light'?'#f7f7f5':'#1b1e21'} !important}`}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
    const ids = await p.$$eval('[data-parity-id]', s => s.map(x=>x.dataset.parityId));
    for (const id of ids) {
      const el = await p.$(`[data-parity-id="${id}"] [data-parity-live]`);
      fs.mkdirSync(`${OUT}/img`, {recursive:true});
      await el.screenshot({ path: `${OUT}/img/${id}--${key}--${theme}.png` });
      const r = await p.$eval(`[data-parity-id="${id}"] [data-parity-live]`, (live) => {
        const root = live.querySelector('.dialogue-product-root') || live;
        const cs0 = getComputedStyle(root); const toks = {};
        const normVar = n => { const d=document.createElement('i'); d.style.color=`var(${n})`; root.appendChild(d); const v=getComputedStyle(d).color; d.remove(); return v; };
        const norm = c => { const d=document.createElement('i'); d.style.color=c; document.body.appendChild(d); const v=getComputedStyle(d).color; d.remove(); return v; };
        for (const s of document.styleSheets) { try { for (const ru of s.cssRules) { const st = ru.style; if (!st) continue; for (const n of st) if (/^--(dp|ds)-/.test(n)) { const v = cs0.getPropertyValue(n).trim(); if (v && /^(#|rgb|color-mix|hsl)/.test(v)) toks[n] = normVar(n); } } } catch(e){} }
        const byVal = {}; for (const [n,v] of Object.entries(toks)) (byVal[v] ||= []).push(n);
        const pref = a => a ? (a.find(n=>n.startsWith('--dp-'))||a[0]) : null;
        const lum = c => { const m=c.match(/[\d.]+/g).map(Number); const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4}; return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]); };
        const alpha = c => { const m=c.match(/[\d.]+/g).map(Number); return m.length>3?m[3]:1; };
        const effBg = e => { while (e) { const c=getComputedStyle(e).backgroundColor; if (alpha(c)>0.5) return c; e=e.parentElement; } return 'rgb(255, 255, 255)'; };
        const path = e => { const a=[]; while (e && e!==root) { a.unshift((e.className&&typeof e.className==='string'?e.className.split(' ').filter(c=>/^dp-|^dialogue/.test(c))[0]:'')||e.tagName.toLowerCase()); e=e.parentElement; } return a.slice(-3).join(' > '); };
        const rows = []; const seen = new Set();
        for (const e of root.querySelectorAll('*')) {
          const cs = getComputedStyle(e); if (cs.display==='none'||cs.visibility==='hidden') continue;
          const text = [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
          const pth = path(e);
          const props = [];
          if (text) props.push(['color', cs.color]);
          if (alpha(cs.backgroundColor)>0) props.push(['background', cs.backgroundColor]);
          if (parseFloat(cs.borderTopWidth)>0 && alpha(cs.borderTopColor)>0) props.push(['border', cs.borderTopColor]);
          for (const [prop,val] of props) {
            const k = pth+'|'+prop+'|'+val; if (seen.has(k)) continue; seen.add(k);
            const row = { path:pth, prop, value:val, token: pref(byVal[val]) , text:text.slice(0,40)};
            if (prop==='color') { const bg=effBg(e); const L1=lum(val),L2=lum(bg); row.bg=bg; row.contrast=+(((Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)).toFixed(2)); const fs=parseFloat(cs.fontSize),fw=+cs.fontWeight; row.size=fs; row.large = fs>=24 || (fs>=18.66&&fw>=700); row.font = cs.fontFamily.split(',')[0].replace(/"/g,'').trim(); }
            rows.push(row);
          }
        }
        return { tokens: toks, rows };
      });
      ((data[id] ||= {})[key] ||= {})[theme] = r;
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/raw.json`, JSON.stringify(data,null,1));
  console.log(Object.keys(data));
})();
