# DOAR CITIRE: Sf. Andrei după #29.
import os, json, urllib.request
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/sfantul-andrei','/posturi/postul-craciunului-2026']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            r=pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(1500)
            t=pg.inner_text('body')
            info=f"HTTP {r.status} erori={e} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')}"
            if path.endswith('andrei'): info+=f" ioan={'Mielul' in t} matei={'Simon' in t} ld={[json.loads(s)['@type'] for s in pg.eval_on_selector_all('script[type=\"application/ld+json\"]','x=>x.map(s=>s.textContent)')]}"
            else: info+=f" link_andrei={bool(pg.query_selector('a[href=\"/sfantul-andrei\"]'))}"
            L.append(f'{nume} {path}: {info}'); pg.close()
        c.close()
    b.close()
s=urllib.request.urlopen('https://www.povestidecredinta.ro/sitemap.xml',timeout=20).read().decode()
L.append('sitemap: '+str('/sfantul-andrei' in s))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
