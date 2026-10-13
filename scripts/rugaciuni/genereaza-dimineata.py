"""Rugăciunile dimineții (rânduiala completă din Ceaslov) din transcrierea ro.wikisource.org/wiki/Ceaslovul (marcată domeniu public)
și Crezul din ro.wikisource.org/wiki/Crezul_ortodox. Corectează doar greșelile evidente de tastare/diacritice ale transcrierii
(lista CORECTURI), fără a schimba cuvintele. Iese: data/rugaciuni/dimineata.html (fragment HTML) + .json.
Folosire: python3 scripts/rugaciuni/genereaza-dimineata.py <Ceaslovul.wiki> <Crezul ortodox.wiki>"""
import re, sys, json, html, os
CORECTURI = [('Dumnenzeul', 'Dumnezeul'), ('Mângăietorule', 'Mângâietorule'), ('bunătătilor', 'bunătăților'), ('împarația', 'împărăția'),
  ('ppcatul', 'păcatul'), ('m-am zamislit', 'm-am zămislit'), ('în pacate', 'în păcate'), ('bucuria măntuirii', 'bucuria mântuirii'),
  ('mă întareste', 'mă întărește'), ('Duhul Tau', 'Duhul Tău'), ('Fa bine', 'Fă bine'), ('Însusi', 'Însuși'), ('întelepte', 'înțelepte'),
  ('miluieste', 'miluiește'), ('apoi rugăciune aceasta', 'apoi rugăciunea aceasta'), ('aceast ceas', 'acest ceas'), ('Curătește', 'Curățește'),
  ('nepuțintelor', 'neputințelor'), ('neasemanate', 'neasemănate'), ('în liniste', 'în liniște'), ('izbavește-mă de toată ispitirea', 'izbăvește-mă de toată ispitirea'),
  ('preaslavesc', 'preaslăvesc'), ("n-am facut nici un bine inaintea", "n-am făcut nici un bine înaintea"), ('pomenește-ma', 'pomenește-mă'),
  ('necuvântatoare', 'necuvântătoare'), ('nadejdea', 'nădejdea'), ('ca n-am alt ajutor', 'că n-am alt ajutor'), ('mai marită', 'mai mărită'),
  ('ticălosul robul Tău, deznădăjduirea', 'ticălosul robul tău, deznădăjduirea'), ('Mai vârtos mă spală', 'Mai vârtos mă spală')]
RUBRICA = re.compile(r'^(Sculându-te din somn|După aceasta|Iar de nu ești preot|Și să zici iarăși|Apoi|Altă rugăciune|Doamne miluiește \(de 12 ori\), apoi|După numărul|Pentru ceasurile)')
TITLU = re.compile(r'^(Rugăciunea (întâia|a doua|a treia|a patra|a cincea|a șasea|a șaptea|a opta|a noua|a zecea)|Altă rugăciune)')
def curata(t):
    for a, b in CORECTURI: t = t.replace(a, b)
    return t.replace('Slavă?', 'Slavă...').replace('Și acum?', 'Și acum...').replace(' :', ':')
def blocuri(wiki):
    poem = re.search(r'<poem>(.*)</poem>', wiki, re.S).group(1)
    linii = [l.strip() for l in poem.split('\n')]
    rez, i = [], 0
    while i < len(linii):
        l = linii[i]
        if not l: i += 1; continue
        if TITLU.match(l) and l.endswith(',') and i + 1 < len(linii) and linii[i + 1]:   # „Rugăciunea întâia,\na Sfântului Macarie cel Mare:”
            l = l + ' ' + linii[i + 1]; i += 1
        if l.startswith('Altă rugăciune către Preasfânta Născătoare') and not l.endswith(':'):
            l = l + ' ' + linii[i + 1]; i += 1
        l = curata(l)
        if TITLU.match(l): rez.append(('titlu', l.rstrip(':')))
        elif RUBRICA.match(l) or (l.endswith(':') and len(l) < 120): rez.append(('rubrica', l))
        else: rez.append(('text', l))
        i += 1
    return rez
def main(f_ceaslov, f_crez):
    b = blocuri(open(f_ceaslov, encoding='utf8').read())
    crez = re.search(r'<poem>(.*)</poem>', open(f_crez, encoding='utf8').read(), re.S).group(1)
    crez = ' '.join(x.strip() for x in crez.split('\n') if x.strip()).replace('Amin!', 'Amin.')
    # Crezul (Simbolul credinței) după Psalmul 50, ca în rânduiala Ceaslovului
    i = next(k for k, (tip, t) in enumerate(b) if tip == 'text' and t.startswith('Miluiește-mă, Dumnezeule, după mare mila Ta'))
    b[i + 1:i + 1] = [('rubrica', 'Apoi Simbolul credinței:'), ('text', crez)]
    out = []
    for tip, t in b:
        e = html.escape(t, quote=False)
        if tip == 'titlu': out.append(f'<h3 class="rug-titlu">{e}</h3>')
        elif tip == 'rubrica': out.append(f'<p class="rug-rubrica">{e}</p>')
        else: out.append(f'<p class="rug-text">{e}</p>')
    os.makedirs('data/rugaciuni', exist_ok=True)
    open('data/rugaciuni/dimineata.html', 'w', encoding='utf8').write('\n'.join(out) + '\n')
    json.dump(b, open('data/rugaciuni/dimineata.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(f'{len(b)} blocuri: {sum(1 for x in b if x[0]=="titlu")} titluri, {sum(1 for x in b if x[0]=="rubrica")} îndrumări, {sum(1 for x in b if x[0]=="text")} paragrafe de text')
if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
