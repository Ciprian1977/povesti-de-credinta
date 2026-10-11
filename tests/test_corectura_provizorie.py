"""Teste pentru PR „corectură provizorie”.
Folosire: python3 tests/test_corectura_provizorie.py <ROOT> <eticheta> [--capturi]
Cere: pip install playwright (Chromium). Rezultatele: $PDC_REZULTATE/<eticheta>/rezultat.json
Server local care imită Vercel (cleanUrls, trailingSlash:false, 404 real), date Supabase simulate."""
import sys, os, json, re, threading, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT, ET = sys.argv[1], sys.argv[2]
CAPT = '--capturi' in sys.argv
SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.environ.get('PDC_REZULTATE', '/tmp/pdc-teste'), ET); os.makedirs(OUT, exist_ok=True)
FD = os.environ.get('PDC_FONTURI', SP + '/fonts/node_modules/@fontsource')  # fonturi locale opționale (@fontsource)

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

srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = f'http://127.0.0.1:{port}'

def ff(fam, file, w, st):
    return f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:swap;src:url(/__f/{file}) format('woff2')}}"
css = ''
for w in (400, 500, 600):
    for st in ('normal', 'italic'):
        css += ff('Newsreader', f'newsreader/files/newsreader-latin-ext-{w}-{st}.woff2', w, st)
    css += ff('Inter', f'inter/files/inter-latin-ext-{w}-normal.woff2', w, 'normal')

AP_TEXT = 'Fraților, știind că omul nu se îndreptează din faptele Legii, ci prin credința în Hristos Iisus, am crezut și noi în Hristos Iisus.'
EV_TEXT = 'Zis-a Domnul pilda aceasta: Ieșit-a semănătorul să semene sămânța sa. Și, semănând el, una a căzut lângă drum.'
CITAT = 'Cuvântul lui Dumnezeu este sămânța cea bună, iar noi suntem ogorul. — Sfântul Ioan Gură de Aur, Omilii la Matei'
ROW = [{"data_calendaristica": "2026-10-11", "sfant_nume": "Sf. Ap. Filip, unul dintre cei 7 diaconi; Sf. Ier. Teofan Mărturisitorul",
        "tip_post": "post", "post_info": "Zi de post — abstinență de la carne", "cuvant_folos": CITAT,
        "apostol_carte": "Galateni", "apostol_versete": "2, 16-20", "apostol_text": AP_TEXT,
        "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15", "evanghelie_text": EV_TEXT,
        "sinaxar": "Sfântul Filip, unul din cei șapte diaconi, a botezat pe famenul Candachiei.", "sfant_viata": "Sfântul Filip a fost unul dintre cei șapte diaconi.",
        "predica": "Iubiți credincioși, pilda semănătorului ne cheamă să fim pământ bun.", "tropar": "Apostoli sfinți, rugați pe Dumnezeu.",
        "meta_description": "Calendar ortodox 11 octombrie 2026: Sf. Ap. Filip. Dezlegare la pește. Text complet al Evangheliei.", "culoare_liturgica": "rosu"}]

SDK = """(function(){var tags={};var OS={Notifications:{requestPermission:function(){return Promise.resolve(true)},permission:true},User:{addTag:function(k,v){tags[k]=v},addTags:function(o){Object.assign(tags,o)},getTags:function(){return tags},PushSubscription:{optedIn:true,id:'abc-123-xyz789',optIn:function(){return Promise.resolve()}}},init:function(){return Promise.resolve()}};window.OneSignal=OS;var q=window.OneSignalDeferred||[];q.forEach(function(f){try{f(OS)}catch(e){}});window.OneSignalDeferred={push:function(f){f(OS)}}})();"""

# Texte care NU au voie să fie vizibile după corectură
INTERZIS = {
    'eticheta post': re.compile(r'Zi de post|Dezlegare|Post negru|post aspru|Har[țt]i\b', re.I),
    'citat cuvant de folos': re.compile(r'ogorul|Rugăciunea este hrana sufletului|Serafim de Sarov|comori pe care nu le-ai cunoscut|Smerenia este temelia'),
    # textul generat din baza de date (nu cel din Biblia 1914, care e permis și cerut)
    'text generat Apostol': re.compile(r'Fraților, știind că omul|să umblăm cu vrednicie'),
    'text generat Evanghelie': re.compile(r'Zis-a Domnul pilda aceasta|una a căzut lângă drum|Eu sunt lumina lumii'),
    'lectura „implicita” pe zi': re.compile(r'ziua cea dintâi a săptămânii, Maria Magdalena|La început era Cuvântul|Credința este încredințarea|De aș grăi în limbile|Căci câți sunt mânați de Duhul'),
    'afirmatie liturgica de rezerva': re.compile(r'după Heruvic', re.I),
}
PAGINI = ['/', '/sfintii-zilei', '/rugaciunea-zilei', '/rugaciunea-zilei/luni', '/rugaciunea-zilei/duminica', '/apostolul-zilei', '/evanghelia-zilei',
          '/calendar-ortodox-azi', '/sfantul-zilei', '/sinaxarul-zilei', '/sinaxar', '/predica-zilei', '/calendar', '/setari-notificari', '/rugaciuni/tatal-nostru']

rez = {'pagini': {}, 'erori_totale': 0}
with sync_playwright() as p:
    b = p.chromium.launch()
    for disp, vp in [('mobil', {'width': 390, 'height': 844}), ('desktop', {'width': 1280, 'height': 900})]:
        # service worker blocat aici: altfel cererile SW către Supabase ocolesc datele simulate (PWA se testează separat, mai jos)
        ctx = b.new_context(viewport=vp, is_mobile=(disp == 'mobil'), has_touch=(disp == 'mobil'), locale='ro-RO', timezone_id='Europe/Bucharest',
                            device_scale_factor=1, service_workers='block')
        ctx.add_init_script("try{localStorage.setItem('cookies-acceptate','da')}catch(e){}")
        ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=css))
        ctx.route('**/__f/**', lambda r: r.fulfill(path=FD + '/' + r.request.url.split('/__f/')[1]) if os.path.isdir(FD) else r.fulfill(status=404, body=''))
        ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(ROW)))
        ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
        ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
        ctx.route('**/i.ytimg.com/**', lambda r: r.fulfill(status=200, content_type='image/svg+xml', body='<svg xmlns="http://www.w3.org/2000/svg"/>'))
        for path in PAGINI:
            pg = ctx.new_page(); err = []
            pg.on('pageerror', lambda e: err.append(str(e)))
            r = pg.goto(B + path, wait_until='networkidle')
            pg.wait_for_timeout(1600)
            st = r.status if r else 0
            vizibil = pg.evaluate('document.body ? document.body.innerText : ""') if st == 200 else ''
            jsonld = pg.evaluate("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>s.textContent).join('\\n')") if st == 200 else ''
            meta = pg.evaluate("(document.querySelector('meta[name=description]')||{}).content||''") if st == 200 else ''
            vizibil = vizibil.replace('începe un post sau o sărbătoare importantă și la zilele cu dezlegare', '[descrierea funcției de alerte]')  # descrierea opțiunii de notificare, nu o etichetă de zi
            gasit = {k: rx.findall(vizibil) for k, rx in INTERZIS.items() if rx.search(vizibil)}
            gasit_ascuns = {k: rx.findall(jsonld + ' ' + meta) for k, rx in INTERZIS.items() if rx.search(jsonld + ' ' + meta)}
            info = {
                'status': st, 'erori_js': err,
                'vizibil_interzis': gasit, 'jsonld_meta_interzis': gasit_ascuns,
                'link_doxologia_lectura': pg.locator('.lectura-sursa a[href*="doxologia"]').count() if st == 200 else 0,
                'text_1914': {k: (x in vizibil) for k, x in [('evanghelie', 'Ieșit-a semănătorul să semene sămânța sa. Și semănând el, una a căzut lângă cale'),
                              ('apostol', 'Știind că nu se îndreptează omul din faptele legei')]},
                'referinte': [x for x in ['Galateni 2, 16-20', 'Luca 8, 5-15'] if x in vizibil],
                'overflow': pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') if st == 200 else 0,
                'titlu': pg.title() if st == 200 else '',
                'canonical': pg.evaluate("(document.querySelector('link[rel=canonical]')||{}).href||''") if st == 200 else '',
            }
            if '/rugaciunea-zilei/' in path and st == 200:
                info['rugaciune'] = pg.evaluate("(document.querySelector('#ruta-rugaciunea-zi h1, #ruta-rugaciunea-zi .ruta-header')||{}).innerText||''")[:80]
            rez['pagini'][disp + ' ' + path] = info
            rez['erori_totale'] += len(err)
            if CAPT and st == 200 and path in ['/', '/apostolul-zilei', '/evanghelia-zilei', '/calendar-ortodox-azi', '/sfantul-zilei', '/rugaciunea-zilei/luni', '/calendar', '/sfintii-zilei']:
                nume = path.strip('/').replace('/', '_') or 'acasa'
                pg.screenshot(path=f'{OUT}/{disp}_{nume}.png', full_page=False)
                if disp == 'mobil':
                    pg.screenshot(path=f'{OUT}/{disp}_{nume}_full.png', full_page=True)
            pg.close()
        # 404 real pentru o rută inexistentă
        pg = ctx.new_page(); r = pg.goto(B + '/rugaciunea-zilei/inexistenta'); rez['404_inexistenta_' + disp] = r.status; pg.close()
        ctx.close()

    # ── PWA: service worker, instalabilitate, offline ──
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='ro-RO', timezone_id='Europe/Bucharest')
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=css))
    ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(ROW)))
    ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    pg = ctx.new_page(); pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(2500)
    rez['pwa_sw_activ'] = pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>x.active&&x.active.scriptURL))")
    cdp = ctx.new_cdp_session(pg)
    try: rez['pwa_instalabilitate_erori'] = [e.get('errorId') for e in cdp.send('Page.getInstallabilityErrors').get('installabilityErrors', [])]
    except Exception as e: rez['pwa_instalabilitate_erori'] = 'n/a ' + str(e)
    rez['pwa_cache_corectura'] = pg.evaluate("caches.keys().then(async ks=>{for(const k of ks){const c=await caches.open(k);const m=await c.match('/js/corectura-provizorie.js?v=6');if(m)return k}return null})")
    ctx.set_offline(True)
    try:
        r = pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(800)
        rez['pwa_offline_acasa'] = {'status': r.status if r else None, 'titlu': pg.title()[:60],
                                    'interzis': {k: rx.findall(pg.evaluate('document.body.innerText')) for k, rx in INTERZIS.items() if rx.search(pg.evaluate('document.body.innerText'))}}
    except Exception as e: rez['pwa_offline_acasa'] = 'eroare: ' + str(e)[:120]
    ctx.set_offline(False); ctx.close()

    # ── Notificări: pagina de setări, comutator, starea abonării (SDK OneSignal simulat) ──
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='ro-RO', timezone_id='Europe/Bucharest')
    ctx.add_init_script("window.__perm=localStorage.getItem('__perm')||'granted';function FN(){};Object.defineProperty(FN,'permission',{get:function(){return window.__perm}});FN.requestPermission=function(){return Promise.resolve('granted')};window.Notification=FN;")
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=css))
    ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(ROW)))
    ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto(B + '/setari-notificari', wait_until='networkidle'); pg.wait_for_timeout(1200)
    pg.locator('#toggle-dimineata').dispatch_event('click'); pg.wait_for_timeout(800)
    salvat = pg.evaluate("localStorage.getItem('pdc_notificari_v1')")
    pg.goto(B + '/setari-notificari', wait_until='networkidle'); pg.wait_for_timeout(3500)
    rez['notificari'] = {'salvat': salvat, 'comutator_dupa_revenire': pg.eval_on_selector('#toggle-dimineata', 'e=>e.checked'),
                         'stare_abonare': pg.evaluate("(document.getElementById('stare-abonare')||{}).innerText||''"),
                         'tag_dimineata': pg.evaluate("JSON.stringify(OneSignal.User.getTags())"), 'erori_js': err}
    if CAPT: pg.screenshot(path=f'{OUT}/mobil_setari_notificari.png')
    ctx.close()

    # ── Zi fără date în Supabase: nu rămâne „Se încarcă...” și nu apare nimic inventat ──
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=css))
    ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    rez['fara_date'] = {}
    for path in ['/', '/apostolul-zilei', '/evanghelia-zilei', '/calendar-ortodox-azi']:
        pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1500)
        t = pg.evaluate('document.body.innerText')
        rez['fara_date'][path] = {'interzis': {k: rx.findall(t) for k, rx in INTERZIS.items() if rx.search(t)}, 'erori_js': err,
                                  'referinta': pg.evaluate("(document.getElementById('apostol-referinta')||document.getElementById('ev-referinta')||{}).innerText||''")[:70]}
        pg.close()
    ctx.close()
    b.close()

json.dump(rez, open(f'{OUT}/rezultat.json', 'w'), ensure_ascii=False, indent=1)
# Rezumat
probleme = []
for k, v in rez['pagini'].items():
    if v['status'] != 200: probleme.append(f'{k}: HTTP {v["status"]}')
    if v['vizibil_interzis']: probleme.append(f'{k}: VIZIBIL {list(v["vizibil_interzis"])}')
    if v['jsonld_meta_interzis']: probleme.append(f'{k}: meta/JSON-LD {list(v["jsonld_meta_interzis"])}')
    if v['erori_js']: probleme.append(f'{k}: erori JS {v["erori_js"][:2]}')
    if v['overflow'] > 1: probleme.append(f'{k}: depășire orizontală {v["overflow"]}px')
for k in ['mobil /apostolul-zilei', 'mobil /evanghelia-zilei', 'desktop /apostolul-zilei', 'desktop /evanghelia-zilei']:
    v = rez['pagini'].get(k, {})
    if v.get('status') == 200 and len(v.get('referinte', [])) < 1: probleme.append(f'{k}: referința lecturii nu apare')
    if v.get('link_doxologia_lectura'): probleme.append(f'{k}: link spre Doxologia în locul textului')
    if k.endswith(' /evanghelia-zilei') and not v['text_1914']['evanghelie']: probleme.append(f'{k}: lipsește textul Evangheliei din Biblia 1914')
    if k.endswith(' /apostolul-zilei') and not v['text_1914']['apostol']: probleme.append(f'{k}: lipsește textul Apostolului din Biblia 1914')
print(f'[{ET}] pagini testate: {len(rez["pagini"])} | probleme: {len(probleme)}')
for x in probleme: print('  -', x)
for k in ['fara_date', '404_inexistenta_mobil', 'pwa_sw_activ', 'pwa_instalabilitate_erori', 'pwa_cache_corectura', 'pwa_offline_acasa', 'notificari']:
    print(' ', k, '=', rez.get(k))
for k in ['mobil /apostolul-zilei', 'mobil /evanghelia-zilei', 'mobil /', 'mobil /calendar-ortodox-azi', 'mobil /rugaciunea-zilei/luni', 'mobil /rugaciunea-zilei/duminica']:
    v = rez['pagini'].get(k, {})
    print(' ', k, '| text 1914:', v.get('text_1914'), '| referinte:', v.get('referinte'), '| titlu:', (v.get('titlu') or '')[:60], '|', v.get('rugaciune', ''))
