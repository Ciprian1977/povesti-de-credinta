# DOAR CITIRE: verificarea sitului de producție după publicarea PR #8 (calendar oct.–dec. 2026).
# Date reale din Supabase (doar citire). OneSignal BLOCAT în browser.
import json, re, urllib.request, hashlib
from playwright.sync_api import sync_playwright

B = 'https://www.povestidecredinta.ro'
RAW = 'https://raw.githubusercontent.com/Ciprian1977/povesti-de-credinta/main/'
out, probleme = [], []
def log(s): out.append(s); print(s)
def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 verificare-pdc'}), timeout=30) as r: return r.status, r.read()
    except urllib.error.HTTPError as e: return e.code, e.read()
def norm(t): return re.sub(r'\s+', ' ', t or '').strip()

log('[1] Versiunea publicată = main')
for f, live in [('data/calendar-validat-2026-t4.json', 'data/calendar-validat-2026-t4.json?v=1'), ('js/corectura-provizorie.js', 'js/corectura-provizorie.js?v=3'),
                ('sw.js', 'sw.js'), ('js/app.js', 'js/app.js?v=20'), ('js/min/app.min.js', 'js/min/app.min.js?v=20'), ('calendar.html', 'calendar')]:
    s1, b1 = get(B + '/' + live); s2, b2 = get(RAW + f)
    ok = s1 == 200 and hashlib.sha1(b1).digest() == hashlib.sha1(b2).digest()
    log(f'    /{live}: HTTP {s1} — {"IDENTIC cu main" if ok else "DIFERIT"}')
    if not ok: probleme.append('versiune: ' + f)
V = json.loads(get(B + '/data/calendar-validat-2026-t4.json?v=1')[1])['zile']
LOCALI = [l for z in V.values() for l in z.get('locali', [])]
log(f'    fișierul publicat: {len(V)} zile, {sum(1 for z in V.values() if z["stare"]=="validat")} validate')

GRESITE = ['Optina', 'Zenaida', 'Kokkinos', 'Filonila', 'Kaluga', 'Sfânt din Sinaxarul BOR']
STATICE = ['Cuvioasa Parascheva de la Iași', 'Soborul Sfinților Arhangheli Mihail și Gavriil', 'Sfântul Apostol Andrei, Ocrotitorul României',
           'Sfântul Apostol Andrei, cel Întâi chemat', 'Sfântul Ierarh Nicolae, arhiepiscopul Mirelor Lichiei', 'Nașterea Domnului nostru Iisus Hristos (Crăciunul)']
def ctx_nou(br, mobil, zi=None, sw=False):
    opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
    c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow' if sw else 'block', **opt)
    if zi: c.add_init_script("(()=>{const T=new Date('%sT09:00:00+03:00').getTime();const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}};window.Date=F;})();" % zi)
    c.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];'))
    return c
def seo(pg):
    return pg.evaluate("""() => ({titlu: document.title, meta: [...document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')].map(m=>m.content||'').join(' | '),
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent).join(' | '), viz: document.body.innerText})""")

with sync_playwright() as p:
    br = p.chromium.launch()
    # ── 2. Calendarul lunar: 92 de zile = fișierul validat ──
    log('\n[2] Calendarul lunar (oct.–dec.), mobil și desktop')
    for mobil in (True, False):
        c = ctx_nou(br, mobil); pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
        pg.goto(B + '/calendar', wait_until='networkidle', timeout=60000); pg.wait_for_timeout(2000)
        total, dif = 0, []
        for luna in (10, 11, 12):
            if luna > 10: pg.evaluate('navigheazaCalendar(1)'); pg.wait_for_timeout(2000)
            rows = pg.evaluate("[...document.querySelectorAll('#lista-sfinti-luna .cal-rand')].map(r=>({nr:+(r.querySelector('.cal-nr')||{}).textContent, sfant:(r.querySelector('.cal-sfant')||{}).innerText||'', marcaj:(r.querySelector('.cal-marcaj')||{}).innerText||'', post:(r.querySelector('.cal-post')||{}).innerText||'', text:r.innerText}))")
            total += len(rows)
            for r in rows:
                iso = f'2026-{luna:02d}-{r["nr"]:02d}'; z = V.get(iso)
                if not z: dif.append((iso, 'lipsă în fișier')); continue
                if not norm(r['sfant']).startswith(norm(z['sfinti'])): dif.append((iso, 'sfinți', r['sfant'][:60]))
                if z.get('duminica') and norm(z['duminica']) not in norm(r['sfant']): dif.append((iso, 'duminica'))
                if norm(r['marcaj']) != norm(z.get('marcaj') or '') or r['post']: dif.append((iso, 'marcaj', r['marcaj'], r['post']))
                if 'Se publică' in r['text'] or any(g in r['text'] for g in GRESITE): dif.append((iso, 'text interzis'))
                if any(l.split(' din ')[0][-14:] in r['text'] for l in LOCALI): dif.append((iso, 'pomenire locală'))
            log(f'    {"mobil" if mobil else "desktop"} {luna:02d}: {len(rows)} zile')
        d2 = pg.evaluate("1")
        log(f'    {"mobil" if mobil else "desktop"}: total {total} zile, diferențe față de fișier: {dif[:5] or "niciuna"}, erori JS: {err or "niciuna"}')
        if total != 92 or dif or err: probleme.append(f'calendar {"mobil" if mobil else "desktop"}: {total} zile, {dif[:5]}, {err}')
        c.close()
    z2 = V['2026-12-02']; log(f'    2 decembrie: marcaj în fișier = {z2.get("marcaj")!r} (afișat: fără marcaj dacă diferențele de mai sus sunt „niciuna”)')

    # ── 3. Paginile cu sfântul zilei: azi (date reale) + alte zile (fără rând în baza de date) ──
    log('\n[3] Prima pagină, pagini dedicate, SEO (titlu, meta, OG, JSON-LD)')
    for zi in [None, '2026-10-14', '2026-11-30', '2026-12-25']:
        iso = zi or '2026-10-11'; primul = re.sub(r'^[†()\s]+', '', V[iso]['sfinti'].split(';')[0]).strip()[:28]
        c = ctx_nou(br, True, zi)
        for path in ['/', '/calendar-ortodox-azi', '/sfantul-zilei', '/sfintii-zilei', '/sinaxar', '/sinaxarul-zilei']:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
            pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(2000)
            s = seo(pg); tot = ' '.join(s.values()); pr = []
            g = [x for x in GRESITE if x in tot]
            if g: pr.append('nume din baza de date care nu sunt în calendar: ' + str(g))
            st = [x for x in STATICE if x in tot and x not in V[iso]['sfinti']]
            if st: pr.append('nume din calendarul static vechi: ' + str(st))
            if primul not in s['viz']: pr.append('numele validat nu apare în pagină')
            if path != '/sfintii-zilei' and primul not in s['titlu'] + s['meta']: pr.append('numele validat lipsește din titlu/meta')
            if re.search(r'prăznuit|"Sf\.|Sfântul zilei', s['ld']) and primul not in s['ld']: pr.append('JSON-LD fără numele validat')
            if err: pr.append('erori JS ' + str(err))
            log(f'    {iso} {path}: {"OK" if not pr else "PROBLEMĂ " + str(pr)} | titlu: {s["titlu"][:70]}')
            if pr: probleme.append(f'{iso} {path}: {pr}')
            pg.close()
        c.close()

    # ── 4. PWA + offline ──
    c = ctx_nou(br, True, sw=True); pg = c.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(4000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(2500)
    pg.goto(B + '/calendar', wait_until='networkidle'); pg.wait_for_timeout(2000)
    cache = pg.evaluate('caches.keys()')
    jc = pg.evaluate("caches.keys().then(async ks=>{for(const k of ks){const c=await caches.open(k);if(await c.match('/data/calendar-validat-2026-t4.json?v=1'))return k}return null})")
    cdp = c.new_cdp_session(pg)
    try: inst = [e.get('errorId') for e in cdp.send('Page.getInstallabilityErrors').get('installabilityErrors', [])]
    except Exception: inst = 'n/a'
    log(f'\n[4] PWA: cache {cache}; calendarul validat în cache: {jc}; erori instalare: {inst or "niciuna"}')
    if not jc or not any(k.endswith('-v20') for k in cache) or inst: probleme.append(f'PWA {cache} {jc} {inst}')
    c.set_offline(True)
    for path in ['/calendar', '/', '/calendar-ortodox-azi']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=20000); pg.wait_for_timeout(2500)
            t = pg.evaluate('document.body.innerText'); ok = bool(r) and r.status == 200 and (path != '/calendar' or V['2026-10-25']['sfinti'][:25] in t)
            log(f'    offline {path}: HTTP {r.status if r else "-"} {"OK" if ok else "PROBLEMĂ"}')
            if not ok: probleme.append('offline ' + path)
        except Exception as e:
            log(f'    offline {path}: {str(e)[:80]}'); probleme.append('offline ' + path)
    c.set_offline(False); c.close(); br.close()

log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x[:300])
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
