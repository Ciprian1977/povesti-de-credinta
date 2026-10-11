# DOAR CITIRE: verificarea funcțiilor esențiale pe situl de producție. OneSignal blocat; nicio scriere.
import re, json
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'
out, probleme = [], []
def log(s): out.append(s); print(s)
PAGINI = ['/', '/calendar', '/calendar-ortodox-azi', '/sfantul-zilei', '/rugaciuni', '/rugaciuni/tatal-nostru', '/rugaciunea-zilei', '/rugaciunea-zilei/luni',
          '/acatiste', '/acatiste/sfantul-nicolae', '/evanghelia-zilei', '/apostolul-zilei', '/predica-zilei', '/setari-notificari', '/posturi', '/faq']
with sync_playwright() as p:
    br = p.chromium.launch()
    for mobil in (True, False):
        opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
        c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block', **opt)
        c.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];'))
        for path in PAGINI:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(1500)
            t = pg.evaluate('document.body.innerText'); lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            gol = len(t.strip()) < 300; incarca = len(re.findall(r'Se încarcă', t))
            ok = r.status == 200 and not err and not lat and not gol and incarca == 0
            log(f'    {"mobil  " if mobil else "desktop"} {path}: HTTP {r.status} {"OK" if ok else "PROBLEMĂ"}{" erori=" + str(err) if err else ""}{" depășire" if lat else ""}{" pagină goală" if gol else ""}{f" „Se încarcă” rămas x{incarca}" if incarca else ""}')
            if not ok: probleme.append(f'{"mobil" if mobil else "desktop"} {path}: {err} lat={lat} gol={gol} incarca={incarca}')
            pg.close()
        c.close()
    # rugăciunea afișată efectiv
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', service_workers='block'); pg = c.new_page()
    pg.goto(B + '/rugaciuni/tatal-nostru', wait_until='networkidle'); t = pg.evaluate('document.body.innerText')
    log(f'\n    Tatăl nostru: text prezent = {"Tatăl nostru, Care ești în ceruri" in t}')
    if 'Care ești în ceruri' not in t: probleme.append('textul rugăciunii lipsește')
    pg.goto(B + '/pagina-inexistenta-xyz'); log(f'    404: {pg.evaluate("document.title")[:40]}')
    c.close()
    # PWA offline
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', service_workers='allow'); pg = c.new_page()
    c.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(4000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(2000)
    for path in ['/calendar', '/rugaciuni']: pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1000)
    c.set_offline(True)
    for path in ['/', '/calendar', '/rugaciuni']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(1500)
            ok = r and r.status == 200 and len(pg.evaluate('document.body.innerText')) > 300
            log(f'    offline {path}: {"OK" if ok else "PROBLEMĂ"}')
            if not ok: probleme.append('offline ' + path)
        except Exception as e: log(f'    offline {path}: {str(e)[:60]}'); probleme.append('offline ' + path)
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x)
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
