# DOAR CITIRE: Moșii de toamnă după #34.
import os, json, time, urllib.request
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]; time.sleep(45)
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/mosii-de-toamna','/']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            r=pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(time.time()),wait_until='networkidle'); pg.wait_for_timeout(1500)
            t=pg.inner_text('body')
            if path=='/': L.append(f"{nume} /: erori={e} banner_mosi={bool(pg.query_selector('#banner-mosi'))}")
            else: L.append(f"{nume} {path}: HTTP {r.status} erori={e} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')} titlu={pg.title()[:50]!r} 40zile={'40 de zile' in t} tropar={'Cu sfinții odihnește' in t} ld={[json.loads(s)['@type'] for s in pg.eval_on_selector_all('script[type=\"application/ld+json\"]','x=>x.map(s=>s.textContent)')]}")
            pg.close()
        c.close()
    b.close()
s=urllib.request.urlopen('https://www.povestidecredinta.ro/sitemap.xml',timeout=20).read().decode(); L.append('sitemap: '+str('/mosii-de-toamna' in s))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
