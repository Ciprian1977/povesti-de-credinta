# DOAR CITIRE: după #38 – bannerul de cookie-uri.
import os, time
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); time.sleep(60); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,service_workers='block')
    c.route('**/*',lambda r: r.abort() if 'onesignal' in r.request.url else r.continue_())
    pg=c.new_page(); pg.goto('https://www.povestidecredinta.ro/?x='+str(time.time()),wait_until='networkidle'); pg.wait_for_timeout(3000)
    r=pg.evaluate("""()=>[...document.querySelectorAll('#cookie-banner button')].map(x=>{const r=x.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return [x.innerText.trim(),Math.round(r.bottom),!!(e&&e.closest('#cookie-banner'))]})""")
    L.append('butoane: '+str(r)+' tema16: '+str(pg.evaluate("!!document.querySelector('link[href*=\"tema.css?v=16\"]')")))
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n')
