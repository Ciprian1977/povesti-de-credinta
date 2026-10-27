"""Teste pentru calendarul validat octombrie–decembrie 2026.
Folosire: python3 tests/test_calendar_t4.py <ROOT> <eticheta>
Server local care imită Vercel; Supabase simulat cu date „greșite” intenționat (nume care NU sunt în calendarul tipărit),
ca să se verifice că pe site are prioritate calendarul validat. OneSignal simulat. Nimic nu pleacă în rețea."""
import sys, os, json, re, threading, http.server, socketserver, datetime
from playwright.sync_api import sync_playwright

ROOT, ET = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.environ.get('PDC_REZULTATE', '/tmp/pdc-teste'), ET); os.makedirs(OUT, exist_ok=True)
DATE = json.load(open(os.path.join(ROOT, 'data/calendar-validat-2026-t4.json'), encoding='utf8'))
V = DATE['zile']
AZI = datetime.date(2026, 10, 11)  # ceasul browserului este fixat la această dată

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

GRESIT = 'Sfântul Lev de la Optina (nume de test care nu este în calendar)'
def rand(iso):
    return {"data_calendaristica": iso, "sfant_nume": GRESIT, "tip_post": "post", "meta_description": f"Calendar ortodox: {GRESIT}",
            "apostol_carte": "Galateni", "apostol_versete": "2, 16-20", "evanghelie_carte": "Luca", "evanghelie_versete": "8, 5-15",
            "sinaxar": "Text.", "predica": "Text.", "sfinti_secundari": "Sf. Test"}
def raspuns_supabase(route):
    u = route.request.url
    m = re.search(r'data_calendaristica=eq\.(\d{4}-\d\d-\d\d)', u)
    if m: return route.fulfill(status=200, content_type='application/json', body=json.dumps([rand(m.group(1))]))
    m = re.search(r'gte\.(\d{4}-\d\d-\d\d).*lte\.(\d{4}-\d\d-\d\d)', u)
    if m:  # baza de date are rânduri doar până azi (ca în realitate)
        a, b = datetime.date.fromisoformat(m.group(1)), min(datetime.date.fromisoformat(m.group(2)), AZI)
        rows = [rand((a + datetime.timedelta(i)).isoformat()) for i in range((b - a).days + 1)] if a <= b else []
        return route.fulfill(status=200, content_type='application/json', body=json.dumps(rows))
    return route.fulfill(status=200, content_type='application/json', body=json.dumps([rand(AZI.isoformat())]))

SDK = "window.OneSignalDeferred=window.OneSignalDeferred||[];"
CEAS = "(()=>{const T=new Date('2026-10-11T09:00:00+03:00').getTime();const D=Date;class F extends D{constructor(...a){super(...(a.length?a:[T]))}static now(){return T}};window.Date=F;})();"
rez = {'probleme': []}
def problema(x): rez['probleme'].append(x)

def context(b, mobil, sw='block'):
    vp = {'width': 390, 'height': 844} if mobil else {'width': 1280, 'height': 900}
    c = b.new_context(viewport=vp, is_mobile=mobil, has_touch=mobil, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers=sw)
    c.add_init_script(CEAS)
    c.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    c.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    c.route('**/*supabase.co/**', raspuns_supabase)
    c.route('**/cdn.onesignal.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=SDK))
    c.route('**/_vercel/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    return c

# ── 0. Datele ──
zile = sorted(V)
rez['date'] = {'zile': len(zile), 'prima': zile[0], 'ultima': zile[-1],
               'stari': {s: sum(1 for z in V.values() if z['stare'] == s) for s in set(z['stare'] for z in V.values())}}
if len(zile) != 92 or zile[0] != '2026-10-01' or zile[-1] != '2026-12-31': problema(f'date: {rez["date"]}')

def norm(t): return re.sub(r'\s+', ' ', t).strip()

with sync_playwright() as p:
    b = p.chromium.launch()
    # ── 1. Calendarul lunar: oct, nov, dec — fiecare zi cu sfinții validați, fără „Se publică…” ──
    for mobil in (True, False):
        disp = 'mobil' if mobil else 'desktop'
        c = context(b, mobil); pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:150]))
        pg.goto(B + '/calendar', wait_until='networkidle'); pg.wait_for_timeout(1500)
        for luna in (10, 11, 12):
            if luna > 10: pg.evaluate('navigheazaCalendar(1)'); pg.wait_for_timeout(1200)
            randuri = pg.evaluate("[...document.querySelectorAll('#lista-sfinti-luna .cal-rand')].map(r=>({nr:+(r.querySelector('.cal-nr')||{}).textContent, sfant:(r.querySelector('.cal-sfant')||{}).innerText||'', marcaj:(r.querySelector('.cal-marcaj')||{}).innerText||'', text:r.innerText}))")
            gresite = []
            for r in randuri:
                iso = f'2026-{luna:02d}-{r["nr"]:02d}'; z = V.get(iso)
                asteptat = norm(z['sfinti']) if z else None
                if not z or not norm(r['sfant']).startswith(asteptat): gresite.append((iso, 'sfinți', r['sfant'][:80]))
                if z and z.get('duminica') and norm(z['duminica']) not in norm(r['sfant']): gresite.append((iso, 'duminica', r['sfant'][:80]))
                if z and norm(r['marcaj']) != norm(z.get('marcaj') or ''): gresite.append((iso, 'marcaj', r['marcaj']))
                if re.search(r'Se publică|Optina|Zi de post', r['text']): gresite.append((iso, 'text interzis', r['text'][:80]))
                for loc in (z or {}).get('locali', []):
                    if loc.split(' din ')[0][-12:] in r['text']: gresite.append((iso, 'pomenire locală afișată', loc))
            ov = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            rez[f'calendar_{disp}_{luna}'] = {'zile_afisate': len(randuri), 'diferente': gresite[:6], 'depasire': ov}
            nr_zile = {10: 31, 11: 30, 12: 31}[luna]
            if len(randuri) != nr_zile or gresite or ov > 2: problema(f'calendar {disp} luna {luna}: {len(randuri)} zile, diferențe {gresite[:4]}, depășire {ov}')
        if err: problema(f'calendar {disp}: erori JS {err}')
        c.close()

    c = context(b, True); pg = c.new_page(); err = []; pg.on('pageerror', lambda e: err.append(str(e)[:150]))
    azi = V['2026-10-11']; nume_azi = azi['sfinti']
    # ── 2. Pagini cu „sfântul zilei”: date din Supabase (greșite intenționat) → se afișează calendarul validat ──
    verif = {}
    for path, sel in [('/', None), ('/calendar-ortodox-azi', '#sfant-azi'), ('/sfantul-zilei', '#sfant-principal'), ('/sinaxar', '#sfant-principal'), ('/sinaxarul-zilei', '#sfant-principal')]:
        pg.goto(B + path, wait_until='networkidle'); pg.wait_for_timeout(1800)
        t = pg.evaluate('document.body.innerText')
        meta = pg.get_attribute('meta[name=description]', 'content') or ''
        titlu = pg.title()
        info = {'nume_validat_vizibil': nume_azi.split(';')[0] in t, 'nume_gresit_vizibil': 'Optina' in t or 'Optina' in meta or 'Optina' in titlu,
                'element': norm(pg.inner_text(sel))[:90] if sel and pg.locator(sel).count() else None, 'meta': meta[:120], 'titlu': titlu[:80]}
        if path == '/sfantul-zilei':
            info['ieri'] = pg.inner_text('#sfant-ieri'); info['maine'] = pg.inner_text('#sfant-maine')
            if not (V['2026-10-10']['sfinti'][:20] in info['ieri'] and V['2026-10-12']['sfinti'][:20] in info['maine']): problema(f'sfântul zilei ieri/mâine: {info}')
        verif[path] = info
        if not info['nume_validat_vizibil'] or info['nume_gresit_vizibil']: problema(f'{path}: {info}')
    rez['pagini_sfant'] = verif
    if err: problema(f'erori JS: {err}')
    # ── 3. SEO calendar ──
    pg.goto(B + '/calendar', wait_until='networkidle')
    rez['seo_calendar'] = {'titlu': pg.title(), 'meta': pg.get_attribute('meta[name=description]', 'content'), 'og': pg.get_attribute('meta[property="og:description"]', 'content')}
    if 'octombrie' not in (rez['seo_calendar']['meta'] or ''): problema(f'SEO calendar: {rez["seo_calendar"]}')
    c.close()

    # ── 4. PWA: datele validate sunt în cache și calendarul merge offline ──
    c = context(b, True, sw='allow'); pg = c.new_page()
    pg.goto(B + '/', wait_until='networkidle'); pg.wait_for_timeout(2500); pg.reload(wait_until='networkidle'); pg.wait_for_timeout(1500)
    pg.goto(B + '/calendar', wait_until='networkidle'); pg.wait_for_timeout(1500)
    rez['pwa_cache'] = pg.evaluate('caches.keys()')
    rez['pwa_date_in_cache'] = pg.evaluate("caches.keys().then(async ks=>{for(const k of ks){const c=await caches.open(k);if(await c.match('/data/calendar-validat-2026-t4.json?v=2'))return k}return null})")
    c.set_offline(True)
    try:
        r = pg.goto(B + '/calendar', wait_until='domcontentloaded', timeout=15000); pg.wait_for_timeout(2500)
        t = pg.evaluate("(document.getElementById('lista-sfinti-luna')||{}).innerText||''")
        rez['offline_calendar'] = {'status': r.status if r else None, 'are_sfinti_validati': V['2026-10-25']['sfinti'][:25] in t, 'se_publica': 'Se publică' in t}
        if not rez['offline_calendar']['are_sfinti_validati']: problema(f'offline calendar: {rez["offline_calendar"]}')
    except Exception as e:
        problema(f'offline calendar: {e}')
    c.set_offline(False)
    if not rez['pwa_date_in_cache']: problema('PWA: fișierul cu calendarul validat nu este în cache')
    c.close(); b.close()

json.dump(rez, open(os.path.join(OUT, 'calendar-t4.json'), 'w'), ensure_ascii=False, indent=1)
print(f'[{ET}] probleme: {len(rez["probleme"])}')
for x in rez['probleme']: print('  - ' + x[:400])
for k in ['date', 'calendar_mobil_10', 'calendar_mobil_11', 'calendar_mobil_12', 'calendar_desktop_12', 'pagini_sfant', 'seo_calendar', 'pwa_cache', 'pwa_date_in_cache', 'offline_calendar']:
    print(f'  {k} = {json.dumps(rez.get(k), ensure_ascii=False)[:500]}')
