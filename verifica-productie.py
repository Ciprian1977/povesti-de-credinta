# DOAR CITIRE: verificare după publicarea PR #12 (lecturi din Biblia 1914). OneSignal blocat; nicio scriere.
import re
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'
out, probleme = [], []
def log(s): out.append(s); print(s)
def P(x): probleme.append(x); log('    PROBLEMĂ: ' + x)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
TEXT = {'/evanghelia-zilei': 'una a căzut lângă cale', '/apostolul-zilei': 'Știind că nu se îndreptează omul'}
PAGINI = ['/', '/evanghelia-zilei', '/apostolul-zilei', '/calendar-ortodox-azi', '/sfantul-zilei', '/sfintii-zilei', '/predica-zilei', '/calendar', '/rugaciuni', '/rugaciunea-zilei', '/setari-notificari', '/posturi']
with sync_playwright() as p:
    br = p.chromium.launch()
    for mobil in (True, False):
        opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
        c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block', **opt); c.route(re.compile(r'onesignal\.com'), OS)
        log(f'[{"mobil" if mobil else "desktop"}]')
        for path in PAGINI:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(2500)
            t = pg.evaluate('document.body.innerText')
            src = pg.evaluate("[...document.scripts].map(s=>s.src).filter(s=>/corectura|app/.test(s)).map(s=>s.split('/').pop())")
            dox = pg.locator('.lectura-sursa a[href*="doxologia"]').count()
            lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            ok_text = TEXT[path] in t if path in TEXT else None
            log(f'    {path}: HTTP {r.status} scripturi={src} text1914={ok_text} link_doxologia={dox} optina={"Optina" in t} erori={err} depasire={lat}')
            if r.status != 200 or err or lat or dox or 'Optina' in t or ok_text is False or any('corectura' in s and 'v=6' not in s for s in src): P(path)
            pg.close()
        c.close()
    log('\n[PWA v23 și offline]')
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow'); c.route(re.compile(r'onesignal\.com'), OS)
    pg = c.new_page(); pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(5000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(3000)
    for path in ['/evanghelia-zilei', '/apostolul-zilei', '/calendar', '/rugaciuni']: pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(2500)
    chei = pg.evaluate('caches.keys()'); log(f'    cache-uri: {chei}')
    if not any(k.endswith('-v23') for k in chei) or any(k.endswith('-v22') for k in chei): P('cache nu e v23')
    c.set_offline(True)
    for path in ['/', '/evanghelia-zilei', '/apostolul-zilei', '/calendar', '/rugaciuni']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(2500)
            t = pg.evaluate('document.body.innerText'); ok = r and r.status == 200 and len(t) > 300 and (TEXT[path] in t if path in TEXT else True)
            log(f'    offline {path}: {"OK" if ok else "PROBLEMĂ"}'); ok or P('offline ' + path)
        except Exception as e: P(f'offline {path}: {str(e)[:60]}')
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x)
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
