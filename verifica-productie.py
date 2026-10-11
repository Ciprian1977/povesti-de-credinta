# DOAR CITIRE: descarcă wikitextul cărților Noului Testament din Biblia 1914 (Wikisource, domeniu public). Nicio scriere pe site.
import json, urllib.request, urllib.parse, os, time
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
CARTI = ['1 Petru', '2 Petru', '1 Ioan', '2 Ioan', '3 Ioan', 'Iuda']
os.makedirs('out/biblia1914', exist_ok=True); out = []
for c in CARTI:
  try:
    u = 'https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', titles='Biblia 1914/' + c, prop='revisions', rvprop='content|ids|timestamp', rvslots='main', format='json', formatversion=2))
    d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
    pg = d['query']['pages'][0]; rv = pg['revisions'][0]
    open(f'out/biblia1914/{c}.wiki', 'w').write(rv['slots']['main']['content'])
    out.append(f"{c}\trevid={rv['revid']}\t{rv['timestamp']}\t{len(rv['slots']['main']['content'])}")
    time.sleep(8)
  except Exception as e:
    out.append(f'{c}\tEROARE {type(e).__name__}: {str(e)[:200]} | {json.dumps(d, ensure_ascii=False)[:300] if "d" in dir() else ""}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
