# DOAR CITIRE: unde apar pe pagini numele din baza de date care nu sunt în calendarul validat (azi, 11 oct.)
import json, re, urllib.request
from playwright.sync_api import sync_playwright
B = 'https://www.povestidecredinta.ro'
out = []
def log(s): out.append(s); print(s)
SB = 'https://smuqpipxeotkbttolivp.supabase.co'; K = 'sb_publishable_gWS1MsHXjvIMth8yuYAnog_fBiv9DHk'
rq = urllib.request.Request(SB + '/rest/v1/zile_ortodoxe?data_calendaristica=eq.2026-10-11&select=*', headers={'apikey': K, 'Authorization': 'Bearer ' + K})
row = json.loads(urllib.request.urlopen(rq, timeout=30).read())[0]
log('[A] Câmpurile din baza de date (11 oct.) care conțin Optina/Zenaida/Kokkinos/Filonila:')
for k, v in row.items():
    if isinstance(v, (str, list, dict)) and re.search(r'Optina|Zenaida|Kokkinos|Filonila', json.dumps(v, ensure_ascii=False)):
        log(f'    {k}: {json.dumps(v, ensure_ascii=False)[:300]}')
with sync_playwright() as p:
    br = p.chromium.launch()
    c = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, locale='ro-RO', timezone_id='Europe/Bucharest', service_workers='block')
    c.route(re.compile(r'onesignal\.com'), lambda r: r.fulfill(status=200, content_type='application/javascript', body=''))
    for path in ['/', '/sfantul-zilei', '/sfintii-zilei']:
        pg = c.new_page(); pg.goto(B + path, wait_until='networkidle', timeout=60000); pg.wait_for_timeout(2000)
        r = pg.evaluate(r"""() => { const rx=/Optina|Zenaida|Kokkinos|Filonila/; const res=[];
          document.querySelectorAll('body *').forEach(el=>{ if(el.children.length===0 && rx.test(el.textContent) && el.offsetParent!==null) res.push((el.id?'#'+el.id:el.tagName)+' ['+(el.closest('[id]')||{}).id+']: '+el.textContent.trim().slice(0,160)); });
          document.querySelectorAll('meta,title,script[type="application/ld+json"]').forEach(el=>{const t=el.content||el.textContent||''; if(rx.test(t)) res.push(el.tagName+': '+t.slice(0,160));});
          return res.slice(0,12); }""")
        log(f'\n[B] {path}:'); [log('    ' + x) for x in r]
        pg.close()
    br.close()
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
