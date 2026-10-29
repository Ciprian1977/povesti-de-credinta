# DOAR CITIRE: pagina Arhangheli după #27.
import os, json
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
        r=pg.goto('https://www.povestidecredinta.ro/sfintii-arhangheli-mihail-si-gavriil?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(1500)
        t=pg.inner_text('body')
        ld=[json.loads(s)['@type'] for s in pg.eval_on_selector_all('script[type="application/ld+json"]','x=>x.map(s=>s.textContent)')]
        L.append(f"{nume}: HTTP {r.status} erori={e} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')} evrei={'Cum vom scăpa noi' in t} luca={'văzut-am pre satana' in t} tropar={'Mai-marilor Voievozi' in t} ld={ld}")
        c.close()
    b.close()
import urllib.request
s=urllib.request.urlopen('https://www.povestidecredinta.ro/sitemap.xml',timeout=20).read().decode()
L.append('sitemap conține pagina: '+str('sfintii-arhangheli-mihail-si-gavriil' in s))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
