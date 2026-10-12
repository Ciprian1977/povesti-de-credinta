# DOAR CITIRE: verificare după PR #16. OneSignal blocat; nicio scriere pe site.
import re, json
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'; out, probleme = [], []
def log(s): out.append(str(s)); print(s)
OS = lambda r, *_: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];')
def sinaxar_ok(t): return 'tovarășii săi' in t and 'nu este disponibil' not in t.split('Troparul')[0]
with sync_playwright() as p:
    br = p.chromium.launch()
    # A. telefon nou, cu aplicația (service worker) activă
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow'); c.route(re.compile(r'onesignal\.com'), OS)
    pg = c.new_page(); pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(5000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(3000)
    for path in ['/', '/sinaxar', '/sinaxarul-zilei', '/evanghelia-zilei', '/apostolul-zilei']:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(4000); t = pg.evaluate('document.body.innerText')
        v = pg.evaluate("[...document.scripts].map(s=>s.src).filter(s=>s.includes('corectura')).map(s=>s.split('?')[1])")
        ok = ('Biblia 1914' in t and 'nu este disponibil momentan' not in t) if 'zilei' in path and ('evangh' in path or 'apostol' in path) else sinaxar_ok(t)
        log(f'A telefon nou {path}: {v} ok={ok}'); ok or probleme.append('A ' + path)
    chei = pg.evaluate('caches.keys()'); log(f'A cache: {chei}'); any(k.endswith('-v25') for k in chei) or probleme.append('cache v25')
    c.set_offline(True)
    for path in ['/', '/evanghelia-zilei', '/sinaxar']:
        r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(2500); ok = r and r.status == 200 and len(pg.evaluate('document.body.innerText')) > 300
        log(f'A offline {path}: {ok}'); ok or probleme.append('offline ' + path)
    c.close()
    # B. telefonul lui Ciprian: memoria zilei salvată dimineața, cu sinaxarul ascuns, fără marcaj de versiune
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block'); c.route(re.compile(r'onesignal\.com'), OS)
    c.add_init_script("""if(!sessionStorage.getItem('pus')){sessionStorage.setItem('pus','1');localStorage.removeItem('pdc_corectura_v');
      localStorage.setItem('pdc_cache_v5',JSON.stringify({data:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest'}).format(new Date()),rows:[{data_calendaristica:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest'}).format(new Date()),sfant_nume:'Sf. Mc. Prov, Tarah și Andronic',sinaxar:'Sinaxarul zilei nu este disponibil momentan.'}]}));}""")
    pg = c.new_page(); pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(4000); t = pg.evaluate('document.body.innerText')
    ok = 'tovarășii săi' in t and 'Sinaxarul zilei nu este disponibil' not in t
    log(f'B telefon cu memorie veche, prima pagină: ok={ok}'); ok or probleme.append('B /')
    c.close(); br.close()
log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME " + str(probleme)}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
