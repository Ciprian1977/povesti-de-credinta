# DOAR CITIRE: pagina Sf. Dimitrie după #23.
import os
from playwright.sync_api import sync_playwright
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
        for path in ['/rugaciuni/sfantul-dimitrie','/','/rugaciuni']:
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            r=pg.goto('https://www.povestidecredinta.ro'+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(2000)
            t=pg.inner_text('body')
            info=f"HTTP {r.status} erori={e} overflow={pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')}"
            if 'dimitrie' in path:
                info+=f" paragrafe={pg.eval_on_selector_all('#text-rugaciune p','x=>x.length')} video={bool(pg.query_selector('.video-rug-start'))} amin={'Amin.' in t}"
                pg.click('.video-rug-start'); pg.wait_for_timeout(1500); info+=f" iframe={bool(pg.query_selector('.video-rug iframe'))}"
            else: info+=f" link_dimitrie={'Sfântul Mare Mucenic Dimitrie' in t or 'Rugăciune către Sfântul Dimitrie' in t}"
            L.append(f'{nume} {path}: {info}'); pg.close()
        c.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
