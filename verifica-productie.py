# DOAR CITIRE: verifică rugăciunile de seară (PR #18) în producție. OneSignal și analytics blocate. Nicio scriere.
import os
from playwright.sync_api import sync_playwright
B = 'https://povestidecredinta.ro'
SEARA = ['/rugaciuni/rugaciunea-serii', '/rugaciuni-serii']
TREBUIE = ['Rugăciunea întâia a Sfântului Macarie', 'Ioan Damaschin', 'Să se scoale Dumnezeu', 'În mâinile Tale, Doamne Iisuse Hristoase']
NU = ['Lumină veșnică', 'Gândul I', 'Doxologia']
ALTE = ['/rugaciuni', '/rugaciuni/rugaciunea-diminetii', '/']
os.makedirs('out', exist_ok=True); L = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for nume, vp, mob in [('mobil', {'width': 390, 'height': 844}, True), ('desktop', {'width': 1366, 'height': 900}, False)]:
        c = b.new_context(viewport=vp, is_mobile=mob, locale='ro-RO', service_workers='block')
        c.route('**/*', lambda r: r.abort() if any(x in r.request.url for x in ['onesignal', 'googletagmanager', 'google-analytics', '/_vercel/insights']) else r.continue_())
        for path in SEARA + ALTE:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:100]))
            r = pg.goto(B + path + '?v=' + str(os.getpid()), wait_until='networkidle'); pg.wait_for_timeout(1500)
            t = pg.evaluate("() => document.body.innerText + ' ' + [...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>s.textContent).join(' ')")
            lat = pg.evaluate('() => document.documentElement.scrollWidth > window.innerWidth + 1')
            pr = []
            if r.status != 200: pr.append(f'HTTP {r.status}')
            if err: pr.append('erori JS ' + str(err))
            if lat: pr.append('depășire lățime')
            if path in SEARA:
                pr += [f'lipsește „{x}”' for x in TREBUIE if x not in t]
                pr += [f'apare „{x}”' for x in NU if x in t]
            if path == '/rugaciuni/rugaciunea-diminetii' and 'Crezul' not in t and 'Cred întru unul' not in t: pr.append('dimineața fără Crez')
            L.append(f"{nume} {path}: {'OK' if not pr else pr} ({len(t)} car.)")
            pg.close()
        c.close()
    b.close()
open('out/productie.txt', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
