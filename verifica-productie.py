# DOAR CITIRE: verificarea sitului de producție după publicarea PR #7.
# Pagini reale (mobil + desktop), date reale din Supabase (doar citire). OneSignal BLOCAT în browser.
import json, re, urllib.request, hashlib
from playwright.sync_api import sync_playwright

B = 'https://www.povestidecredinta.ro'
RAW = 'https://raw.githubusercontent.com/Ciprian1977/povesti-de-credinta/main/'
SB = 'https://smuqpipxeotkbttolivp.supabase.co'
K = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'
out, probleme = [], []
def log(s): out.append(s); print(s)
def get(url, hdr=None):
    rq = urllib.request.Request(url, headers=hdr or {'User-Agent': 'Mozilla/5.0 verificare-pdc'})
    try:
        with urllib.request.urlopen(rq, timeout=30) as r: return r.status, r.read()
    except urllib.error.HTTPError as e: return e.code, e.read()

INTERZIS = {
    'tâlcuire completă': re.compile(r'Tâlcuire Completă|tâlcuirea completă'),
    'text integral Evanghelie': re.compile(r'[Tt]extul integral al Evangheliei(?! zilei îl puteți citi)|Evanghelia zilei — Textul integral'),
    'text complet lecturi': re.compile(r'cu textul complet'),
    'tip post / culoare liturgică': re.compile(r'tipul de post|culoarea liturgic|[Aa]lb liturgic'),
    'sfânt inventat': re.compile(r'Sfânt din Sinaxarul BOR'),
    'promisiune post zilnic': re.compile(r'afișăm zilnic dacă este post'),
    'tâlcuire patristică': re.compile(r'[Tt]âlcuire patristică|[Tt]âlcuirea patristică a Evangheliei|Tâlcuirea Evangheliei și Cuvântul de Folos|pregătite zilnic de echipa'),
    'Cuvant de folos (meniu)': re.compile(r'Cuvant de folos'),
    'date greșite 2026': re.compile(r'19 aprilie|2 martie|15 iunie – 28 iunie'),
    'etichetă de post pe zi': re.compile(r'Zi de post|Dezlegare la (toate|pește)|Post negru|Post aspru'),
    'alerte post active': re.compile(r'Te anunțăm când începe un post'),
    'atribuire „sursă oficială”': re.compile(r'(linkul|link) către textul oficial|textul oficial de pe|sursa oficială|referința și textul oficial|linkul oficial'),
    'va fi disponibil în curând': re.compile(r'va fi disponibil(ă)? în curând'),
}
PAGINI = ['/', '/calendar-ortodox-azi', '/setari-notificari', '/sfintii-zilei', '/rugaciunea-zilei', '/rugaciunea-zilei/miercuri',
          '/rugaciunea-zilei/vineri', '/apostolul-zilei', '/evanghelia-zilei', '/predica-zilei', '/sfantul-zilei', '/sinaxar',
          '/sinaxarul-zilei', '/calendar', '/faq']

# ── 1. Versiunea publicată = main ──
log('[1] Versiunea publicată pe www.povestidecredinta.ro')
for f in ['sw.js', 'js/app.js', 'js/min/app.min.js', 'js/corectura-provizorie.js', 'js/min/rugaciuni-saptamana.min.js', 'faq.html', 'calendar-ortodox-azi/index.html', 'setari-notificari/index.html']:
    live = B + '/' + (f.replace('/index.html', '').replace('.html', '') if f.endswith('.html') else f)
    s1, b1 = get(live); s2, b2 = get(RAW + f)
    ok = s1 == 200 and hashlib.sha1(b1).digest() == hashlib.sha1(b2).digest()
    log(f'    /{f}: HTTP {s1} — {"IDENTIC cu main" if ok else "DIFERIT de main"}')
    if not ok: probleme.append(f'versiune diferită: {f}')

st, b = get(f'{SB}/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-11&select=sfant_nume,apostol_carte,apostol_versete,evanghelie_carte,evanghelie_versete',
            {'apikey': K, 'Authorization': 'Bearer ' + K})
zi = (json.loads(b) or [{}])[0] if st == 200 else {}
ref_ap = f"{zi.get('apostol_carte','')} {zi.get('apostol_versete','')}".strip(); ref_ev = f"{zi.get('evanghelie_carte','')} {zi.get('evanghelie_versete','')}".strip()
log(f'\n[2] Date reale azi: sfinți „{zi.get("sfant_nume","")[:70]}”, Apostol „{ref_ap}”, Evanghelie „{ref_ev}”')

def ctx_nou(br, mobil, sw=False):
    opt = dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True) if mobil else dict(viewport={'width': 1280, 'height': 900})
    c = br.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow' if sw else 'block', **opt)
    c.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body='window.OneSignalDeferred=window.OneSignalDeferred||[];'))
    return c
def ascunse(pg):
    return pg.evaluate("""() => [document.title,...[...document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')].map(m=>m.content||''),
      ...[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent)].join(' \\n ')""")

with sync_playwright() as p:
    br = p.chromium.launch()
    log('\n[3] Pagini (mobil + desktop): promisiuni false în text / titlu / meta / OG / JSON-LD, erori JS, depășire')
    for mobil in (True, False):
        c = ctx_nou(br, mobil)
        for path in PAGINI:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
            r = pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(1500)
            t = pg.evaluate('document.body.innerText') + ' \n ' + ascunse(pg)
            g = {k: sorted(set(map(str, rx.findall(t))))[:2] for k, rx in INTERZIS.items() if rx.search(t) and not (k == 'etichetă de post pe zi' and path == '/faq')}
            lat = pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2')
            ok = r and r.status == 200 and not g and not err and not lat
            if not ok: probleme.append(f'{"mobil" if mobil else "desktop"} {path}: HTTP {r.status if r else "-"} {g} {err} depasire={lat}')
            log(f'    {"mobil  " if mobil else "desktop"} {path}: HTTP {r.status if r else "-"} {"OK" if ok else "PROBLEMĂ " + json.dumps(g, ensure_ascii=False) + str(err)}')
            pg.close()
        c.close()

    c = ctx_nou(br, True); pg = c.new_page()
    # ── 4. Calendar azi, sfântul zilei, cardul Evangheliei ──
    pg.goto(B + '/calendar-ortodox-azi', wait_until='networkidle'); pg.wait_for_timeout(1500)
    ca = {'erou': pg.inner_text('#sfant-azi'), 'apostol': pg.inner_text('#apostol-card'), 'evanghelie': pg.inner_text('#ev-card'),
          'insigna_culoare': pg.locator('#culoare-badge').count(), 'meta': pg.get_attribute('meta[name=description]', 'content')}
    log(f'\n[4] /calendar-ortodox-azi: {json.dumps(ca, ensure_ascii=False)[:400]}')
    if zi.get('sfant_nume') and zi['sfant_nume'][:20] not in ca['erou']: probleme.append('calendar azi: sfântul din date lipsește')
    if ref_ap not in ca['apostol'] or ref_ev not in ca['evanghelie']: probleme.append(f'calendar azi: referințe {ca}')
    if ca['insigna_culoare']: probleme.append('calendar azi: insigna culoare liturgică')
    pg.goto(B + '/sfantul-zilei', wait_until='networkidle'); pg.wait_for_timeout(1500)
    sz = pg.inner_text('#sfant-principal'); log(f'    /sfantul-zilei: sfântul principal „{sz[:80]}”')
    if zi.get('sfant_nume') and zi['sfant_nume'][:20] not in sz: probleme.append('sfântul zilei nu vine din date')
    pg.goto(B + '/calendar', wait_until='networkidle'); pg.wait_for_timeout(2000)
    cal = pg.evaluate("document.querySelectorAll('.cal-rand').length"); azi_cal = pg.evaluate("(document.querySelector('.cal-rand-azi')||{}).innerText||''")
    log(f'    /calendar: {cal} zile în listă; ziua de azi: „{azi_cal[:80]}”')
    if cal < 28 or 'Astăzi' not in azi_cal: probleme.append('calendarul lunii nu se afișează corect')

    # ── 5. SEO + Doxologia ──
    log('\n[5] Formulări SEO și Doxologia')
    for path in ['/evanghelia-zilei', '/apostolul-zilei', '/calendar-ortodox-azi', '/faq']:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1200)
        t = pg.evaluate('document.body.textContent'); m = pg.get_attribute('meta[name=description]', 'content') or ''
        info = {'meta': m[:150], 'formulare_doxologia': ('lectura publicată pe Doxologia' in t + m) or ('Citește lectura pe Doxologia' in t),
                'buton_doxologia': pg.locator('a[href*="doxologia.ro"]').count()}
        if path == '/faq': info = {'meta': m[:120], 'Pasti_12_aprilie': '12 aprilie 2026' in t, 'Post_Mare_23_feb': '23 februarie' in t, 'Apostoli_8_28_iunie': '8 – 28 iunie' in t}
        log(f'    {path}: {json.dumps(info, ensure_ascii=False)}')
        if path != '/faq' and not info['formulare_doxologia']: probleme.append(f'{path}: formularea Doxologia lipsește')
        if path in ('/evanghelia-zilei', '/apostolul-zilei') and not info['buton_doxologia']: probleme.append(f'{path}: link Doxologia lipsă')
        if path == '/faq' and not all(v for k, v in info.items() if k != 'meta'): probleme.append(f'FAQ: {info}')

    # ── 6. Alerte post suspendate (fără a atinge OneSignal) ──
    pg.goto(B + '/setari-notificari', wait_until='networkidle'); pg.wait_for_timeout(1500)
    al = pg.evaluate("""() => {const t=document.getElementById('toggle-alerte'),o=document.getElementById('ora-alerte'),c=document.getElementById('card-alerte');
       return {comutator_dezactivat:!!(t&&t.disabled), ora_dezactivata:!!(o&&o.disabled), eticheta:c?c.innerText.replace(/\\s+/g,' ').slice(0,160):''}}""")
    log(f'\n[6] Alerte post: {json.dumps(al, ensure_ascii=False)}')
    if not (al['comutator_dezactivat'] and al['ora_dezactivata'] and 'suspendat temporar' in al['eticheta']): probleme.append(f'alerte post: {al}')
    c.close()

    # ── 7. PWA + offline ──
    c = ctx_nou(br, True, sw=True); pg = c.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(4000); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(2500)
    for path in ['/calendar-ortodox-azi', '/setari-notificari']: pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(800)
    sw = pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>x.active&&x.active.state))"); cache = pg.evaluate('caches.keys()')
    cdp = c.new_cdp_session(pg)
    try: inst = [e.get('errorId') for e in cdp.send('Page.getInstallabilityErrors').get('installabilityErrors', [])]
    except Exception: inst = 'n/a'
    log(f'\n[7] PWA: service worker {sw}; cache {cache}; erori instalare: {inst or "niciuna"}')
    if not any(k.endswith('-v19') for k in cache) or any(k.endswith('-v18') for k in cache): probleme.append(f'PWA cache: {cache}')
    if inst: probleme.append(f'PWA instalare: {inst}')
    c.set_offline(True)
    for path in ['/', '/calendar-ortodox-azi', '/setari-notificari']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=20000); pg.wait_for_timeout(700)
            t = pg.evaluate('document.body.innerText'); g = [k for k, rx in INTERZIS.items() if rx.search(t)]
            log(f'    offline {path}: HTTP {r.status if r else "-"} „{pg.title()[:45]}”{" interzis=" + str(g) if g else ""}')
            if not r or r.status != 200 or g: probleme.append(f'offline {path}')
        except Exception as e:
            log(f'    offline {path}: eroare {str(e)[:80]}'); probleme.append(f'offline {path}')
    c.set_offline(False); c.close(); br.close()

log(f'\nREZULTAT: {"FĂRĂ PROBLEME" if not probleme else str(len(probleme)) + " PROBLEME"}')
for x in probleme: log('  - ' + x[:300])
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
