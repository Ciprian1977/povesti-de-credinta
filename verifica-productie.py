# DOAR CITIRE: Ceaslovul + Crezul ortodox + Psaltirea (Biblia 1914) de pe ro.wikisource. Nicio scriere.
import json, urllib.request, urllib.parse, os, time
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json', formatversion=2)
    return json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p), headers=UA), timeout=60))
os.makedirs('out/rug', exist_ok=True); out = []
for t in ['Ceaslovul', 'Crezul ortodox', 'Biblia 1914/Psaltirea']:
    time.sleep(10)
    try:
        d = api(action='query', titles=t, prop='revisions|categories|templates', rvprop='content|timestamp|user', rvslots='main', cllimit=50, tllimit=50)
        pg = d['query']['pages'][0]; w = pg['revisions'][0]['slots']['main']['content']
        open('out/rug/' + t.replace('/', '_') + '.wiki', 'w').write(w)
        out.append(f"### {t}: {len(w)} caractere; categorii={[c['title'] for c in pg.get('categories', [])]}; șabloane={[x['title'] for x in pg.get('templates', [])][:12]}; autor={pg['revisions'][0]['user']}")
    except Exception as e: out.append(f'### {t}: EROARE {e}')
time.sleep(10)
try:
    d = api(action='query', list='allpages', apprefix='Ceaslovul/', aplimit=200); out.append('### subpagini Ceaslovul: ' + ' | '.join(x['title'] for x in d['query']['allpages']))
except Exception as e: out.append(f'subpagini EROARE {e}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
