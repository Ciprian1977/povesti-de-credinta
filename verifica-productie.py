# DOAR CITIRE: caută pe ro.wikisource textele rugăciunilor mesei (Ceaslov). Nicio scriere.
import json, urllib.request, urllib.parse, os, time
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json', formatversion=2)
    for i in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p), headers=UA), timeout=60))
        except Exception as e: time.sleep(8 * (i + 1)); err = e
    raise err
os.makedirs('out/rug', exist_ok=True); L = []; titluri = []
for q in ['"binecuvântează mâncarea și băutura"', '"ne-ai săturat pe noi"', '"Mânca-vor săracii"', '"Veselitu-ne-ai"', 'rugăciunile mesei', 'rugăciune înainte de masă', 'insource:"bunătățile Tale cele pământești"', 'Ceaslov']:
    d = api(action='query', list='search', srsearch=q, srlimit=10, srnamespace='0|104|106'); time.sleep(3)
    r = [(x['title'], x['snippet'][:160]) for x in d['query']['search']]
    L.append(f'== {q}: {len(r)}'); L += [f'   {t} | {s}' for t, s in r]
    titluri += [t for t, _ in r[:3] if 'mas' in (t + _).lower() or 'mânc' in (t + _).lower() or 'sătur' in (t + _).lower()]
for t in list(dict.fromkeys(titluri))[:6]:
    d = api(action='query', titles=t, prop='revisions|categories|templates', rvprop='content', rvslots='main', cllimit=50, tllimit=30); time.sleep(4)
    pg = d['query']['pages'][0]
    if 'revisions' in pg:
        w = pg['revisions'][0]['slots']['main']['content']; open('out/rug/' + t.replace('/', '_') + '.wiki', 'w').write(w)
        L.append(f'## {t}: {len(w)} car.; categorii={[c["title"] for c in pg.get("categories", [])]}; șabloane={[x["title"] for x in pg.get("templates", [])][:8]}')
open('out/productie.txt', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L))
