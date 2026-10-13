"""Rugăciunile de seară (rânduiala din Ceaslov) din transcrierea ro.wikisource.org/wiki/Rugăciuni_de_seară (continuarea paginii
„Ceaslovul”, marcată domeniu public). Corectează doar greșelile evidente de tastare/diacritice (CORECTURI), fără a schimba cuvintele.
Formatul sursei: '''titlu''', ''îndrumare sau formulă''. Iese: data/rugaciuni/seara.html + .json.
Folosire: python3 scripts/rugaciuni/genereaza-seara.py <Rugaciuni_de_seara.wiki>"""
import re, sys, json, html, os
CORECTURI = [('Mângăietorule', 'Mângâietorule'), ('bunătătilor', 'bunătăților'), ('împarația', 'împărăția'), ('nădajduim', 'nădăjduim'),
  ('vrajmașii', 'vrăjmașii'), ('vrajmașului', 'vrăjmașului'), ('vrajmașul', 'vrăjmașul'), ('desăvarșit', 'desăvârșit'), ('Pastor bun', 'Păstor bun'),
  ('Lumineaza mintea', 'Luminează mintea'), ('preaslăvit esti', 'preaslăvit ești'), ('Stăpane', 'Stăpâne'), ('am vazut', 'am văzut'),
  ('pazește-ne', 'păzește-ne'), ('cel sfant', 'cel sfânt'), ('te roaga pentru', 'te roagă pentru'), ('păcătosul si nevrednicul', 'păcătosul și nevrednicul'),
  ('pururea slavită', 'pururea slăvită'), ('Treime Sfântă, slava Ție', 'Treime Sfântă, slavă Ție'), ('mai marită', 'mai mărită'),
  ('te cântam cu inima', 'te cântăm cu inima'), ('la Fiul tau', 'la Fiul tău'), ('Slabește', 'Slăbește'), ('viața veșnica', 'viața veșnică'),
  ('binecuvântat este in vecii', 'binecuvântat este în vecii'), ('altă îndrăzneala', 'altă îndrăzneală'), ('iți încredințez', 'Îți încredințez'),
  ('Ioane Gura de Aur', 'Ioane Gură de Aur'), ('le dă lor cererilor', 'le dă lor cererile'), ('ajutorul tău si de folosința', 'ajutorul tău și de folosința'),
  ('deasupra si de toate', 'deasupra și de toate'), ('Preaslavită pururea', 'Preaslăvită pururea'), (' :', ':')]
def curata(t):
    for a, b in CORECTURI: t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip()
RUBRICA = re.compile(r'^(Apoi|\(|Și apoi|Vrând|a Născătoarei)')
def main(f):
    w = open(f, encoding='utf8').read()
    rez = []
    for l in w.split('\n'):
        l = l.strip()
        if not l or l == "'' ''": continue
        if l.startswith("'''") and l.rstrip().endswith("'''"):
            rez.append(('titlu', curata(l.strip("' ")).rstrip(':'))); continue
        tot_italic = re.fullmatch(r"''(.*)''", l) is not None
        t = curata(re.sub(r"''+", '', l))
        if not t: continue
        if tot_italic and (RUBRICA.match(t) or t.endswith(':')): rez.append(('rubrica', t))
        else: rez.append(('text', t))
    # repetițiile identice consecutive („Slavă Ție, Dumnezeul nostru, slavă Ție.” x3) -> o dată, cu „(de 3 ori)”
    comp = []
    for tip, t in rez:
        if comp and comp[-1][0] == tip == 'text' and re.sub(r' \(de \d+ ori\)$', '', comp[-1][1]) == t:
            m = re.search(r' \(de (\d+) ori\)$', comp[-1][1]); n = int(m.group(1)) + 1 if m else 2
            comp[-1] = (tip, t + f' (de {n} ori)')
        else: comp.append((tip, t))
    out = []
    for tip, t in comp:
        e = html.escape(t, quote=False)
        out.append({'titlu': f'<h3 class="rug-titlu">{e}</h3>', 'rubrica': f'<p class="rug-rubrica">{e}</p>'}.get(tip, f'<p class="rug-text">{e}</p>'))
    os.makedirs('data/rugaciuni', exist_ok=True)
    open('data/rugaciuni/seara.html', 'w', encoding='utf8').write('\n'.join(out) + '\n')
    json.dump(comp, open('data/rugaciuni/seara.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(f'{len(comp)} blocuri: {sum(1 for x in comp if x[0]=="titlu")} titluri, {sum(1 for x in comp if x[0]=="rubrica")} îndrumări, {sum(1 for x in comp if x[0]=="text")} paragrafe')
if __name__ == '__main__': main(sys.argv[1])
