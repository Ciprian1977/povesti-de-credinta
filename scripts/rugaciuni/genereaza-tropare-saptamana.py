"""Troparele și condacele de peste săptămână (Octoih) din ro.wikisource.org/wiki/Troparele_de_peste_săptămână
(marcat {{DP-vechi}}, domeniu public). Textul rămâne neschimbat.
Iese: data/tropare/tropare-saptamana.json și blocul TROPARE_SAPTAMANA din js/corectura-provizorie.js.
Folosire: python3 scripts/rugaciuni/genereaza-tropare-saptamana.py data/tropare/troparele-de-peste-saptamana.wiki"""
import re, sys, json
ZI = {'Luni': 1, 'Marți': 2, 'Miercuri': 3, 'Joi': 4, 'Vineri': 5, 'Sâmbăta': 6}
TEMA = {1: 'Sfinții Îngeri', 2: 'Sfântul Ioan Botezătorul', 3: 'Sfânta Cruce', 4: 'Sfinții Apostoli și Sfântul Ierarh Nicolae',
        5: 'Sfânta Cruce', 6: 'Toți Sfinții și cei adormiți'}
def main(f):
    w = open(f, encoding='utf8').read()
    w = w[w.index('}}') + 2: w.index('[[Categorie')]
    zile, cur, sectiune = {}, None, None
    for l in w.split('\n'):
        l = l.strip()
        if not l: continue
        m = re.fullmatch(r"'''(\w+)'''", l)
        if m and m.group(1) in ZI:
            cur = {'tropare': [], 'condace': []}; zile[ZI[m.group(1)]] = cur; sectiune = None; continue
        if cur is None: continue
        if l.startswith("''"):
            et = l.strip("'").rstrip(':').strip().rstrip("'").rstrip(':')
            sectiune = 'condace' if 'ondac' in et else ('tropare' if ('ropar' in et or et.startswith('Slavă')) else None)
            if sectiune: cur[sectiune].append({'eticheta': et.replace("''", ''), 'text': ''})
            continue
        if l.startswith('Se cântă'): continue
        if l == 'și acum...':
            cur['condace'].append({'eticheta': 'Și acum..., glasul al 8-lea', 'text': ''}); sectiune = 'condace'; continue
        if sectiune and cur[sectiune]:
            x = cur[sectiune][-1]; x['text'] = (x['text'] + ' ' + l).strip()
    for z, d in zile.items():
        d['tema'] = TEMA[z]
        for k in ('tropare', 'condace'):
            for x in d[k]:
                if x['text'] and x['text'][-1] not in '.!?': x['text'] += '.'
    assert sorted(zile) == [1, 2, 3, 4, 5, 6] and all(d['tropare'] for d in zile.values()), zile.keys()
    return zile
if __name__ == '__main__':
    z = main(sys.argv[1])
    out = {'sursa': 'https://ro.wikisource.org/wiki/Troparele_de_peste_săptămână', 'licenta': 'domeniu public ({{DP-vechi}} pe Wikisource)', 'zile': z}
    json.dump(out, open('data/tropare/tropare-saptamana.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    js = open('js/corectura-provizorie.js', encoding='utf8').read()
    bloc = '/*TROPARE_SAPTAMANA*/' + json.dumps({str(k): v for k, v in z.items()}, ensure_ascii=False) + '/*SFARSIT*/'
    js2 = re.sub(r'/\*TROPARE_SAPTAMANA\*/.*?/\*SFARSIT\*/', lambda m: bloc, js, flags=re.S)
    assert js2 != js or bloc in js, 'lipsește marcajul în js/corectura-provizorie.js'
    open('js/corectura-provizorie.js', 'w', encoding='utf8').write(js2)
    for k, v in z.items(): print(k, v['tema'], [x['eticheta'] for x in v['tropare']], [x['eticheta'] for x in v['condace']])
