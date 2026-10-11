"""Verifică protecția din js/corectura-provizorie.js pentru textele generate zilnic:
- 11 oct. 2026 (caz real): baza de date are viața și troparul Sf. Lev de la Optina, care NU e în calendarul validat
  -> textele respective nu se afișează nicăieri (nici în JSON-LD); apare mesajul neutru; predica despre Evanghelie rămâne.
- 14 oct. 2026 (control): textele despre Sf. Parascheva (în calendarul validat) rămân neschimbate.
Folosire: python3 tests/test_texte_generate.py <ROOT> <eticheta>"""
import sys, os, json, threading, http.server, socketserver
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

PREDICA_OK = 'Evanghelia zilei, după Luca 8, 5-15, ne aduce în fața ochilor Pilda semănătorului. Sfântul Ioan Gură de Aur ne spune că sămânța este cuvântul lui Dumnezeu.'
CAZURI = {
    '2026-10-11': dict(rand={
        "data_calendaristica": "2026-10-11",
        "sfant_nume": "Duminica a 21-a după Rusalii (Pilda semănătorului – a Sfinților Părinți de la Sinodul al VII-lea Ecumenic); Sfântul Apostol Filip, unul din cei 7 diaconi; Sfânta Muceniță Zenaida; Sfântul Ierarh Teofan Mărturisitorul, Episcopul Niceei; Sfânta Muceniță Filonila; Sfântul Filotei I (Kokkinos), Patriarhul Constantinopolului; Soborul Sfinților Stareți de la Optina",
        "sfinti_secundari": "Sfântul Apostol Filip, Soborul Sfinților Stareți de la Optina; Sfânta Muceniță Zenaida",
        "sfant_viata": "Sfântul Lev de la Optina (născut în 1768, în Rusia) a fost unul dintre cei mai renumiți stareți ai Mănăstirii Optina.",
        "tropar": "Troparul Sfântului Lev de la Optina, glasul 8: Cu viața ta curată ai strălucit ca o lumină în lume, Părinte Lev.",
        "sinaxar": "În data de 11 octombrie, Biserica cinstește pe Sfântul Apostol Filip și pe Sfânta Muceniță Zenaida.",
        "predica": PREDICA_OK,
        "meta_description": "Calendar ortodox 11 octombrie 2026: cinstirea Sfântului Lev de la Optina.",
        "apostol_carte": "Tit", "apostol_versete": "3, 8-15", "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15"},
        interzis=['Optina', 'Zenaida', 'Lev de la'], pastrat=['Pilda semănătorului', 'nu este disponibil']),
    '2026-10-14': dict(rand={
        "data_calendaristica": "2026-10-14",
        "sfant_nume": "Sfânta Cuvioasă Parascheva de la Iași; Sfinții Mucenici Nazarie, Ghervasie, Protasie și Chelsie",
        "sfinti_secundari": None,
        "sfant_viata": "Sfânta Cuvioasă Parascheva s-a născut în satul Epivata, în secolul al XI-lea, și a trăit în rugăciune și nevoință.",
        "tropar": "Troparul Sfintei Cuvioase Parascheva, glasul 4: Pustnicească și fără de zgomot viețuire iubind.",
        "sinaxar": "În această zi pomenim pe Sfânta Cuvioasă Parascheva de la Iași.",
        "predica": "Iubiți credincioși, viața Sfintei Parascheva ne arată calea smereniei.",
        "meta_description": "Calendar ortodox 14 octombrie 2026.",
        "apostol_carte": "Galateni", "apostol_versete": "5, 22-26", "evanghelie_carte": "Luca", "evanghelie_versete": "7, 36-50"},
        interzis=['Viața sfântului zilei nu este disponibilă', 'Sinaxarul zilei nu este disponibil', 'Predica zilei nu este disponibilă'], pastrat=['Epivata', 'Pustnicească', 'calea smereniei']),
}
PAGINI = ['/', '/sfantul-zilei', '/sfintii-zilei', '/sinaxar', '/sinaxarul-zilei', '/predica-zilei', '/calendar-ortodox-azi']
rez = {'cazuri': {}, 'probleme': []}

with sync_playwright() as p:
    b = p.chromium.launch()
    for zi, caz in CAZURI.items():
        c = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
        c.add_init_script("(()=>{const T=new Date('%sT09:00:00+03:00').getTime();const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}};window.Date=F;})();" % zi)
        body = json.dumps([caz['rand']])
        def fabrica(body):
            def ruta(r, *_):
                return trateaza(r, body)
            return ruta
        def trateaza(r, body):
            u = r.request.url
            if 'supabase.co' in u: return r.fulfill(status=200, content_type='application/json', body=body)
            if u.startswith(B) and '/_vercel/' not in u: return r.continue_()
            return r.fulfill(status=200, content_type='application/javascript', body='')  # extern: blocat
        c.route('**/*', fabrica(body))
        vazut = ''
        for path in PAGINI:
            pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:120]))
            pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1500)
            t = pg.evaluate("""() => document.title + ' ' + [...document.querySelectorAll('meta')].map(m=>m.content||'').join(' ')
                + ' ' + [...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>s.textContent).join(' ') + ' ' + document.body.innerText""")
            vazut += t
            p_ = [f'„{x}” afișat' for x in caz['interzis'] if x in t]
            if err: p_.append('erori JS ' + str(err))
            rez['cazuri'][f'{zi} {path}'] = p_
            if p_: rez['probleme'].append(f'{zi} {path}: {p_}')
            pg.close()
        for x in caz['pastrat']:
            if x not in vazut: rez['probleme'].append(f'{zi}: „{x}” lipsește de pe toate paginile')
        c.close()
    b.close()

json.dump(rez, open(os.path.join(OUT, 'texte-generate.json'), 'w'), ensure_ascii=False, indent=1)
print(f'[{ET}] cazuri: {len(rez["cazuri"])} | probleme: {len(rez["probleme"])}')
for x in rez['probleme']: print('  - ' + x[:300])
