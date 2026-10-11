# DOAR CITIRE: formatul textului Biblia 1914 pe Wikisource + licența. Nicio scriere.
import json, urllib.request, urllib.parse, re, os
out = []
def log(s): out.append(str(s)); print(s)
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json', formatversion=2)
    return json.load(urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p), headers=UA), timeout=30))
os.makedirs('out/biblia1914', exist_ok=True)
for carte in ['Luca', 'Galateni', 'Matei', 'Ioan', 'Faptele Apostolilor', 'Evrei']:
    d = api(action='parse', page='Biblia 1914/' + carte, prop='wikitext|templates|categories')
    w = d['parse']['wikitext']
    open(f'out/biblia1914/{carte}.wiki', 'w').write(w)
    log(f'\n===== {carte}: {len(w)} caractere; șabloane={[t["title"] for t in d["parse"].get("templates", [])][:15]}; categorii={[c["category"] for c in d["parse"].get("categories", [])][:10]}')
    log(w[:1500])
    i = w.find('Capitolul 8') if carte == 'Luca' else w.find('Capitolul 2') if carte == 'Galateni' else -1
    if i > 0: log('----- fragment -----\n' + w[i:i+4000])
d = api(action='query', titles='Biblia 1914/Luca', prop='info|revisions', rvprop='user|timestamp|comment', rvlimit=5)
log('\n[istoric] ' + json.dumps(d['query']['pages'][0].get('revisions', []), ensure_ascii=False)[:800])
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
