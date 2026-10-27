const fs=require('fs'); const D=JSON.parse(fs.readFileSync(process.argv[2]));
const DARK_LITERALS = new Set(['#f4f2ef','#a8a49e','#8f8a84','#75706a','#3a3e42','#4a4f54','#26292e','#1b1e21','#2b2f34','#33373c','#a6a09b'].map(h=>{const n=parseInt(h.slice(1),16);return `rgb(${n>>16}, ${(n>>8)&255}, ${n&255})`}));
const out={versions:{ref:'b056865 (reference)',p3:'P3 · localhost (4bfc4c4)',p4:'P4 · PR #159 (5e6deae)'},components:{},summary:{}};
for (const [id,vs] of Object.entries(D)) { out.components[id]={};
  for (const [v,th] of Object.entries(vs)) { out.components[id][v]={};
    for (const [t,{rows}] of Object.entries(th)) {
      const refRows = D[id].ref?.[t]?.rows||[];
      const refMap = new Map(refRows.map(r=>[r.path+'|'+r.prop, r]));
      const flagged = rows.map(r=>{ const f=[];
        if (!r.token && r.value!=='rgba(0, 0, 0, 0)') f.push(['hardcoded',`${r.value} matches no --dp/--ds token on this root`]);
        if (t==='light' && DARK_LITERALS.has(r.value)) f.push(['missing-light',`light mode resolves to a dark-only literal (${r.value})`]);
        if (r.contrast!=null && r.contrast < (r.large?3:4.5)) f.push(['contrast',`${r.contrast}:1 on ${r.bg}, needs ${r.large?3:4.5}:1 (WCAG AA)`]);
        if (r.font && !/DM Sans|DM Mono|Zilla/i.test(r.font)) f.push(['font',`${r.font} inside product UI; DM Sans expected`]);
        const ref=refMap.get(r.path+'|'+r.prop); if (v!=='ref' && ref && ref.value!==r.value) r.drift=`b056865: ${ref.token||ref.value}`;
        return {...r, flags:f}; });
      out.components[id][v][t]=flagged;
      const s=(out.summary[v] ||= {}); const k=(s[t] ||= {hardcoded:0,'missing-light':0,contrast:0,font:0,drift:0});
      for (const r of flagged){ for (const [c] of r.flags) k[c]++; if (r.drift) k.drift++; }
    }}}
fs.writeFileSync(process.argv[3], JSON.stringify(out,null,1)); console.log(JSON.stringify(out.summary,null,0));
