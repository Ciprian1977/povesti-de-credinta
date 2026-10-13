# DOAR CITIRE: verifică acatistele (PR #20) în producție. OneSignal/analytics blocate.
import os
from playwright.sync_api import sync_playwright
B='https://povestidecredinta.ro'
P={'/acatiste/maica-domnului':(['Îngerul cel mai întâistătător','Preacurată Doamnă','Condacul 13'],['Doxologia']),
   '/acatiste/sfantul-antonie':(['Fugind de întunericul cel negru al Egiptului','Bucură-te, Părinte Antonie','Condacul 13'],['Doxologia','Mireasă']),
   '/acatiste/sfantul-nicolae':(['în verificare'],['Condacul','Doxologia','Mireasă']),
   '/acatiste/iisus-hristos':(['în verificare'],['Condacul','Doxologia']),
   '/acatiste':(['Acatistul Sfântului Antonie cel Mare','în verificare'],['Doxologia']),
   '/':([],[])}
os.makedirs('out',exist_ok=True); L=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for nume,vp,mob in [('mobil',{'width':390,'height':844},True),('desktop',{'width':1366,'height':900},False)]:
        c=b.new_context(viewport=vp,is_mobile=mob,locale='ro-RO',service_workers='block')
        c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','googletagmanager','google-analytics','/_vercel/insights']) else r.continue_())
        for path,(da,nu) in P.items():
            pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:100]))
            r=pg.goto(B+path+'?v='+str(os.getpid()),wait_until='networkidle'); pg.wait_for_timeout(1500)
            t=pg.inner_text('body'); pr=[]
            if r.status!=200: pr.append(f'HTTP {r.status}')
            if e: pr.append(f'erori {e}')
            if pg.evaluate('document.documentElement.scrollWidth>innerWidth+1'): pr.append('depășire')
            pr+=[f'lipsă „{x}”' for x in da if x not in t]+[f'apare „{x}”' for x in nu if x in t]
            L.append(f"{nume} {path}: {'OK' if not pr else pr} (Bucură-te x{t.count('Bucură-te')})"); pg.close()
        c.close()
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
