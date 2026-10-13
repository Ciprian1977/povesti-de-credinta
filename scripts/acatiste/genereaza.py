"""Acatiste din transcrieri ro.wikisource.org marcate {{DP-vechi}} (domeniu public).
Cuvintele rămân ale sursei; se corectează doar greșelile evidente de tastare/diacritice (CORECTURI) și ortografia veche (sânt -> sunt, â -> î la început de cuvânt compus).
Verifică structura: 13 condace, 12 icoase cu câte 12 „Bucură-te” + refren.
Folosire: python3 scripts/acatiste/genereaza.py <slug> <fisier.wiki>   (slug: buna-vestire | sfantul-antonie)
Iese: data/acatiste/<slug>.json"""
import re, sys, json, html
ORTOGRAFIE = [('sântem', 'suntem'), (' sânt ', ' sunt '), ('preaânalt', 'preaînalt'), ('neâncăput', 'neîncăput'), ('neânțelepți', 'neînțelepți'), ('neâmpuținată', 'neîmpuținată')]
CONFIG = {
  'buna-vestire': dict(
    sursa='https://ro.wikisource.org/wiki/Acatistul_Buneivestiri', refren='Bucură-te, Mireasă, pururea fecioară!',
    lipite=[('luminezi sufletele; Bucură-te ceea ce', 'luminezi sufletele;\nBucură-te, ceea ce')],
    corecturi=[('ceea ești fără de prihană', 'ceea ce ești fără de prihană'), ('Bucură-te, mireasă, pururea fecioară!', 'Bucură-te, Mireasă, pururea fecioară!')]),
  'sfantul-antonie': dict(
    sursa='https://ro.wikisource.org/wiki/Acatistul_Sfântului_Antonie_cel_Mare', refren='Bucură-te, Părinte Antonie, de Dumnezeu cugetătorule!',
    lipite=[], corecturi=[(' :', ':'), ('minune !', 'minune!'), ('înspăimanti', 'înspăimânți'), (' decat ', ' decât '), ('cunoștinta', 'cunoștința'),
      ('întelepți', 'înțelepți'), ('l-ai facut', 'l-ai făcut'), ('luceafar ', 'luceafăr '), ('deopotriva', 'deopotrivă'), ('povatuit', 'povățuit'),
      ('greșiti', 'greșiți'), ('înalțarea', 'înălțarea'), ('a vazut', 'a văzut'), ('A doua oara', 'A doua oară'), ('eresurior', 'eresurilor'),
      ('pe ucenici tăi', 'pe ucenicii tăi'), ('următorule ai înțelepțiților', 'următorule al înțelepțiților'), ('dumnezeiască viață ta', 'dumnezeiasca viață a ta'),
      ('întreit-sfânta', 'întreit-sfântă'), ('te lauda pe tine', 'te laudă pe tine'), ('pastor', 'păstor'), ('ucenicilor tai', 'ucenicilor tăi'),
      ('preaintelepte', 'preaînțelepte'), ('parintilor', 'părinților'), ('primeste', 'primește'), ('cantăm', 'cântăm'), ('cântam ție', 'cântăm ție'),
      ('în oraț', 'în oraș')]),
}
def main(slug, f):
    C = CONFIG[slug]; REFREN = C['refren']
    w = open(f, encoding='utf8').read()
    for a, b in C['lipite']: assert a in w, a; w = w.replace(a, b)
    w = w[w.index('<poem>') + 6: w.index('</poem>') if '</poem>' in w else w.index('[[Categorie')]
    def curata(t):
        for a, b in C['corecturi'] + ORTOGRAFIE: t = t.replace(a, b)
        return re.sub(r'\s+', ' ', t).strip()
    e = lambda t: html.escape(t, quote=False)
    blocuri, cur = [], None
    for l in w.split('\n'):
        l = curata(l.replace("'''", ''))
        if not l: continue
        m = re.match(r'^(Condac|Icos)\w*\s+(?:al\s+)?(\d+)', l)
        if m and len(l) < 40:
            cur = {'tip': m.group(1).lower(), 'nr': int(m.group(2)), 'linii': []}; blocuri.append(cur); continue
        if re.match(r'^(Și\s+)?Condac\w* întâi', l): cur = None; continue          # repetarea Condacului 1 de la final
        if l.startswith('Rugăciune către'):
            cur = {'tip': 'rugaciune', 'titlu': l.rstrip(':'), 'linii': []}; blocuri.append(cur); continue
        if cur: cur['linii'].append(l)
    out = []
    for b in blocuri:
        L = b['linii']
        if b['tip'] == 'condac':
            if b['nr'] == 13:   # după Condacul 13 sursa repetă Icosul 1 și Condacul 1: păstrăm doar îndrumarea
                k = next((i for i, x in enumerate(L) if re.match(r'^(După aceasta|Apoi)', x)), len(L))
                t = e(' '.join(L[:k]))
                t = re.sub(r'\s*\((acest condac se zice de trei ori)\)', lambda m: ' <em>(' + m.group(1)[0].upper() + m.group(1)[1:] + ')</em>', t, flags=re.I)
                t += '<br><br><em>Apoi se zice iarăși Icosul 1 și Condacul 1' + (', și apoi rugăciunea.' if any(x['tip'] == 'rugaciune' for x in blocuri) else '.') + '</em>'
            else: t = e(' '.join(L))
            out.append({'tip': 'condac', 'nr': b['nr'], 'text': t})
        elif b['tip'] == 'icos':
            i = next(k for k, x in enumerate(L) if x.startswith('Bucură-te,'))
            buc = L[i:]
            assert buc[-1] == REFREN and len(buc) == 13, (b['nr'], len(buc), buc[-1])
            out.append({'tip': 'icos', 'nr': b['nr'], 'intro': e(' '.join(L[:i])),
                        'bucurate': [e(re.sub(r'^Bucură-te,\s*', '', x).rstrip(' ;')) for x in buc[:-1]], 'refren': REFREN})
        else:
            out.append({'tip': 'rugaciune', 'titlu': b['titlu'], 'text': '<br><br>'.join(e(x) for x in L)})
    tips = [(x['tip'], x.get('nr')) for x in out if x['tip'] != 'rugaciune']
    assert tips == [t for n in range(1, 13) for t in (('condac', n), ('icos', n))] + [('condac', 13)], tips
    json.dump({'sursa': C['sursa'], 'licenta': 'domeniu public ({{DP-vechi}} pe Wikisource)', 'sectiuni': out},
              open(f'data/acatiste/{slug}.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    return out
if __name__ == '__main__':
    print(len(main(sys.argv[1], sys.argv[2])), 'secțiuni')
