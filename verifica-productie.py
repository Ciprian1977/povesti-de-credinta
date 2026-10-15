# DOAR CITIRE: cardul „Sfinții zilei” după #22.
import os
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/','/sfintii-zilei']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(3000)
            L.append(f"{nume} {path}: H1={pg.inner_text('#sfant-nume')!r} | text={(pg.inner_text('#sfant-scurt')[:100] if pg.query_selector('#sfant-scurt') else '-')!r} | erori={e}")
            pg.close()
        c.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
