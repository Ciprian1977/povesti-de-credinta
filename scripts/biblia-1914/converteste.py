"""Transformă wikitextul Bibliei 1914 (Ediția Sfântului Sinod, domeniu public; transcriere ro.wikisource.org)
în fișiere JSON statice pentru site: data/biblia-1914/<carte>.json = {"capitol": {"verset": "text"}}.
Grafia e modernizată minim, fără a schimba cuvintele: s’au → s-au, aveà → avea (accentele grave de citire scoase).
Folosire: python3 scripts/biblia-1914/converteste.py <dosar-wikitext> <dosar-iesire>"""
import re, sys, os, json, unicodedata

CARTI = {  # titlul paginii Wikisource -> numele fișierului
    'Matei': 'matei', 'Marcu': 'marcu', 'Luca': 'luca', 'Ioan': 'ioan', 'Faptele Apostolilor': 'fapte', 'Romani': 'romani',
    '1 Corinteni': '1-corinteni', '2 Corinteni': '2-corinteni', 'Galateni': 'galateni', 'Efeseni': 'efeseni', 'Filippiseni': 'filipeni',
    'Colaseni': 'coloseni', '1 Tesalonicheni': '1-tesaloniceni', '2 Tesalonicheni': '2-tesaloniceni', '1 Timotei': '1-timotei',
    '2 Timotei': '2-timotei', 'Tit': 'tit', 'Filimon': 'filimon', 'Evrei': 'evrei', 'Iacov': 'iacov', '1 Petru': '1-petru',
    '2 Petru': '2-petru', '1 Ioan': '1-ioan', '2 Ioan': '2-ioan', '3 Ioan': '3-ioan', 'Iuda': 'iuda'}

GRAVE = str.maketrans('àèìòùÀÈÌÒÙ', 'aeiouAEIOU')

def modernizeaza(t):
    t = unicodedata.normalize('NFC', t)
    t = re.sub(r"(?<=\w)[’'](?=\w)", '-', t)          # s’au -> s-au, într’însul -> într-însul
    t = re.sub(r"\b([Mm]ai) [’']nainte", r'\1-nainte', t)  # mai ’nainte -> mai-nainte
    t = t.translate(GRAVE)                               # aveà -> avea, ștì -> ști
    return t

def curata(t, v):
    t = re.sub(r'<div[^>]*>.*?</div>', '', t, flags=re.S)                  # trimiteri marginale
    t = re.sub(r'<center>.*?</center>', '', t, flags=re.S)                  # rezumatele capitolelor (nu sunt text biblic)
    t = re.sub(r'\[\[[^\]|]*\|([^\]]*)\]\]', r'\1', t); t = re.sub(r'\[\[([^\]]*)\]\]', r'\1', t)
    t = re.sub(r'<[^>]+>', '', t); t = re.sub(r"'{2,}", '', t)
    t = ' '.join(t.split())
    t = re.sub(r'^\d{1,3}\.?\s+(?=[A-ZĂÂÎȘŞȚŢ„(])', '', t)                 # numărul versetului rămas în text (și greșelile de tipar)
    return modernizeaza(t)

def converteste(w):
    w = w.split('==', 1)[1] if '==' in w else w                             # fără antetul {{titlu}}
    w = re.sub(r'\n==[^=\n]+==\n', '\n', w)
    rez, prob = {}, []
    bucati = re.split(r'<span id="(\d+)\.(\d+)"\s*/>', w)
    for i in range(1, len(bucati), 3):
        c, v, t = int(bucati[i]), int(bucati[i + 1]), curata(bucati[i + 2], int(bucati[i + 1]))
        if not t: prob.append(f'{c}.{v} gol')
        if str(v) in rez.get(str(c), {}): prob.append(f'{c}.{v} dublat')
        rez.setdefault(str(c), {})[str(v)] = t
    for c, vs in rez.items():
        n = sorted(map(int, vs))
        if n != list(range(1, len(n) + 1)): prob.append(f'cap. {c}: numerotare cu goluri {[x for x in range(1, max(n) + 1) if x not in n][:10]}')
    if sorted(map(int, rez)) != list(range(1, len(rez) + 1)): prob.append(f'capitole lipsă: {sorted(map(int, rez))}')
    return rez, prob

# Ediția 1914 numerotează în câteva locuri altfel decât edițiile de azi, după care sunt date referințele pericopelor.
# Textul NU se schimbă; doar numerotarea se aliniază:
#  ('gol', carte, cap, v): versetul v (1914) cuprinde și versetul următor de azi -> se inserează un verset gol după el
#  ('uneste', carte, cap, v): versetele v și v+1 (1914) sunt un singur verset azi -> se unesc
ALINIERE = [('gol', 'matei', 1, 22),       # Mt 1, 22 cuprinde și „Iată fecioara…” (azi 1, 23)
            ('gol', 'matei', 22, 37),      # Mt 22, 37 cuprinde și „Aceasta este întâi și mai mare poruncă” (azi 22, 38)
            ('uneste', 'fapte', 3, 19),    # Fapte 3, 19-20 (1914) = 3, 19 azi
            ('gol', '2-corinteni', 7, 15)] # 2 Cor 7, 15 cuprinde și „Mă bucur…” (azi 7, 16)

def aliniaza(slug, rez):
    for op, b, c, v in ALINIERE:
        if b != slug: continue
        cap = rez[str(c)]; vs = [cap[str(i)] for i in range(1, len(cap) + 1)]
        if op == 'gol': vs.insert(v, '')
        else: vs[v - 1] = vs[v - 1] + ' ' + vs[v]; del vs[v]
        rez[str(c)] = {str(i + 1): t for i, t in enumerate(vs)}
    return rez

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    total = 0
    for titlu, slug in CARTI.items():
        f = os.path.join(src, titlu + '.wiki')
        if not os.path.exists(f): print(f'LIPSĂ {titlu}'); continue
        rez, prob = converteste(open(f, encoding='utf8').read())
        rez = aliniaza(slug, rez)
        nv = sum(len(x) for x in rez.values()); total += nv
        json.dump(rez, open(os.path.join(dst, slug + '.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        print(f'{titlu:18} cap={len(rez):3} versete={nv:5} {"OK" if not prob else prob[:6]}')
    print('total versete:', total)
