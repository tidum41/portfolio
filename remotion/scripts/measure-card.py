import json
from playwright.sync_api import sync_playwright
out={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for w,h in [(1440,900),(1920,1080),(390,844)]:
        pg=b.new_page(viewport={"width":w,"height":h})
        pg.goto("http://localhost:3000/",wait_until="networkidle",timeout=120000)
        pg.wait_for_timeout(4000)
        out[w]=pg.evaluate("""()=>[...document.querySelectorAll('.portfolio-grid-card .project-img-wrap')].map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);const card=e.closest('.portfolio-grid-card');return {card:card.dataset.gridCard,w:+r.width.toFixed(1),h:+r.height.toFixed(1),ar:cs.aspectRatio,radius:cs.borderRadius,video:!!e.querySelector('video,mux-player,.mux-media-slot'),grid:getComputedStyle(document.querySelector('.portfolio-grid')).gridTemplateColumns}})""")
        pg.close()
print(json.dumps(out,indent=1))
