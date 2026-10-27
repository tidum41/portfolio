const fs=require('fs'); const A=require('./out/audit.json');
const LABEL={hardcoded:'Hardcoded colour','untokenised-mix':'Untokenised mix','missing-light':'Missing light/dark token pair',contrast:'Fails WCAG AA',font:'Off-system font',drift:'Drift from b056865','off-system':'Unapproved component'};
// relabel color-mix alpha fills
for (const c of Object.values(A.components)) for (const v of Object.values(c)) for (const rows of Object.values(v)) for (const r of rows) r.flags=r.flags.map(([k,m])=> k==='hardcoded'&&/\/ 0\.\d+\)$/.test(r.value)? ['untokenised-mix',`color-mix() of a role token at partial alpha written in component CSS, not a named --dp token`]:[k,m]);
// static checker
const parse=f=>fs.readFileSync(f,'utf8').split('\n').map(l=>l.match(/^(\S+):(\d+)\s+(\S+)\s+(.*)$/)).filter(Boolean).map(m=>({file:m[1],line:+m[2],rule:m[3],text:m[4]}));
const stat={ref:parse('/tmp/cds-ref.txt'),p3:parse('/tmp/cds-dlg-audit.txt'),p4:parse('/tmp/cds-p4.txt')};
// P3 dark block coverage
const tok=fs.readFileSync('/workspace/dlg-audit/styles/dialogue-tokens.css','utf8');
const l2=tok.split('Layer 2. Role tokens')[1].split('Layer 3')[0];
const colorRoles=[...l2.matchAll(/(--dp-[\w-]+):\s*var\(--ds-(?:white|black|stone|gray|paper|cherry|amber|suggestion)[^)]*\)/g)].map(m=>m[1]);
const darkBlock=tok.split('html[data-theme="dark"] .dialogue-product-root')[1]||'';
const overridden=new Set([...darkBlock.matchAll(/(--[\w-]+):/g)].map(m=>m[1]));
const uncovered=colorRoles.filter(t=>!overridden.has(t));
const rawDark=[...darkBlock.matchAll(/(--[\w-]+):\s*(#[0-9a-f]+)/gi)].map(m=>({token:m[1],value:m[2]}));
const summary={};
for (const v of ['ref','p3','p4']) { const s={light:{},dark:{}};
  for (const t of ['light','dark']) for (const c of Object.values(A.components)) for (const r of c[v][t]) { for (const [k] of r.flags) s[t][k]=(s[t][k]||0)+1; if(r.drift) s[t].drift=(s[t].drift||0)+1; }
  s.static={}; for (const p of stat[v]) s.static[p.rule]=(s.static[p.rule]||0)+1; s.staticTotal=stat[v].length;
  summary[v]=s; }
summary.p3.light['missing-light']=rawDark.length; // raw-hex dark values with no DS raw pair
const out={generated:new Date().toISOString(),versions:A.versions,labels:LABEL,summary,components:A.components,static:stat,p3Dark:{uncovered,rawDark}};
fs.writeFileSync(process.argv[2],JSON.stringify(out)); console.log(JSON.stringify(summary,null,0)); console.log('uncovered',uncovered.join(' '));
