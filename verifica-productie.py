# DOAR CITIRE: navigare după #35.
import os, time, urllib.request
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]; time.sleep(45)
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
    c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
    for path,sel in [('/','#lista-sarbatori li'),('/articole','main li'),('/sfantul-andrei','.leg-articole li'),('/mosii-de-toamna','.leg-articole li')]:
        pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
        r=pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(time.time()),wait_until='networkidle'); pg.wait_for_timeout(1500)
        L.append(f"{path}: HTTP {r.status} erori={e} elemente={pg.locator(sel).count()} meniu={pg.locator('a[href=\"/articole\"]').count()} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')} titlu={pg.title()[:60]!r}")
        pg.close()
    b.close()
s=urllib.request.urlopen('https://www.povestidecredinta.ro/sitemap.xml',timeout=20).read().decode(); L.append('sitemap: '+str('/articole<' in s))
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
