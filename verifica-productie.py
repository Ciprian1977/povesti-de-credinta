# DOAR CITIRE: Postul Crăciunului după #28.
import os, json, urllib.request
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/posturi/postul-craciunului-2026','/posturi','/sfintii-arhangheli-mihail-si-gavriil']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            r=pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(1500)
            t=pg.inner_text('body')
            info=f"HTTP {r.status} erori={e} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')}"
            if path.endswith('2026'): info+=f" rânduri_tabel={pg.eval_on_selector_all('.tabel-post tbody tr','x=>x.length')} ld={[json.loads(s)['@type'] for s in pg.eval_on_selector_all('script[type=\"application/ld+json\"]','x=>x.map(s=>s.textContent)')]}"
            else: info+=f" link_post={bool(pg.query_selector('a[href=\"/posturi/postul-craciunului-2026\"]'))}"
            L.append(f'{nume} {path}: {info}'); pg.close()
        c.close()
    b.close()
s=urllib.request.urlopen('https://www.povestidecredinta.ro/sitemap.xml',timeout=20).read().decode()
L.append('sitemap: '+str('postul-craciunului-2026' in s))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
