# DOAR CITIRE: rândul din baza de date pentru 15 oct + cum arată pagina principală. Nicio scriere.
import json, urllib.request, os
from playwright.sync_api import sync_playwright
os.makedirs('out', exist_ok=True); L=[]
U='https://smuqpipxeotkbttolivp.supabase.co/rest/v1/zile_ortodoxe?data_calendaristica=in.(2026-10-14,2026-10-15,2026-10-16)&select=*'
K='sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'
try:
    r=json.load(urllib.request.urlopen(urllib.request.Request(U,headers={'apikey':K,'Authorization':'Bearer '+K}),timeout=30))
    for z in r:
        L.append('=== '+z['data_calendaristica'])
        for k,v in z.items():
            if isinstance(v,str): L.append(f'  {k}: {v[:300]!r}')
            else: L.append(f'  {k}: {v!r}')
except Exception as e: L.append('eroare db '+str(e))
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,locale='ro-RO',timezone_id='Europe/Bucharest',service_workers='block')
    c.route('**/*',lambda r: r.abort() if any(x in r.request.url for x in ['onesignal','/_vercel/insights']) else r.continue_())
    for path in ['/','/sfintii-zilei','/sfantul-zilei']:
        pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)[:150])); pg.on('console',lambda m: e.append('console:'+m.text[:150]) if m.type in ('error','warning') else None)
        pg.goto('https://www.povestidecredinta.ro'+path+'?v=3',wait_until='networkidle'); pg.wait_for_timeout(3000)
        L.append(f'##### {path} erori={e}'); L.append(pg.inner_text('main')[:1800] if pg.query_selector('main') else pg.inner_text('body')[:1800])
    b.close()
open('out/productie.txt','w').write('\n'.join(L)+'\n'); print('\n'.join(L))
