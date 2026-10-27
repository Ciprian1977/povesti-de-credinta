# DOAR CITIRE: tropar/condac după #25.
import os
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/sinaxar','/sinaxarul-zilei','/sfantul-zilei','/sfintii-zilei','/']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(3000)
            t=pg.inner_text('body')
            L.append(f"{nume} {path}: erori={e} tropar_zi={'Pomenirea dreptului este cu laude' in t} condac={'Ceea ce mai înainte era stearpă' in t} indisponibil={'Troparul nu este disponibil' in t or 'Condacul nu este disponibil' in t} tropar_AI={'Cu viaţă îmbunătăţită' in t} Basarabov={'Basarabov' in t}")
            pg.close()
        c.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
