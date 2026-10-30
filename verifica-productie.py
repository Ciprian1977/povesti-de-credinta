# DOAR CITIRE: logo pe site după #33.
import os, time
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]; time.sleep(45)
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/','/sfantul-andrei','/rugaciuni/tatal-nostru','/evanghelia-zilei']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(time.time()),wait_until='networkidle'); pg.wait_for_timeout(1500)
            ok=lambda s: pg.evaluate("s=>{const x=document.querySelector(s);return !!(x&&x.complete&&x.naturalWidth>0)}",s)
            L.append(f"{nume} {path}: erori={e} antet={ok('.antet-logo')} subsol={ok('.footer-logo-img')} caseta={ok('.autor-articol img')} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')}")
            pg.close()
        c.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
