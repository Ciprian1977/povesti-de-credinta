# DOAR CITIRE: verificare după PR #17 (rugăciunile dimineții). Nicio scriere.
import re
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'; out, probleme = [], []
def log(s): out.append(s); print(s)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
with sync_playwright() as p:
    br = p.chromium.launch()
    for mobil in (True, False):
        opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
        c = br.new_context(locale='ro-RO', service_workers='block', **opt); c.route(re.compile(r'onesignal\.com'), OS)
        for path in ['/rugaciuni/rugaciunea-diminetii', '/rugaciuni-diminetii', '/rugaciuni']:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(1500); t = pg.evaluate('document.body.innerText')
            lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            ok = r.status == 200 and not err and not lat and (path == '/rugaciuni' or all(x in t for x in ['Miluiește-mă, Dumnezeule, după mare mila Ta', 'Cred întru Unul Dumnezeu', 'Rugăciunea a zecea', 'Cuvine-se cu adevărat'])) and 'Doxologia' not in t
            log(f'{"mobil" if mobil else "desktop"} {path}: HTTP {r.status} ok={ok} erori={err} depășire={lat}'); ok or probleme.append(path)
            pg.close()
        c.close()
    br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(probleme)}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
