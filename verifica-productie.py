# DOAR CITIRE: „Rugăciuni de seară” de pe ro.wikisource (perechea paginii Ceaslovul). Nicio scriere.
import json, urllib.request, urllib.parse, os
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
p = dict(action='query', titles='Rugăciuni de seară', prop='revisions|categories|templates', rvprop='content|user', rvslots='main', cllimit=50, tllimit=50, format='json', formatversion=2)
d = json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p), headers=UA), timeout=60))
pg = d['query']['pages'][0]; w = pg['revisions'][0]['slots']['main']['content']
os.makedirs('out/rug', exist_ok=True); open('out/rug/Rugaciuni_de_seara.wiki', 'w').write(w)
open('out/productie.txt', 'w').write(f"{len(w)} caractere; categorii={[c['title'] for c in pg.get('categories', [])]}; șabloane={[x['title'] for x in pg.get('templates', [])][:8]}\n")
