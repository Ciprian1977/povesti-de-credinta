"""Verifică prioritatea calendarului validat (oct.–dec. 2026) pe paginile calendaristice, inclusiv titlu, meta, Open Graph și JSON-LD,
pentru mai multe zile, în două situații: (a) Supabase are un rând cu nume greșite; (b) Supabase nu are rând pentru zi.
Folosire: python3 tests/test_calendar_t4_seo.py <ROOT> <eticheta>"""
import sys, os, json, re, threading, http.server, socketserver
from playwright.sync_api import sync_playwright

ROOT, ET = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.environ.get('PDC_REZULTATE', '/tmp/pdc-teste'), ET); os.makedirs(OUT, exist_ok=True)
V = json.load(open(os.path.join(ROOT, 'data/calendar-validat-2026-t4.json'), encoding='utf8'))['zile']

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
            s.send_response(404); s.end_headers(); return None
        return super().send_head()
    def do_GET(s):
        f = s.send_head()
        if f:
            try: s.copyfile(f, s.wfile)
            finally: f.close()
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
B = f'http://127.0.0.1:{srv.server_address[1]}'

GRESIT = 'Sfântul Lev de la Optina'
# numele din calendarele statice vechi din pagini (pentru zilele oct.–dec.), care NU trebuie să rămână când diferă de cel validat
STATICE = ['Cuvioasa Parascheva de la Iași', 'Soborul Sfinților Arhangheli Mihail și Gavriil', 'Sfântul Apostol Andrei, Ocrotitorul României',
           'Sfântul Apostol Andrei, cel Întâi chemat', 'Sfântul Ierarh Nicolae, arhiepiscopul Mirelor Lichiei', 'Nașterea Domnului nostru Iisus Hristos (Crăciunul)',
           'Intrarea în Biserică a Maicii Domnului', 'Sfânt din Sinaxarul BOR', 'Sfânt din Sinaxar']
ZILE = ['2026-10-12', '2026-10-14', '2026-10-28', '2026-11-08', '2026-11-30', '2026-12-02', '2026-12-25']
PAGINI = ['/', '/calendar-ortodox-azi', '/sfantul-zilei', '/sfintii-zilei', '/sinaxar', '/sinaxarul-zilei']
rez = {'cazuri': {}, 'probleme': []}

def context(b, zi, are_rand):
    c = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
    c.add_init_script("(()=>{const T=new Date('%sT09:00:00+03:00').getTime();const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}};window.Date=F;})();" % zi)
    rand = {"data_calendaristica": zi, "sfant_nume": GRESIT + '; Sf. Test', "meta_description": 'Calendar ortodox: ' + GRESIT, "sfinti_secundari": 'Sf. Test',
            "apostol_carte": "Galateni", "apostol_versete": "2, 16-20", "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15", "sinaxar": "Text.", "predica": "Text.", "sfant_viata": "Text.", "tropar": "Text."}
    body = json.dumps([rand] if are_rand else [])
    c.route('**/*supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body=body))
    for pat, ct, bd in [('**/fonts.googleapis.com/**', 'text/css', ''), ('**/cdn.onesignal.com/**', 'application/javascript', 'window.OneSignalDeferred=window.OneSignalDeferred||[];'),
                        ('**/_vercel/**', 'application/javascript', '')]:
        c.route(pat, (lambda ct, bd: (lambda r: r.fulfill(status=200, content_type=ct, body=bd)))(ct, bd))
    c.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    return c

with sync_playwright() as p:
    b = p.chromium.launch()
    for zi in ZILE:
        primul = re.sub(r'^[†()\s]+', '', V[zi]['sfinti'].split(';')[0]).strip()[:28]
        for are_rand in (True, False):
            c = context(b, zi, are_rand)
            for path in PAGINI:
                pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
                pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1500)
                seo = pg.evaluate("""() => ({titlu: document.title,
                    meta: [...document.querySelectorAll('meta[name=description],meta[property^="og:"],meta[name^="twitter:"]')].map(m=>m.content||'').join(' | '),
                    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent).join(' | '),
                    vizibil: document.body.innerText})""")
                tot = seo['titlu'] + ' ' + seo['meta'] + ' ' + seo['ld'] + ' ' + seo['vizibil']
                p_ = []
                if GRESIT in tot: p_.append('nume greșit din baza de date')
                for s in STATICE:
                    if s in tot and s not in V[zi]['sfinti']: p_.append('nume din calendarul static vechi: ' + s)
                if primul not in seo['vizibil']: p_.append('numele validat nu apare în pagină')
                if path != '/sfintii-zilei' and primul not in (seo['titlu'] + seo['meta']): p_.append('numele validat lipsește din titlu/meta')
                if re.search(r'prăznuit|"Sf\\.|Sfântul zilei', seo['ld']) and primul not in seo['ld']: p_.append('JSON-LD fără numele validat')
                if err: p_.append('erori JS ' + str(err))
                cheie = f'{zi} {"cu rând" if are_rand else "fără rând"} {path}'
                rez['cazuri'][cheie] = {'probleme': p_, 'titlu': seo['titlu'][:90], 'meta': seo['meta'][:120]}
                if p_: rez['probleme'].append(f'{cheie}: {p_}')
                pg.close()
            c.close()
    b.close()

json.dump(rez, open(os.path.join(OUT, 'calendar-t4-seo.json'), 'w'), ensure_ascii=False, indent=1)
print(f'[{ET}] cazuri: {len(rez["cazuri"])} | probleme: {len(rez["probleme"])}')
for x in rez['probleme'][:40]: print('  - ' + x[:300])
