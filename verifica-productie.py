# DOAR CITIRE: caută pe ro.wikisource surse libere pentru rugăciunile dimineții (Ceaslov, Crez, Psalmul 50). Nicio scriere.
import json, urllib.request, urllib.parse, os, time
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json', formatversion=2)
    return json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p), headers=UA), timeout=60))
out = []
for q in ['Rugăciunile dimineții', 'Ceaslov', 'Simbolul credinței', 'Crezul', 'Rugăciunea Sfântului Macarie', 'Rugăciunile de dimineață', 'Psalmul 50', 'Molitvelnic', 'Rugăciunile începătoare']:
    try:
        d = api(action='query', list='search', srsearch=q, srlimit=10, srnamespace=0)
        out.append(f'### {q}: ' + ' | '.join(x['title'] for x in d['query']['search']))
    except Exception as e: out.append(f'### {q}: EROARE {e}')
    time.sleep(2)
for pref in ['Ceaslov', 'Rugăciuni', 'Rugăciunea', 'Molitvelnic']:
    try:
        d = api(action='query', list='allpages', apprefix=pref, aplimit=100); out.append(f'### allpages {pref}: ' + ' | '.join(x['title'] for x in d['query']['allpages']))
    except Exception as e: out.append(f'### allpages {pref}: EROARE {e}')
    time.sleep(2)
os.makedirs('out/rug', exist_ok=True)
try:
    d = api(action='query', titles='Biblia 1914/Psaltirea', prop='revisions', rvprop='content', rvslots='main')
    open('out/rug/Psaltirea.wiki', 'w').write(d['query']['pages'][0]['revisions'][0]['slots']['main']['content']); out.append('Psaltirea descărcată')
except Exception as e: out.append(f'Psaltirea EROARE {e}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
