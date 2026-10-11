# DOAR CITIRE: verificare după publicarea PR #10 pe producție. OneSignal blocat; nicio scriere.
import re
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'
out, probleme = [], []
def log(s): out.append(s); print(s)
def P(x): probleme.append(x); log('    PROBLEMĂ: ' + x)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
SFINTI = ['/', '/sfantul-zilei', '/sfintii-zilei', '/sinaxar', '/sinaxarul-zilei', '/calendar-ortodox-azi', '/predica-zilei', '/calendar']
with sync_playwright() as p:
    br = p.chromium.launch()
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
    c.route(re.compile(r'onesignal\.com'), OS)
    log('[1] Paginile despre sfinți (azi, 11 oct.)')
    for path in SFINTI:
        pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
        r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(2000)
        t = pg.evaluate("""() => document.title + ' ' + [...document.querySelectorAll('meta')].map(m=>m.content||'').join(' ') + ' ' +
            [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent).join(' ') + ' ' + document.body.innerText""")
        v = pg.evaluate("[...document.scripts].map(s=>s.src).filter(s=>s.includes('corectura'))")
        lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
        rau = [w for w in ['Optina', 'Lev de la', 'Zenaida', 'Kokkinos'] if w in t]
        filip = 'Filip' in t
        log(f'    {path}: HTTP {r.status} corectura={[x.split("?")[-1] for x in v]} filip={filip} interzise={rau} erori={err} depasire={lat}')
        if r.status != 200 or rau or err or lat or not filip or (v and not all('v=4' in x for x in v)): P(path)
        if path == '/predica-zilei': log(f'      predica prezentă: {"nu este disponibil" not in pg.evaluate("document.body.innerText")[:6000] or "?"}')
        pg.close()
    log('\n[2] Posturi')
    pg = c.new_page(); pg.goto(B + '/posturi', wait_until='networkidle'); t = pg.evaluate('document.body.innerText') + pg.content()
    for ok in ['Sâmbăta Mare', '21–23 și 28–30 noiembrie', '20–24 decembrie: fără dezlegare la pește', 'după calendarul bisericesc']:
        log(f'    /posturi conține „{ok}”: {ok in t}');  (ok in t) or P('/posturi lipsă ' + ok)
    for rau in ['Sâmbăta lui Lazăr', 'Marți, joi: dezlegare', 'Săptămâna Brânzei']:
        log(f'    /posturi NU conține „{rau}”: {rau not in t}');  (rau not in t) or P('/posturi încă ' + rau)
    pg.goto(B + '/posturi/postul-sfintilor-apostoli-petru-si-pavel-2026', wait_until='networkidle'); t = pg.evaluate('document.body.innerText') + pg.content()
    for ok in ['duminică, 28 iunie 2026']:
        log(f'    Postul Apostolilor conține „{ok}”: {ok in t}'); (ok in t) or P('apostoli lipsă ' + ok)
    for rau in ['sâmbătă, 28 iunie', 'Tabel Complet', 'Lunea, miercurea și vinerea sunt interzise']:
        log(f'    Postul Apostolilor NU conține „{rau}”: {rau not in t}'); (rau not in t) or P('apostoli încă ' + rau)
    c.close()
    log('\n[3] PWA: actualizare v20 -> v21 și offline')
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow')
    c.route(re.compile(r'onesignal\.com'), OS)
    pg = c.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(5000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(3000)
    for path in ['/calendar', '/rugaciuni', '/sfantul-zilei', '/posturi']: pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1000)
    chei = pg.evaluate('caches.keys()'); log(f'    cache-uri: {chei}')
    if not any(k.endswith('-v21') for k in chei) or any(k.endswith('-v20') for k in chei): P('cache nu e v21')
    c.set_offline(True)
    for path in ['/', '/calendar', '/rugaciuni', '/sfantul-zilei']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(1500)
            t = pg.evaluate('document.body.innerText'); ok = r and r.status == 200 and len(t) > 300 and 'Optina' not in t
            log(f'    offline {path}: {"OK" if ok else "PROBLEMĂ"}'); ok or P('offline ' + path)
        except Exception as e: P(f'offline {path}: {str(e)[:60]}')
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x)
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
