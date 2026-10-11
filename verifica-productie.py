# DOAR CITIRE: verificarea sitului de producție după publicarea PR #5.
# Deschide paginile reale ca un vizitator (mobil + desktop), cu datele reale din Supabase (doar citire).
# OneSignal este BLOCAT complet în browser: nicio abonare, niciun tag, nicio notificare.
import json, re, sys, urllib.request, hashlib
from playwright.sync_api import sync_playwright

B = 'https://www.povestidecredinta.ro'
RAW = 'https://raw.githubusercontent.com/Ciprian1977/povesti-de-credinta/main/'
SB = 'https://smuqpipxeotkbttolivp.supabase.co'
K = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'  # cheia publică din sit
out = []
def log(s): out.append(s); print(s)
def get(url, hdr=None):
    rq = urllib.request.Request(url, headers=hdr or {'User-Agent': 'Mozilla/5.0 verificare-pdc'})
    try:
        with urllib.request.urlopen(rq, timeout=30) as r: return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e: return e.code, e.read(), dict(e.headers)

INTERZIS = {
    'eticheta post': re.compile(r'Zi de post|Dezlegare|Post negru|post aspru|Har[țt]i\b|Post \(|Este post', re.I),
    'cuvant de folos': re.compile(r'Cuv[âa]nt(ul)? de folos', re.I),
    'text complet': re.compile(r'textul complet|text integral', re.I),
    'afirmatie de rezerva': re.compile(r'după Heruvic', re.I),
}
PAGINI = ['/', '/sfintii-zilei', '/rugaciunea-zilei', '/apostolul-zilei', '/evanghelia-zilei', '/calendar-ortodox-azi',
          '/sfantul-zilei', '/sinaxarul-zilei', '/sinaxar', '/predica-zilei', '/calendar', '/setari-notificari', '/rugaciuni/tatal-nostru']
ZILE = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica']
probleme = []

# ── 1. Versiunea publicată = main ─────────────────────────────
log('[1] Versiunea publicată pe www.povestidecredinta.ro')
for f in ['sw.js', 'js/app.js', 'js/min/app.min.js', 'js/corectura-provizorie.js', 'js/supabase-loader.js', 'index.html']:
    s1, b1, _ = get(B + '/' + f); s2, b2, _ = get(RAW + f)
    if f == 'index.html': s1, b1, _ = get(B + '/')
    ok = s1 == 200 and hashlib.sha1(b1).hexdigest() == hashlib.sha1(b2).hexdigest()
    log(f'    /{f}: HTTP {s1} — {"IDENTIC cu main" if ok else "DIFERIT de main"}')
    if not ok: probleme.append(f'versiune diferită: {f}')

# ── 2. Date reale de azi (Supabase, doar citire) ─────────────
st, b, _ = get(f'{SB}/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-11&select=apostol_carte,apostol_versete,evanghelie_carte,evanghelie_versete,sfant_nume',
               {'apikey': K, 'Authorization': 'Bearer ' + K})
zi = (json.loads(b) or [{}])[0] if st == 200 else {}
ref_ap = f"{zi.get('apostol_carte','')} {zi.get('apostol_versete','')}".strip()
ref_ev = f"{zi.get('evanghelie_carte','')} {zi.get('evanghelie_versete','')}".strip()
log(f'\n[2] Date din baza de date pentru azi: Apostol „{ref_ap}”, Evanghelie „{ref_ev}”')
sd, _, _ = get('https://doxologia.ro/11-octombrie')
log(f'    linkul oficial https://doxologia.ro/11-octombrie: HTTP {sd}')
if sd != 200: probleme.append('linkul doxologia nu răspunde 200')

def deschide(b, mobil, sw=False):
    opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
    ctx = b.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow' if sw else 'block', **opt)
    ctx.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];'))
    return ctx

with sync_playwright() as p:
    br = p.chromium.launch()
    # ── 3. Pagini (mobil + desktop) ──────────────────────────
    log('\n[3] Pagini: texte interzise vizibile / în meta / în JSON-LD, erori JS, depășire orizontală')
    for mobil in (True, False):
        ctx = deschide(br, mobil)
        for path in PAGINI + [f'/rugaciunea-zilei/{z}' for z in ZILE]:
            pg = ctx.new_page(); err = []
            pg.on('pageerror', lambda e: err.append(str(e)[:120]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(1500)
            vizibil = pg.evaluate('document.body.innerText')
            meta = pg.evaluate("[...document.querySelectorAll('meta[name=description],meta[property^=og],title')].map(e=>e.content||e.textContent).join(' ')")
            jsonld = pg.evaluate("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(e=>e.textContent).join(' ')")
            g = {k: sorted(set(rx.findall(vizibil + ' ' + meta + ' ' + jsonld)))[:3] for k, rx in INTERZIS.items() if rx.search(vizibil + ' ' + meta + ' ' + jsonld)}
            lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            extra = ''
            if path in ('/apostolul-zilei', '/evanghelia-zilei', '/'):
                linkuri = pg.evaluate("[...document.querySelectorAll('a[href*=\"doxologia.ro\"]')].map(a=>a.href)")
                ref = ref_ap if path == '/apostolul-zilei' else ref_ev
                are_ref = bool(ref) and ref.replace(' ', '') in vizibil.replace(' ', '')
                extra = f' | referință „{ref}” afișată: {"DA" if are_ref else "NU"} | linkuri doxologia: {sorted(set(linkuri))}'
                if path != '/' and not are_ref: probleme.append(f'{path}: referința nu apare')
                if not linkuri: probleme.append(f'{path}: lipsește linkul doxologia')
            if path.startswith('/rugaciunea-zilei/'):
                extra = f' | titlu: {pg.title()[:70]} | h1: {pg.evaluate("(document.querySelector(\"h1\")||{}).innerText||\"\"")[:60]}'
            if path == '/calendar':
                extra = f' | zile în grilă: {pg.evaluate("document.querySelectorAll(\"[class*=zi], td\").length")} | legenda post: {"DA" if re.search("legend", pg.content(), re.I) and re.search(r"post", pg.evaluate("(document.querySelector(\"[class*=legend]\")||{}).innerText||\"\""), re.I) else "nu"}'
            stare = 'OK' if (r and r.status == 200 and not g and not err and not lat) else 'PROBLEMĂ'
            if stare != 'OK': probleme.append(f'{"mobil" if mobil else "desktop"} {path}: HTTP {r.status if r else "-"} interzis={g} erori={err} depasire={lat}')
            log(f'    {"mobil  " if mobil else "desktop"} {path}: HTTP {r.status if r else "-"} {stare}{" interzis=" + json.dumps(g, ensure_ascii=False) if g else ""}{" erori_js=" + str(err) if err else ""}{" DEPĂȘIRE" if lat else ""}{extra}')
            pg.close()
        ctx.close()

    # ── 4. Navigare mobilă (meniu) ───────────────────────────
    ctx = deschide(br, True); pg = ctx.new_page(); pg.goto(B + '/', wait_until='networkidle')
    try:
        pg.locator('#buton-meniu').click(); pg.wait_for_timeout(600)
        linkuri = pg.evaluate("[...document.querySelectorAll('nav a, .meniu a, #meniu a')].filter(a=>a.offsetParent!==null).map(a=>a.getAttribute('href'))")
        log(f'\n[4] Meniu mobil: deschis, {len(linkuri)} linkuri vizibile')
        rupte = []
        for h in sorted(set(x for x in linkuri if x and x.startswith('/')))[:40]:
            s, _, _ = get(B + h)
            if s != 200: rupte.append(f'{h}={s}')
        log(f'    linkuri din meniu verificate: {len(set(linkuri))}, rupte: {rupte or "niciunul"}')
        if rupte: probleme.append(f'linkuri rupte în meniu: {rupte}')
    except Exception as e:
        log(f'\n[4] Meniu mobil: eroare {str(e)[:150]}'); probleme.append('meniul mobil nu s-a putut deschide')
    ctx.close()

    # ── 5. 404 ───────────────────────────────────────────────
    s404, b404, _ = get(B + '/pagina-care-nu-exista-pdc-123')
    t404 = re.search(rb'<title>([^<]*)', b404)
    log(f'\n[5] Pagina 404: HTTP {s404}, titlu: {t404.group(1).decode()[:80] if t404 else "-"}')
    if s404 != 404: probleme.append('404 nu întoarce 404')

    # ── 6. PWA + offline ─────────────────────────────────────
    ctx = deschide(br, True, sw=True); pg = ctx.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(4000)
    pg.reload(wait_until='networkidle'); pg.wait_for_timeout(3000)
    sw = pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>(x.active&&x.active.scriptURL)+' scope='+x.scope))")
    cache = pg.evaluate("caches.keys()")
    corectura = pg.evaluate("caches.keys().then(async ks=>{for(const k of ks){const c=await caches.open(k);if(await c.match('/js/corectura-provizorie.js?v=1'))return k}return null})")
    cdp = ctx.new_cdp_session(pg)
    try: inst = [e.get('errorId') for e in cdp.send('Page.getInstallabilityErrors').get('installabilityErrors', [])]
    except Exception as e: inst = 'n/a'
    sm, bm, _ = get(B + '/manifest.json')
    log(f'\n[6] PWA: manifest HTTP {sm}; service worker: {sw}; cache: {cache}; scriptul de corectură în cache: {corectura}; erori de instalabilitate: {inst or "niciuna"}')
    if not corectura: probleme.append('scriptul de corectură nu e în cache-ul PWA')
    ctx.set_offline(True)
    for path in ['/', '/calendar', '/pagina-offline-test']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=20000); pg.wait_for_timeout(800)
            t = pg.evaluate('document.body.innerText')
            g = {k: 1 for k, rx in INTERZIS.items() if rx.search(t)}
            log(f'    offline {path}: încărcată ({pg.title()[:50]}){" interzis=" + str(list(g)) if g else ""}')
            if g: probleme.append(f'offline {path}: {list(g)}')
        except Exception as e:
            log(f'    offline {path}: {str(e)[:100]}')
    ctx.set_offline(False); ctx.close()

    # ── 7. Setări notificări (OneSignal blocat; permisiunea simulată) ─
    ctx = deschide(br, True)
    ctx.add_init_script("function FN(){};Object.defineProperty(FN,'permission',{get:()=> 'granted'});FN.requestPermission=()=>Promise.resolve('granted');window.Notification=FN;")
    pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
    pg.goto(B + '/setari-notificari', wait_until='networkidle'); pg.wait_for_timeout(1000)
    pg.locator('#toggle-dimineata').dispatch_event('click'); pg.wait_for_timeout(800)
    pg.goto(B + '/setari-notificari', wait_until='networkidle'); pg.wait_for_timeout(1500)
    log(f'\n[7] Setări notificări (fără OneSignal real): comutatorul rămâne pornit după revenire: {pg.eval_on_selector("#toggle-dimineata", "e=>e.checked")}; erori JS: {err or "niciuna"}')
    ctx.close(); br.close()

log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x)
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
