# DOAR CITIRE: verificare după PR #13 și #14 (12 oct.). OneSignal blocat în browser; nicio scriere.
import re
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'
out, probleme = [], []
def log(s): out.append(s); print(s)
def P(x): probleme.append(x); log('    PROBLEMĂ: ' + x)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
RAU = re.compile(r'Kaluga|Optina|dezlegare|culoare(a)? (liturgic|alb|verde|roș)', re.I)
with sync_playwright() as p:
    br = p.chromium.launch()
    for mobil in (True, False):
        opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
        c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block', **opt); c.route(re.compile(r'onesignal\.com'), OS)
        log(f'[{"mobil" if mobil else "desktop"}]')
        for path in ['/', '/sinaxar', '/sinaxarul-zilei', '/sfintii-zilei', '/predica-zilei', '/evanghelia-zilei', '/apostolul-zilei', '/sfantul-zilei', '/calendar']:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(3000)
            t = pg.evaluate('document.body.innerText'); v = pg.evaluate("[...document.scripts].map(s=>s.src).filter(s=>s.includes('corectura')).map(s=>s.split('?')[1])")
            sin = 'Tarah' in t and ('Andronic și Prov' in t or 'tovarășii' in t)
            rau = RAU.search(t)
            log(f'    {path}: HTTP {r.status} {v} sinaxar_text={sin} lectura1914={"Biblia 1914" in t and "nu este disponibil momentan" not in t if path in ("/evanghelia-zilei","/apostolul-zilei") else None} interzis={rau.group(0) if rau else None} erori={err}')
            if r.status != 200 or err or rau or (v and v != ['v=7']): P(path)
            if path in ('/sinaxar', '/sinaxarul-zilei') and not sin: P(path + ' fără textul sinaxarului')
            pg.close()
        c.close()
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow'); c.route(re.compile(r'onesignal\.com'), OS)
    pg = c.new_page(); pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(5000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(3000)
    for path in ['/evanghelia-zilei', '/sinaxar']: pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(2500)
    chei = pg.evaluate('caches.keys()'); log(f'\n[PWA] cache-uri: {chei}')
    if not any(k.endswith('-v24') for k in chei): P('cache nu e v24')
    c.set_offline(True)
    for path in ['/', '/evanghelia-zilei', '/sinaxar']:
        r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(2500); t = pg.evaluate('document.body.innerText')
        ok = r and r.status == 200 and len(t) > 300; log(f'    offline {path}: {"OK" if ok else "PROBLEMĂ"}'); ok or P('offline ' + path)
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x)
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
