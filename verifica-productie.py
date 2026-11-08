# DOAR CITIRE: după #40 – bara de instalare.
import os, time
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); time.sleep(60); L=[]
UA='Mozilla/5.0 (Linux; Android 14; SM-A546B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0;]'
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,user_agent=UA,service_workers='block')
    c.route('**/*',lambda r: r.abort() if 'onesignal' in r.request.url else r.continue_())
    for u in ['/sinaxarul-zilei','/']:
        pg=c.new_page(); pg.goto('https://www.povestidecredinta.ro'+u+'?x='+str(time.time()),wait_until='networkidle'); pg.wait_for_timeout(3500)
        if pg.locator('#cookie-banner button').count(): pg.locator('#cookie-banner button').first.click(); pg.wait_for_timeout(1500)
        n=pg.locator('.bara-instalare').count()
        r=pg.evaluate("()=>{const a=document.querySelector('.bara-instalare');if(!a)return null;const x=a.getBoundingClientRect(),n=document.querySelector('.bottom-nav').getBoundingClientRect();return [Math.round(x.bottom),Math.round(n.top)]}")
        L.append(f'{u}: bara={n} bara_jos/nav_sus={r}'); pg.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n')
