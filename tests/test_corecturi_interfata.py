"""Teste pentru PR #7 „corecturi de interfață și conținut”.
Folosire: python3 tests/test_corecturi_interfata.py <ROOT> <eticheta>
Cere: pip install playwright (Chromium). Rezultatele: $PDC_REZULTATE/<eticheta>/rezultat-pr7.json
Server local care imită Vercel (cleanUrls, 404 real); Supabase și OneSignal simulate (nimic nu pleacă în rețea)."""
import sys, os, json, re, threading, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT, ET = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.environ.get('PDC_REZULTATE', '/tmp/pdc-teste'), ET); os.makedirs(OUT, exist_ok=True)

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(s, *a): pass
    def send_head(s):
        path = s.path.split('?')[0]
        if path != '/' and path.endswith('/'):
            s.send_response(308); s.send_header('Location', path.rstrip('/')); s.end_headers(); return None
        fp = os.path.join(ROOT, path.lstrip('/'))
        if path.endswith('.html') and os.path.exists(fp):
            s.send_response(308); s.send_header('Location', path[:-5].replace('/index', '') or '/'); s.end_headers(); return None
        if os.path.isdir(fp) and os.path.exists(os.path.join(fp, 'index.html')): s.path = path.rstrip('/') + '/index.html'
        elif os.path.exists(fp + '.html'): s.path = path + '.html'
        elif not os.path.exists(fp):
            s.send_response(404); s.send_header('Content-Type', 'text/plain'); s.end_headers(); s.wfile.write(b'404'); return None
        return super().send_head()
    def do_GET(s):
        f = s.send_head()
        if f:
            try: s.copyfile(f, s.wfile)
            finally: f.close()

srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = f'http://127.0.0.1:{srv.server_address[1]}'

SFANT = 'Sf. Ap. Filip, unul dintre cei 7 diaconi; Sf. Ier. Teofan Mărturisitorul'
ROW = [{"data_calendaristica": "2026-10-11", "sfant_nume": SFANT, "tip_post": "post", "post_info": "Zi de post",
        "cuvant_folos": "Citat de test — ogorul", "apostol_carte": "Galateni", "apostol_versete": "2, 16-20", "apostol_text": "Fraților, știind că omul",
        "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15", "evanghelie_text": "Ieșit-a semănătorul",
        "sinaxar": "Sfântul Filip, unul din cei șapte diaconi.", "predica": "Iubiți credincioși, pilda semănătorului.",
        "meta_description": "Calendar ortodox 11 octombrie 2026: Sf. Ap. Filip."}]
SDK = """(function(){var tags={};var OS={Notifications:{requestPermission:function(){return Promise.resolve(true)},permission:true},User:{addTag:function(k,v){tags[k]=v},addTags:function(o){Object.assign(tags,o)},getTags:function(){return tags},PushSubscription:{optedIn:true,id:'abc-123-xyz789',optIn:function(){return Promise.resolve()}}},init:function(){return Promise.resolve()}};window.OneSignal=OS;var q=window.OneSignalDeferred||[];q.forEach(function(f){try{f(OS)}catch(e){}});window.OneSignalDeferred={push:function(f){f(OS)}}})();"""

# Promisiuni care nu mai corespund conținutului disponibil (vizibil, titlu, meta, Open Graph, JSON-LD)
INTERZIS = {
    'tâlcuire completă (lecturi)': re.compile(r'Tâlcuire Completă|tâlcuirea completă'),
    'text integral Evanghelie': re.compile(r'[Tt]extul integral al Evangheliei(?! zilei îl puteți citi)|Evanghelia zilei — Textul integral'),
    'text complet lecturi (calendar azi)': re.compile(r'cu textul complet'),
    'tip post / culoare liturgică': re.compile(r'tipul de post|culoarea liturgic|[Aa]lb liturgic'),
    'sfânt inventat': re.compile(r'Sfânt din Sinaxarul BOR'),
    'promisiune post zilnic': re.compile(r'afișăm zilnic dacă este post'),
    'tâlcuire patristică (predică)': re.compile(r'[Tt]âlcuire patristică|[Tt]âlcuirea patristică a Evangheliei|Tâlcuirea Evangheliei și Cuvântul de Folos|pregătite zilnic de echipa'),
    'link „Cuvant de folos”': re.compile(r'Cuvant de folos'),
    'date greșite Paști / Post 2026': re.compile(r'19 aprilie|2 martie|15 iunie – 28 iunie|Paștelui 2026 \(19'),
    'etichetă de post pe zi': re.compile(r'Zi de post|Dezlegare la (toate|pește)|Post negru|Post aspru'),
    'alerte post active': re.compile(r'Te anunțăm când începe un post'),
    'atribuire „sursă oficială”': re.compile(r'(linkul|link) către textul oficial|textul oficial de pe|sursa oficială|referința și textul oficial|linkul oficial'),
}
PAGINI = ['/', '/calendar-ortodox-azi', '/setari-notificari', '/sfintii-zilei', '/rugaciunea-zilei', '/rugaciunea-zilei/luni',
          '/rugaciunea-zilei/miercuri', '/rugaciunea-zilei/vineri', '/apostolul-zilei', '/evanghelia-zilei', '/predica-zilei',
          '/sfantul-zilei', '/sinaxar', '/calendar', '/faq']
rez = {'pagini': {}, 'probleme': []}

def context(b, mobil, sw='block'):
    vp = {'width': 390, 'height': 844} if mobil else {'width': 1280, 'height': 900}
    ctx = b.new_context(viewport=vp, is_mobile=mobil, has_touch=mobil, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers=sw)
    ctx.add_init_script("try{localStorage.setItem('cookies-acceptate','da')}catch(e){}")
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(ROW)))
    ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    ctx.route('**/i.ytimg.com/**', lambda r: r.fulfill(status=200, content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg"/>'))
    return ctx

def texte(pg):
    return pg.evaluate("""() => [document.title,
      ...[...document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')].map(m=>m.content||''),
      ...[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent)].join(' \\n ')""")

def problema(x): rez['probleme'].append(x)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ── 1. Pagini: promisiuni false, erori JS, depășire orizontală ──
    for mobil in (True, False):
        disp = 'mobil' if mobil else 'desktop'
        ctx = context(b, mobil)
        for path in PAGINI:
            pg = ctx.new_page(); err = []
            pg.on('pageerror', lambda e: err.append(str(e)[:150]))
            r = pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1500)
            viz = pg.evaluate('document.body.innerText'); asc = texte(pg)
            g = {}
            for k, rx in INTERZIS.items():
                if k == 'etichetă de post pe zi' and path == '/faq': continue  # FAQ explică general ce este dezlegarea
                m = rx.findall(viz + ' \n ' + asc)
                if m: g[k] = sorted(set(map(str, m)))[:3]
            ov = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            rez['pagini'][f'{disp} {path}'] = {'status': r.status, 'interzis': g, 'erori_js': err, 'depasire': ov}
            if r.status != 200 or g or err or ov > 2: problema(f'{disp} {path}: status={r.status} interzis={g} erori={err} depasire={ov}')
            pg.close()
        ctx.close()

    # ── 2. /calendar-ortodox-azi: sfântul din date, referințe în ambele carduri, fără culoare liturgică ──
    ctx = context(b, True); pg = ctx.new_page(); pg.goto(B + '/calendar-ortodox-azi', wait_until='networkidle'); pg.wait_for_timeout(1500)
    c = {'erou': pg.inner_text('#sfant-azi'), 'card_sfant': pg.inner_text('#sfant-card'), 'apostol': pg.inner_text('#apostol-card'),
         'evanghelie': pg.inner_text('#ev-card'), 'insigna_culoare': pg.locator('#culoare-badge').count(),
         'meta': pg.get_attribute('meta[name=description]', 'content')}
    rez['calendar_azi'] = c
    if SFANT not in c['erou']: problema(f'calendar azi: sfântul din date nu apare în cardul principal ({c["erou"]})')
    if 'Galateni 2, 16-20' not in c['apostol'] or 'Luca 8, 5-15' not in c['evanghelie']: problema(f'calendar azi: referințe lipsă {c}')
    if c['insigna_culoare']: problema('calendar azi: insigna de culoare liturgică încă există')
    ctx.close()

    # ── 3. Alerte posturi: suspendate, preferința salvată rămâne neatinsă, celelalte comutatoare merg ──
    ctx = context(b, True)
    ctx.add_init_script("""function FN(){};Object.defineProperty(FN,'permission',{get:()=> 'granted'});FN.requestPermission=()=>Promise.resolve('granted');window.Notification=FN;
      if(!sessionStorage.getItem('pus')){sessionStorage.setItem('pus','1');localStorage.setItem('pdc_notificari_v1',JSON.stringify({dimineata:false,pranz:false,seara:false,seara_ora:'21:30',alerte_post:true,alerte_post_ora:'06:00'}));}""")
    for path in ['/setari-notificari', '/']:
        pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:150]))
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1200)
        if path == '/':
            pg.evaluate("window.navigheaza ? navigheaza('/setari-notificari') : null"); pg.wait_for_timeout(800)
        inainte = pg.evaluate("localStorage.getItem('pdc_notificari_v1')")
        st = pg.evaluate("""() => { const t=document.getElementById('toggle-alerte'), o=document.getElementById('ora-alerte'), c=document.getElementById('card-alerte');
            return {exista:!!t, dezactivat:!!(t&&t.disabled), ora_dezactivata:!!(o&&o.disabled), text:c?c.innerText:''} }""")
        try: pg.locator('#toggle-alerte').click(force=True, timeout=2000)
        except Exception: pass
        pg.locator('#toggle-alerte').dispatch_event('click'); pg.wait_for_timeout(600)
        dupa = pg.evaluate("localStorage.getItem('pdc_notificari_v1')")
        a, d = json.loads(inainte or '{}'), json.loads(dupa or '{}')
        st.update({'preferinta_neschimbata': a.get('alerte_post') is True and d.get('alerte_post') is True and a.get('alerte_post_ora') == d.get('alerte_post_ora') == '06:00',
                   'inainte': inainte, 'dupa': dupa, 'erori_js': err})
        if path == '/setari-notificari':
            pg.locator('#toggle-dimineata').dispatch_event('click'); pg.wait_for_timeout(800)
            st['dimineata_se_salveaza'] = json.loads(pg.evaluate("localStorage.getItem('pdc_notificari_v1')") or '{}').get('dimineata') is True
            pg.reload(wait_until='networkidle'); pg.wait_for_timeout(1200)
            st['dimineata_dupa_revenire'] = pg.eval_on_selector('#toggle-dimineata', 'e=>e.checked')
            st['alerte_dupa_revenire_dezactivat'] = pg.eval_on_selector('#toggle-alerte', 'e=>e.disabled')
        rez['alerte_' + (path.strip('/') or 'acasa')] = st
        if st['exista'] and not (st['dezactivat'] and st['ora_dezactivata'] and st['preferinta_neschimbata'] and 'va reveni' in st['text'].lower()):
            problema(f'alerte post {path}: {st}')
        if err: problema(f'alerte post {path}: erori JS {err}')
        if path == '/setari-notificari' and not (st['dimineata_se_salveaza'] and st['dimineata_dupa_revenire'] and st['alerte_dupa_revenire_dezactivat']):
            problema(f'setări: comutatorul de dimineață sau starea după revenire {st}')
        pg.close()
    ctx.close()

    # ── 4. Miercuri / vineri: postul ca regulă generală, cu excepții ──
    ctx = context(b, True)
    for zi in ['miercuri', 'vineri']:
        pg = ctx.new_page(); pg.goto(B + '/rugaciunea-zilei/' + zi, wait_until='networkidle'); pg.wait_for_timeout(1200)
        t = pg.evaluate('document.body.innerText') + ' ' + texte(pg)
        ok = 'regulă generală' in t and 'harți' in t and not re.search(r'(Miercurea|Vinerea) este zi de post și', t)
        rez['rugaciune_' + zi] = {'regula_generala': 'regulă generală' in t, 'exceptii_harti': 'harți' in t, 'fara_afirmatie_absoluta': not re.search(r'(Miercurea|Vinerea) este zi de post și', t)}
        if not ok: problema(f'rugăciunea de {zi}: {rez["rugaciune_" + zi]}')
        pg.close()
    # ── 5. FAQ: date din calendarul BOR 2026 ──
    pg = ctx.new_page(); pg.goto(B + '/faq', wait_until='networkidle'); t = pg.evaluate('document.body.textContent') + texte(pg)  # răspunsurile FAQ sunt pliate (ascunse)
    rez['faq'] = {k: (k in t) for k in ['12 aprilie 2026', '23 februarie', '8 – 28 iunie', '31 iulie – 14 august', '15 noiembrie – 24 decembrie']}
    if not all(rez['faq'].values()): problema(f'FAQ: {rez["faq"]}')
    pg.close(); ctx.close()

    # ── 6. PWA: service worker, cache nou, offline ──
    ctx = context(b, True, sw='allow'); pg = ctx.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(2500); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(1500)
    rez['pwa_sw'] = pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>x.active&&x.active.scriptURL))")
    rez['pwa_cache'] = pg.evaluate('caches.keys()')
    cdp = ctx.new_cdp_session(pg)
    try: rez['pwa_instalabilitate'] = [e.get('errorId') for e in cdp.send('Page.getInstallabilityErrors').get('installabilityErrors', [])]
    except Exception as e: rez['pwa_instalabilitate'] = 'n/a'
    for path in ['/calendar-ortodox-azi', '/setari-notificari']:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(800)
    ctx.set_offline(True); rez['offline'] = {}
    for path in ['/', '/calendar-ortodox-azi']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(800)
            t = pg.evaluate('document.body.innerText')
            g = [k for k, rx in INTERZIS.items() if rx.search(t)]
            rez['offline'][path] = {'incarcat': bool(r) and r.status == 200, 'titlu': pg.title()[:60], 'interzis': g}
            if not (r and r.status == 200) or g: problema(f'offline {path}: {rez["offline"][path]}')
        except Exception as e:
            rez['offline'][path] = 'eroare ' + str(e)[:100]; problema(f'offline {path}: {e}')
    ctx.set_offline(False)
    if not any(k.endswith('-v25') for k in rez['pwa_cache']): problema(f'PWA: cache v25 lipsă {rez["pwa_cache"]}')
    if rez['pwa_instalabilitate']: problema(f'PWA instalabilitate: {rez["pwa_instalabilitate"]}')
    ctx.close(); b.close()

json.dump(rez, open(os.path.join(OUT, 'rezultat-pr7.json'), 'w'), ensure_ascii=False, indent=1)
print(f'[{ET}] pagini verificate: {len(rez["pagini"])} | probleme: {len(rez["probleme"])}')
for x in rez['probleme']: print('  - ' + x[:400])
for k in ['calendar_azi', 'alerte_setari-notificari', 'alerte_acasa', 'rugaciune_miercuri', 'rugaciune_vineri', 'faq', 'pwa_cache', 'pwa_instalabilitate', 'offline']:
    print(f'  {k} = {json.dumps(rez.get(k), ensure_ascii=False)[:300]}')
