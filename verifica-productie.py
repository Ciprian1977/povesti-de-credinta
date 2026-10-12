# DOAR CITIRE: ce vede acum un telefon nou pe paginile cu sinaxarul + rândul din baza de date pentru azi. Nicio scriere.
import re, json, urllib.request
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'; out = []
def log(s): out.append(str(s)); print(s)
html = urllib.request.urlopen(B + '/js/min/app.min.js?v=21', timeout=30).read().decode()
K = re.search(r'SUPABASE_ANON_KEY="([^"]+)"', html).group(1)
q = 'https://smuqpipxeotkbttolivp.supabase.co/rest/v1/zile_ortodoxe?select=data_calendaristica,sfant_nume,sinaxar,sfant_viata,predica&data_calendaristica=eq.2026-10-12'
r = json.load(urllib.request.urlopen(urllib.request.Request(q, headers={'apikey': K, 'Authorization': 'Bearer ' + K}), timeout=30))
for row in r: log('DB sinaxar: ' + (row['sinaxar'] or 'NULL')[:300].replace('\n', ' ')); log('DB viata: ' + (row['sfant_viata'] or 'NULL')[:200])
json.dump(r, open('out/rand-12.json', 'w'), ensure_ascii=False, indent=1)
OS = lambda rt, *_: rt.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
with sync_playwright() as p:
    br = p.chromium.launch()
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow')
    c.route(re.compile(r'onesignal\.com'), OS)
    pg = c.new_page(); cons = []; pg.on('console', lambda m: cons.append(m.text[:200]))
    for path in ['/sinaxarul-zilei', '/sinaxar', '/', '/sinaxarul-zilei']:
        pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(4000)
        v = pg.evaluate("(document.getElementById('viata-titlu')||{}).innerText + ' || ' + ((document.getElementById('viata-text')||{}).innerText||'').slice(0,160)")
        s = pg.evaluate("[...document.scripts].map(x=>x.src.split('/').pop()).filter(x=>/corectura|app|loader/.test(x))")
        log(f'{path}: {s} | {v}')
    log('consola: ' + ' | '.join(cons[-8:]))
    br.close()
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
