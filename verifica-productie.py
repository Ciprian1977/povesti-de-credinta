# DOAR CITIRE: explorarea sursei Biblia 1914 pe Wikisource (API public MediaWiki). Nicio scriere.
import json, urllib.request, urllib.parse, re
out = []
def log(s): out.append(str(s)); print(s)
UA = {'User-Agent': 'povestidecredinta-cercetare/1.0 (contact: site povestidecredinta.ro)'}
def api(**p):
    p.update(format='json', formatversion=2)
    u = 'https://ro.wikisource.org/w/api.php?' + urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
try:
    r = urllib.request.urlopen(urllib.request.Request('https://ro.wikisource.org/robots.txt', headers=UA), timeout=30).read().decode()
    log('[robots] api.php interzis? ' + str(bool(re.search(r'Disallow:\s*/w/api\.php', r))))
except Exception as e: log('[robots] ' + str(e))
pagini = []; cont = {}
while True:
    d = api(action='query', list='allpages', apprefix='Biblia 1914/', apnamespace=0, aplimit=500, **cont)
    pagini += [x['title'] for x in d['query']['allpages']]
    if 'continue' not in d: break
    cont = {'apcontinue': d['continue']['apcontinue']}
log(f'[pagini] {len(pagini)}'); log('\n'.join(pagini[:400]))
for t in ['Biblia 1914', 'Biblia 1914/Evanghelia după Luca', 'Biblia 1914/Evanghelia după Luca/8', 'Biblia 1914/Epistola către Galateni']:
    try:
        d = api(action='parse', page=t, prop='wikitext')
        w = d['parse']['wikitext']; log(f'\n===== {t} ({len(w)} caractere) =====\n' + w[:2500])
    except Exception as e: log(f'\n===== {t}: {e}')
open('out/productie.txt', 'w').write('\n'.join(out) + '\n')
