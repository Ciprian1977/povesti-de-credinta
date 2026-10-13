"""Acatistul Bunei Vestiri din transcrierea ro.wikisource.org/wiki/Acatistul_Buneivestiri (marcată {{DP-vechi}}, domeniu public).
Cuvintele rămân ale sursei; se corectează doar greșelile evidente de tastare din CORECTURI.
Iese: data/acatiste/buna-vestire.json (secțiunile în formatul din js/acatiste-data.js).
Folosire: python3 scripts/acatiste/genereaza-buna-vestire.py <Acatistul_Buneivestiri.wiki>"""
import re, sys, json, html
CORECTURI = [('ceea ești fără de prihană', 'ceea ce ești fără de prihană'),
  # ortografie actuală, ca la Biblia 1914 (aceleași cuvinte)
  ('sântem', 'suntem'), (' sânt ', ' sunt '), ('preaânalt', 'preaînalt'), ('neâncăput', 'neîncăput'), ('neânțelepți', 'neînțelepți'), ('neâmpuținată', 'neîmpuținată'),
  ('Bucură-te, mireasă, pururea fecioară!', 'Bucură-te, Mireasă, pururea fecioară!')]
REFREN = 'Bucură-te, Mireasă, pururea fecioară!'
def curata(t):
    for a, b in CORECTURI: t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip()
def e(t): return html.escape(t, quote=False)
def main(f):
    w = open(f, encoding='utf8').read()
    w = w.replace('luminezi sufletele; Bucură-te ceea ce', 'luminezi sufletele;\nBucură-te, ceea ce')  # două rânduri lipite în sursă
    w = w[w.index('<poem>') + 6: w.index('</poem>') if '</poem>' in w else w.index('[[Categorie')]
    blocuri, cur = [], None
    for l in w.split('\n'):
        l = curata(l.replace("'''", ''))
        if not l: continue
        m = re.match(r'^(Condacul|Icosul)\s+(?:al\s+)?(\d+)', l)
        if m and len(l) < 40:
            cur = {'tip': m.group(1).lower().replace('condacul', 'condac').replace('icosul', 'icos'), 'nr': int(m.group(2)), 'linii': []}; blocuri.append(cur); continue
        if l.startswith('Rugăciune către'):
            cur = {'tip': 'rugaciune', 'titlu': l.rstrip(':'), 'linii': []}; blocuri.append(cur); continue
        if cur: cur['linii'].append(l)
    out = []
    for b in blocuri:
        L = b['linii']
        if b['tip'] == 'condac':
            t = ' '.join(L)
            t = e(t).replace('(acest Condac se zice de trei ori)', '<em>(acest Condac se zice de trei ori)</em>')
            m = re.search(r'\s*(După aceasta se zice iarăși.*)$', t)
            if m: t = t[:m.start()] + '<br><br><em>' + m.group(1) + ' rugăciune:</em>'
            out.append({'tip': 'condac', 'nr': b['nr'], 'text': t})
        elif b['tip'] == 'icos':
            i = next(k for k, x in enumerate(L) if x.startswith('Bucură-te,'))
            buc = [x for x in L[i:]]
            assert buc[-1] == REFREN, (b['nr'], buc[-1])
            assert len(buc) == 13, (b['nr'], len(buc))
            out.append({'tip': 'icos', 'nr': b['nr'], 'intro': e(' '.join(L[:i])),
                        'bucurate': [e(re.sub(r'^Bucură-te,\s*', '', x).rstrip(' ;')) for x in buc[:-1]], 'refren': REFREN})
        else:
            out.append({'tip': 'rugaciune', 'titlu': b['titlu'], 'text': '<br><br>'.join(e(x) for x in L)})
    tips = [(x['tip'], x.get('nr')) for x in out]
    assert tips == [t for n in range(1, 13) for t in (('condac', n), ('icos', n))] + [('condac', 13), ('rugaciune', None)], tips
    return out
if __name__ == '__main__':
    s = main(sys.argv[1])
    json.dump({'sursa': 'https://ro.wikisource.org/wiki/Acatistul_Buneivestiri', 'licenta': 'domeniu public ({{DP-vechi}} pe Wikisource)', 'sectiuni': s},
              open('data/acatiste/buna-vestire.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(len(s), 'secțiuni')
