"""Test de actualizare PWA: un telefon care are deja versiunea veche (service worker + cache) primește versiunea nouă.
Folosire: python3 tests/test_actualizare_pwa.py <ROOT_VECHI> <ROOT_NOU> <eticheta>
Pași: 1) se servește versiunea veche și se vizitează câteva pagini (se instalează SW-ul vechi și cache-urile lui);
      2) același server începe să servească versiunea nouă (ca după publicarea pe Vercel);
      3) se reîncarcă paginile ca un vizitator obișnuit și se verifică: SW nou activ, cache-urile vechi șterse,
         conținut nou afișat, nicio versiune amestecată de scripturi, nicio eroare JS, funcționare offline.
Supabase și OneSignal sunt simulate; nimic nu pleacă în rețea."""
import sys, os, json, re, threading, http.server, socketserver, tempfile
from playwright.sync_api import sync_playwright

VECHI, NOU, ET = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = os.path.join(os.environ.get('PDC_REZULTATE', '/tmp/pdc-teste'), ET); os.makedirs(OUT, exist_ok=True)
STARE = {'root': VECHI}

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=STARE['root'], **k)
    def log_message(s, *a): pass
    def end_headers(s):
        s.send_header('Cache-Control', 'public, max-age=0, must-revalidate')  # ca pe Vercel
        super().end_headers()
    def send_head(s):
        root = STARE['root']; path = s.path.split('?')[0]
        if path != '/' and path.endswith('/'):
            s.send_response(308); s.send_header('Location', path.rstrip('/')); s.end_headers(); return None
        fp = os.path.join(root, path.lstrip('/'))
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
ROW = [{"data_calendaristica": "2026-10-11", "sfant_nume": "Sf. Ap. Filip; Sf. Ier. Teofan", "tip_post": "post", "cuvant_folos": "x",
        "apostol_carte": "Galateni", "apostol_versete": "2, 16-20", "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15",
        "sinaxar": "Text.", "predica": "Text.", "meta_description": "Calendar ortodox 11 octombrie 2026."}]
SDK = "window.OneSignalDeferred=window.OneSignalDeferred||[];"
PAGINI = ['/', '/calendar-ortodox-azi', '/evanghelia-zilei', '/setari-notificari', '/rugaciunea-zilei/miercuri', '/calendar']
rez = {'probleme': []}
def problema(x): rez['probleme'].append(x)

def scripturi(pg):
    return pg.evaluate("[...document.scripts].map(s=>s.getAttribute('src')).filter(s=>s&&s.startsWith('/js/'))")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(tempfile.mkdtemp(), viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True,
                                               locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='allow')
    ctx.add_init_script("""(()=>{const T=new Date('2026-10-11T09:00:00+03:00').getTime();const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}};window.Date=F;})();""")  # rândul simulat e pentru 11 oct. 2026
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    ctx.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(ROW)))
    ctx.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    ctx.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    pg = ctx.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:150]))

    # 1. Telefon cu versiunea veche
    for path in PAGINI:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(700)
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(2500)
    rez['vechi_cache'] = pg.evaluate('caches.keys()')
    rez['vechi_sw'] = pg.evaluate("navigator.serviceWorker.controller ? 'activ' : 'lipsă'")
    err_vechi = list(err); err.clear()

    # 2. Se publică versiunea nouă
    STARE['root'] = NOU

    # 3. Vizitatorul revine (o reîncărcare obișnuită)
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(3000)
    pg.reload(wait_until='networkidle'); pg.wait_for_timeout(2000)
    rez['nou_cache'] = pg.evaluate('caches.keys()')
    rez['nou_sw_scripturi'] = pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>[x.active&&x.active.state, !!x.waiting, !!x.installing]))")
    rez['pagini'] = {}
    for path in PAGINI:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1200)
        t = pg.evaluate('document.body.innerText')
        src = scripturi(pg)
        v = sorted(set(re.findall(r'\?v=(\d+)', ' '.join(x for x in src if 'app' in x))))
        info = {'scripturi': src, 'versiuni_app': v,
                'nou_alerte_suspendate': ('suspendat temporar' in pg.content()) if path in ('/', '/setari-notificari') else None,
                'fara_culoare_liturgica': ('liturgic' not in t) if path == '/calendar-ortodox-azi' else None,
                'text_biblia_1914': ('una a căzut lângă cale' in t and 'Biblia 1914' in t) if path == '/evanghelia-zilei' else None,
                'regula_generala': ('regulă generală' in t) if path.endswith('miercuri') else None}
        rez['pagini'][path] = info
        if len(v) > 1 or (v and v != [os.environ.get('PDC_VERSIUNE_APP', '21')]): problema(f'{path}: versiuni de app amestecate sau vechi {v}')
        if any(x is False for x in info.values()): problema(f'{path}: conținut vechi după actualizare {info}')
    if any(k.endswith('-v' + os.environ.get('PDC_CACHE_VECHI', '23')) for k in rez['nou_cache']): problema(f'cache-uri vechi rămase: {rez["nou_cache"]}')
    if not any(k.endswith('-v' + os.environ.get('PDC_CACHE_NOU', '24')) for k in rez['nou_cache']): problema(f'cache nou lipsă: {rez["nou_cache"]}')
    if err: problema(f'erori JS după actualizare: {err}')

    # 4. Offline după actualizare
    ctx.set_offline(True); rez['offline'] = {}
    for path in ['/', '/calendar-ortodox-azi', '/setari-notificari', '/evanghelia-zilei']:
        try:
            r = pg.goto(B + path, wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(600)
            rez['offline'][path] = {'status': r.status if r else None, 'titlu': pg.title()[:50], 'alerte_suspendate': 'suspendat temporar' in pg.content() if path != '/calendar-ortodox-azi' else None}
            if not r or r.status != 200: problema(f'offline {path}: {rez["offline"][path]}')
            if path == '/evanghelia-zilei':
                pg.wait_for_timeout(1500); rez['offline'][path]['text_1914'] = 'una a căzut lângă cale' in pg.evaluate('document.body.innerText')
                if not rez['offline'][path]['text_1914']: problema('offline /evanghelia-zilei: lipsește textul din Biblia 1914')
        except Exception as e:
            rez['offline'][path] = 'eroare ' + str(e)[:80]; problema(f'offline {path}: {e}')
    ctx.set_offline(False)
    rez['erori_js_vechi'] = err_vechi
    ctx.close()

json.dump(rez, open(os.path.join(OUT, 'actualizare-pwa.json'), 'w'), ensure_ascii=False, indent=1)
print(f'[{ET}] probleme: {len(rez["probleme"])}')
for x in rez['probleme']: print('  - ' + x[:300])
for k in ['vechi_cache', 'vechi_sw', 'nou_cache', 'nou_sw_scripturi', 'offline']:
    print(f'  {k} = {json.dumps(rez.get(k), ensure_ascii=False)[:300]}')
for k, v in rez['pagini'].items(): print(f'  {k}: versiuni app={v["versiuni_app"]} ' + ' '.join(f'{a}={b}' for a, b in v.items() if a not in ('scripturi', 'versiuni_app') and b is not None))
