# DOAR CITIRE: verificare după PR #15 (paginile Sinaxar). OneSignal blocat; nicio scriere.
import re
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'; out, probleme = [], []
def log(s): out.append(s); print(s)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
with sync_playwright() as p:
    br = p.chromium.launch()
    for mobil in (True, False):
        opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
        c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block', **opt); c.route(re.compile(r'onesignal\.com'), OS)
        for path in ['/sinaxar', '/sinaxarul-zilei', '/', '/sfantul-zilei']:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(3000)
            t = pg.evaluate('document.body.innerText'); lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            ok_text = 'Tarah' in t and 'nu este disponibilă momentan pe această pagină' not in t
            rau = re.search(r'Kaluga|Optina|dezlegare', t)
            log(f'{"mobil" if mobil else "desktop"} {path}: HTTP {r.status} text={ok_text} interzis={rau.group(0) if rau else None} erori={err} depasire={lat}')
            if r.status != 200 or err or lat or rau or (path.startswith('/sinaxar') and not ok_text): probleme.append(path)
            pg.close()
        c.close()
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME " + str(probleme)}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
