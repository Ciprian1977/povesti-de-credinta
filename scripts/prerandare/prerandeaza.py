"""Pre-randare zilnică a lecturilor (Evanghelia și Apostolul zilei) direct în HTML, ca Google să vadă textul zilei
fără să ruleze JavaScript. Deschide paginile din depozit (server local) cu datele reale din Supabase, exact cum le
vede un vizitator (aceeași corectură, același text din Biblia 1914), apoi scrie în fișierele HTML:
titlul, descrierea, data, referința și textul lecturii. Dacă ceva nu e în regulă, fișierul NU se modifică.
Folosire: python3 scripts/prerandare/prerandeaza.py   (din rădăcina depozitului)"""
import os, re, sys, json, threading, http.server, socketserver, datetime, html
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright

ROOT = os.getcwd()
AZI = datetime.datetime.now(ZoneInfo('Europe/Bucharest')).date()
LUNI = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
ZILE = ['luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă', 'duminică']
DATA_TXT = f'{ZILE[AZI.weekday()]}, {AZI.day} {LUNI[AZI.month - 1]} {AZI.year}'
PAGINI = {
    'evanghelia-zilei/index.html': dict(ruta='/evanghelia-zilei', ref='ev-referinta', text='ev-text', nume='Evanghelia zilei'),
    'apostolul-zilei/index.html': dict(ruta='/apostolul-zilei', ref='apostol-referinta', text='apostol-text', nume='Apostolul zilei'),
}

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(s, *a): pass
    def send_head(s):
        p = s.path.split('?')[0]
        fp = os.path.join(ROOT, p.lstrip('/'))
        if os.path.isdir(fp) and os.path.exists(os.path.join(fp, 'index.html')): s.path = p.rstrip('/') + '/index.html'
        elif os.path.exists(fp + '.html'): s.path = p + '.html'
        return super().send_head()

def interval_element(src, id_):
    """(început conținut, sfârșit conținut) pentru elementul cu id-ul dat, ținând cont de etichetele imbricate."""
    m = re.search(r'<(\w+)\b[^>]*\bid="' + re.escape(id_) + r'"[^>]*>', src)
    if not m: return None
    tag, i, adanc = m.group(1), m.end(), 1
    rx = re.compile(r'<(/?)' + tag + r'\b[^>]*?(/?)>', re.I)
    for t in rx.finditer(src, i):
        if t.group(2): continue
        adanc += -1 if t.group(1) else 1
        if adanc == 0: return (i, t.start())
    return None

def inlocuieste(src, id_, continut):
    r = interval_element(src, id_)
    if not r: raise ValueError('lipsește #' + id_)
    return src[:r[0]] + continut + src[r[1]:]

def main():
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    B = f'http://127.0.0.1:{srv.server_address[1]}'
    rez = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        c = b.new_context(locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
        test = os.environ.get('PDC_RAND_TEST')  # doar pentru teste locale: rândul din baza de date, ca JSON
        def ruta(r):
            u = r.request.url
            if test and 'supabase.co' in u: return r.fulfill(status=200, content_type='application/json', body=test)
            if u.startswith(B) or 'supabase.co' in u: return r.continue_()
            return r.fulfill(status=200, body='')
        c.route('**/*', ruta)
        for fis, P in PAGINI.items():
            pg = c.new_page()
            pg.goto(B + P['ruta'], wait_until='networkidle')
            try:
                pg.wait_for_function("id => { const e = document.getElementById(id); return e && e.querySelector('.lectura-sursa') && e.innerText.length > 200 && !/Pregătim|Se încarcă/.test(e.innerText); }", arg=P['text'], timeout=30000)
            except Exception:
                rez.append(f'⚠️ {fis}: textul nu s-a încărcat — fișierul rămâne neschimbat'); pg.close(); continue
            pg.wait_for_timeout(1500)
            d = pg.evaluate("""a => ({ ref: document.getElementById(a.ref).innerText.trim(), text: document.getElementById(a.text).innerHTML.trim(),
                txt: document.getElementById(a.text).innerText })""", P)
            pg.close()
            ref = re.sub(r'\s+', ' ', d['ref'])
            if not re.search(r'\d', ref) or 'nu este disponibil' in d['txt'] or len(d['txt']) < 200 or '<script' in d['text'].lower():
                rez.append(f'⚠️ {fis}: verificarea a eșuat (ref={ref!r}) — fișierul rămâne neschimbat'); continue
            src = open(fis, encoding='utf8').read(); nou = src
            titlu = f"{P['nume']} de azi, {DATA_TXT} — {ref} | Povești de Credință"
            desc = f"{P['nume']} de azi, {DATA_TXT}: {ref}. Textul integral după Biblia 1914 (Ediția Sfântului Sinod)."
            nou = re.sub(r'(<title id="meta-title">)[^<]*(</title>)', lambda m: m.group(1) + html.escape(titlu, quote=False) + m.group(2), nou, count=1)
            nou = re.sub(r'(<meta name="description" id="meta-desc" content=")[^"]*(")', lambda m: m.group(1) + html.escape(desc) + m.group(2), nou, count=1)
            nou = inlocuieste(nou, 'hero-data', html.escape(DATA_TXT[0].upper() + DATA_TXT[1:]))
            nou = inlocuieste(nou, 'data-completa', html.escape(DATA_TXT[0].upper() + DATA_TXT[1:]))
            nou = inlocuieste(nou, P['ref'], html.escape(ref))
            nou = inlocuieste(nou, P['text'], '\n      ' + d['text'] + '\n    ')
            if nou != src:
                open(fis, 'w', encoding='utf8').write(nou)
                rez.append(f'✅ {fis}: {ref} ({len(d["txt"])} caractere)')
            else:
                rez.append(f'= {fis}: neschimbat')
        b.close()
    print(f'Pre-randare pentru {DATA_TXT}:'); print('\n'.join(rez))

if __name__ == '__main__':
    main()
