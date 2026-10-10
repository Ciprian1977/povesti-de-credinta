import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from parts import HDR, NAV, FONTS
B='https://www.povestidecredinta.ro'
V_ACATIST=('F_wNGeoJ6Uo','Acatistul Sfintei Cuvioase Parascheva')
V_10PRIC=('9ep1ucnrzSQ','10 Pricesne pentru Sfânta Parascheva')
V_PRICVIND=('GXKdJqsRGuM','Pricesnă Sfânta Parascheva – Rugăciune pentru vindecare și lumină')

def video(v, sub=''):
    vid,t=v
    return f'''<figure class="video-card">
  <div class="video-rug" data-id="{vid}"><button type="button" class="video-rug-start" aria-label="Pornește videoclipul: {t}"><img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="{t}" loading="lazy" width="480" height="360"><span class="video-rug-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span><span class="video-rug-eticheta">▶ {t}</span></button></div>
  <figcaption>{sub or t} · <a href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener">Deschide pe YouTube</a></figcaption>
</figure>'''

def rand(href,titlu,sub):
    return f'<li><a href="{href}"><span><span class="rand-titlu">{titlu}</span><span class="rand-sub">{sub}</span></span><span class="sageata"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a></li>'

def faq_html(faq):
    return '<section class="faq-articol" aria-labelledby="faq-t"><h2 id="faq-t">Întrebări frecvente</h2>'+''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in faq)+'</section>'

def pagina(cale, titlu, desc, h1, supra, corp, faq, crumbs, publicat='2026-10-10', img=f'{B}/images/og-image.jpg'):
    url=B+cale
    ld=[{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":B+u} for i,(n,u) in enumerate(crumbs)]},
        {"@context":"https://schema.org","@type":"Article","headline":h1,"description":desc,"inLanguage":"ro","datePublished":publicat,"dateModified":publicat,
         "mainEntityOfPage":url,"image":img,"author":{"@type":"Organization","name":"Povești de Credință","url":B+"/"},
         "publisher":{"@type":"Organization","name":"Povești de Credință","logo":{"@type":"ImageObject","url":B+"/images/icon-512.png"}},
         "about":{"@type":"Person","name":"Sfânta Cuvioasă Parascheva de la Iași"}}]
    if faq: ld.append({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a.replace('<a href="','').split('">')[0] if False else __import__('re').sub('<[^>]+>','',a)}} for q,a in faq]})
    bc=' › '.join((f'<a href="{u}">{n}</a>' if i<len(crumbs)-1 else f'<span>{n}</span>') for i,(n,u) in enumerate(crumbs))
    html=f'''<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#FFFFFF">
  <title>{titlu}</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{titlu}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:locale" content="ro_RO">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/images/icon-192.png">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="stylesheet" href="/css/style.min.css">
''' + ''.join(f'  <script type="application/ld+json">{json.dumps(x,ensure_ascii=False)}</script>\n' for x in ld) + FONTS + f'''
<body>
{HDR}
<main class="articol">
  <nav class="breadcrumb" aria-label="Breadcrumb">{bc}</nav>
  <p class="eticheta">{supra}</p>
  <h1>{h1}</h1>
{corp}
{faq_html(faq) if faq else ''}
</main>
{NAV}
<div class="voal-meniu" id="voal-meniu" aria-hidden="true"></div>
<script src="/js/video-rugaciuni.js?v=8" defer></script>
<script src="/js/ui.js?v=11" defer></script>
</body>
</html>
'''
    d='.'+cale; os.makedirs(d,exist_ok=True); open(d+'/index.html','w',encoding='utf-8').write(html)
    print('scris',cale,len(html))

LEG = lambda excl: '<section class="leg"><h2>Citește și</h2><ul class="lista-sageti">'+''.join(rand(h,t,s) for h,t,s in [
    ('/sfanta-parascheva','Sfânta Parascheva 2026','Sărbătoarea de miercuri, 14 octombrie: pelerinaj, tradiții'),
    ('/sfanta-parascheva/viata','Viața Sfintei Parascheva','Copilăria, nevoința și drumul sfintelor moaște până la Iași'),
    ('/sfanta-parascheva/rugaciuni','Rugăciuni către Sfânta Parascheva','Troparul, rugăciunile și Acatistul'),
    ('/acatiste','Acatiste ortodoxe','Maica Domnului, Sfântul Nicolae, Mântuitorul'),
    ('/pricesne','Pricesne ortodoxe','Cântări bisericești românești'),
    ('/calendar','Calendar ortodox 2026','Sfinții fiecărei zile din octombrie'),
  ] if h!=excl)+'</ul></section>'

# ═══════════ 1. SĂRBĂTOAREA ═══════════
corp1=f'''
  <p class="lead">Miercuri, <strong>14 octombrie 2026</strong>, Biserica Ortodoxă Română o prăznuiește pe <strong>Sfânta Cuvioasă Parascheva</strong>, ocrotitoarea Moldovei. Este una dintre cele mai iubite sărbători ale anului: la Iași, unde se află sfintele ei moaște, vin în fiecare an sute de mii de pelerini.</p>

  <div class="caseta-info" role="note">
    <p class="caseta-titlu">Pe scurt</p>
    <ul>
      <li><strong>Data:</strong> miercuri, 14 octombrie 2026, sărbătoare cu cruce roșie</li>
      <li><strong>Moaștele:</strong> Catedrala Mitropolitană din Iași</li>
      <li><strong>Pelerinajul:</strong> 8–15 octombrie 2026, cu slujbe zilnice</li>
      <li><strong>Sfânta Liturghie:</strong> 14 octombrie, de la ora 9:00, pe podiumul de lângă Catedrală</li>
      <li><strong>Anul acesta:</strong> pelerinii se pot închina și la moaștele Sfântului Cuvios Paisie de la Sihăstria</li>
    </ul>
  </div>

  <nav class="cuprins" aria-label="Cuprins"><p class="caseta-titlu">Cuprins</p><ol>
    <li><a href="#cine">Cine a fost Sfânta Parascheva</a></li>
    <li><a href="#pelerinaj">Pelerinajul de la Iași 2026</a></li>
    <li><a href="#traditii">Ce se face de Sfânta Parascheva</a></li>
    <li><a href="#post">Este zi de post?</a></li>
    <li><a href="#rugaciuni">Rugăciuni, Acatist și pricesne</a></li>
    <li><a href="#nume">Cine își serbează onomastica</a></li>
  </ol></nav>

  <h2 id="cine">Cine a fost Sfânta Parascheva</h2>
  <p>Sfânta Parascheva s-a născut la începutul secolului al XI-lea, în Epivata, în Tracia, nu departe de Constantinopol, într-o familie de creștini evlavioși. Încă din copilărie își dăruia hainele săracilor. Tânără fiind, a lăsat totul pentru Hristos: a trăit într-o mănăstire închinată Maicii Domnului, apoi ca pustnică în pustia Iordanului. La îndemnul unui înger s-a întors acasă, unde a trăit încă doi ani în post și rugăciune și a trecut la Domnul tânără, în jurul vârstei de 27 de ani.</p>
  <p>Trupul ei, aflat neputrezit, a făcut din Epivata un loc de pelerinaj. Sfintele moaște au trecut apoi prin Târnovo, Belgrad și Constantinopol, până când, în <strong>1641</strong>, au fost aduse la Iași de domnitorul <strong>Vasile Lupu</strong>. De atunci Sfânta Parascheva este socotită ocrotitoarea Moldovei.</p>
  <p class="mai-mult"><a href="/sfanta-parascheva/viata">Citește viața completă a Sfintei Parascheva →</a></p>

  <h2 id="pelerinaj">Pelerinajul de la Iași 2026</h2>
  <p>Pelerinajul începe <strong>joi, 8 octombrie 2026</strong>, la ora 6:00, cu citirea Acatistului Sfintei Cuvioase Parascheva. Sfintele moaște sunt purtate în procesiune în jurul Catedralei Mitropolitane și așezate spre închinare sub un baldachin în incinta ansamblului mitropolitan. Slujbele, privegherile și procesiunea „Calea Sfinților” au loc zilnic, până pe 15 octombrie.</p>
  <p>În ziua praznicului, <strong>miercuri, 14 octombrie</strong>, Sfânta Liturghie începe la <strong>ora 9:00</strong>, pe podiumul de lângă Pietonalul Ștefan cel Mare și Sfânt, în dreptul altarului Catedralei. Cei aflați mai departe pot urmări slujba pe ecranele mari amplasate în zonă.</p>
  <p>Anul acesta, alături de racla Sfintei Parascheva, pelerinii se pot închina și la moaștele <strong>Sfântului Cuvios Paisie de la Sihăstria</strong>, aduse din județul Neamț. Programul complet este publicat de Arhiepiscopia Iașilor pe portalul Doxologia.</p>
  <div class="sfat"><strong>Sfat pentru pelerini:</strong> la rândul pentru închinare se poate aștepta multe ore, mai ales noaptea și în ziua praznicului. Îmbrăcați-vă gros, luați apă și ceva de mâncare și, dacă puteți, veniți în primele zile ale pelerinajului.</div>

  <h2 id="traditii">Ce se face de Sfânta Parascheva</h2>
  <ul class="lista-text">
    <li><strong>Participarea la Sfânta Liturghie</strong> și, pentru cei care pot, pelerinajul la Iași.</li>
    <li><strong>Citirea Acatistului</strong> Sfintei Parascheva, acasă sau la biserică.</li>
    <li><strong>Milostenia:</strong> după exemplul Sfintei, care își dăruia hainele săracilor, se împart pâine, covrigi, colaci și fructe celor în nevoie.</li>
    <li><strong>Aprinderea unei lumânări</strong> pentru cei vii și pentru cei adormiți și pomenirea lor la biserică.</li>
    <li><strong>Rugăciunea pentru sănătate</strong> și pentru cei bolnavi: Sfânta Parascheva este cunoscută ca grabnic ajutătoare.</li>
  </ul>

  <h2 id="post">Este zi de post pe 14 octombrie 2026?</h2>
  <p>Anul acesta sărbătoarea cade <strong>miercuri</strong>, iar miercurea este zi de post în tot cursul anului. În calendarul ortodox pe 2026, ziua apare ca zi de post. După rânduiala Bisericii, la sărbătorile mari cu cruce roșie care cad miercuri sau vineri se poate da dezlegare la pește. Pentru îndrumarea potrivită, întrebați duhovnicul sau urmați calendarul parohiei.</p>
  <p class="mai-mult"><a href="/calendar">Vezi calendarul ortodox și zilele de post din octombrie →</a></p>

  <h2 id="rugaciuni">Rugăciuni, Acatist și pricesne pentru Sfânta Parascheva</h2>
  <p>Ascultă Acatistul și pricesnele închinate Sfintei Parascheva, de pe canalul nostru de YouTube. Poți să te rogi împreună cu noi acasă, chiar dacă nu ajungi la Iași.</p>
  {video(V_ACATIST,'Acatistul Sfintei Cuvioase Parascheva – citit integral')}
  {video(V_10PRIC,'10 pricesne pentru Sfânta Parascheva – cântări ortodoxe')}
  <p class="mai-mult"><a href="/sfanta-parascheva/rugaciuni">Rugăciuni către Sfânta Parascheva – text →</a></p>

  <h2 id="nume">Cine își serbează onomastica de Sfânta Parascheva</h2>
  <p>Pe 14 octombrie își serbează ziua numelui cei care poartă numele <strong>Parascheva</strong>, <strong>Paraschiva</strong>, <strong>Paraschiv</strong> și <strong>Chiva</strong>, precum și derivatele lor. Numele vine din grecescul <em>Paraskevi</em>, care înseamnă „vineri”, ziua pregătirii.</p>
  <div class="mesaje">
    <p class="caseta-titlu">Mesaje de „La mulți ani”</p>
    <blockquote>„La mulți ani de Sfânta Parascheva! Ocrotitoarea Moldovei să-ți dăruiască sănătate, pace și bucurie în casă.”</blockquote>
    <blockquote>„Sfânta Cuvioasă Parascheva să mijlocească pentru tine înaintea lui Hristos și să te păzească de tot răul. La mulți ani!”</blockquote>
    <blockquote>„Cu drag, de ziua numelui tău: să ai credința și blândețea Sfintei Parascheva. La mulți ani cu sănătate!”</blockquote>
    <button type="button" class="buton-mic" onclick="if(navigator.share){{navigator.share({{text:document.querySelector('.mesaje blockquote').innerText+' — povestidecredinta.ro',url:location.href}})}}else{{window.open('https://wa.me/?text='+encodeURIComponent(document.querySelector('.mesaje blockquote').innerText+' '+location.href))}}">Trimite un mesaj</button>
  </div>
{LEG('/sfanta-parascheva')}
'''
faq1=[('Când este Sfânta Parascheva în 2026?','Sfânta Cuvioasă Parascheva este sărbătorită miercuri, 14 octombrie 2026. Este o sărbătoare cu cruce roșie în calendarul ortodox.'),
('Unde se află moaștele Sfintei Parascheva?','Sfintele moaște ale Cuvioasei Parascheva se află în Catedrala Mitropolitană din Iași, unde au fost aduse în anul 1641, în timpul domnitorului Vasile Lupu.'),
('Când are loc pelerinajul de la Iași în 2026?','Pelerinajul are loc între 8 și 15 octombrie 2026. Începe joi, 8 octombrie, la ora 6:00, cu Acatistul Sfintei Parascheva. Sfânta Liturghie din ziua praznicului începe pe 14 octombrie, la ora 9:00.'),
('Se mănâncă pește de Sfânta Parascheva 2026?','În 2026 sărbătoarea cade miercuri, zi de post. La sărbătorile mari cu cruce roșie care cad miercuri sau vineri, rânduiala Bisericii poate da dezlegare la pește. Urmați calendarul parohiei și sfatul duhovnicului.'),
('Ce nume se sărbătoresc pe 14 octombrie?','Pe 14 octombrie își serbează onomastica cei care se numesc Parascheva, Paraschiva, Paraschiv sau Chiva.'),
('De ce este Sfânta Parascheva ocrotitoarea Moldovei?','Din 1641 moaștele ei se află la Iași, iar credincioșii din Moldova au cerut de-a lungul secolelor ajutorul ei în boli, secete și necazuri. De aceea este cinstită ca ocrotitoare a Moldovei.')]
pagina('/sfanta-parascheva','Sfânta Parascheva 2026 – miercuri, 14 octombrie: pelerinaj Iași, tradiții, rugăciuni',
 'Sfânta Parascheva 2026 este miercuri, 14 octombrie. Programul pelerinajului de la Iași, ce se face de sărbătoare, dacă e zi de post, Acatistul și pricesne.',
 'Sfânta Cuvioasă Parascheva – 14 octombrie 2026','Sărbătoare · miercuri, 14 octombrie 2026',corp1,faq1,[('Acasă','/'),('Calendar','/calendar'),('Sfânta Parascheva 2026','/sfanta-parascheva')])

# ═══════════ 2. VIAȚA ═══════════
corp2=f'''
  <p class="lead">Sfânta Cuvioasă Parascheva, numită și Parascheva cea Nouă sau Sfânta Vineri, este una dintre cele mai iubite sfinte din Biserica Ortodoxă Română. A trăit doar aproximativ 27 de ani, dar viața ei de rugăciune și milostenie, ca și minunile săvârșite prin sfintele ei moaște, au făcut-o cunoscută în tot lumea ortodoxă.</p>

  <nav class="cuprins" aria-label="Cuprins"><p class="caseta-titlu">Cuprins</p><ol>
    <li><a href="#copilaria">Copilăria la Epivata</a></li>
    <li><a href="#nevointa">Viața de nevoință</a></li>
    <li><a href="#adormirea">Întoarcerea acasă și adormirea</a></li>
    <li><a href="#moastele">Aflarea sfintelor moaște</a></li>
    <li><a href="#drumul">Drumul moaștelor până la Iași</a></li>
    <li><a href="#ocrotitoarea">Ocrotitoarea Moldovei</a></li>
  </ol></nav>

  <h2 id="copilaria">Copilăria la Epivata</h2>
  <p>Sfânta Parascheva s-a născut la începutul secolului al XI-lea, în localitatea Epivata, în Tracia răsăriteană, aproape de Constantinopol. Părinții ei erau creștini evlavioși și înstăriți. Fratele ei, Eftimie, a devenit mai târziu monah și apoi episcop.</p>
  <p>De mică, Parascheva iubea biserica și rugăciunea. Se povestește că, auzind la slujbă cuvintele Mântuitorului „Oricine voiește să vină după Mine să se lepede de sine”, le-a primit în inimă. De atunci își dăruia în ascuns hainele săracilor, chiar și când părinții o certau pentru aceasta.</p>

  <h2 id="nevointa">Viața de nevoință</h2>
  <p>Dorind să-I slujească numai lui Dumnezeu, tânăra Parascheva a lăsat casa părintească. A mers mai întâi la Constantinopol, apoi s-a nevoit câțiva ani într-o mănăstire închinată Maicii Domnului, în Heracleea Pontului.</p>
  <p>A plecat apoi în pelerinaj la Ierusalim, la locurile sfinte, și s-a așezat în pustia Iordanului, într-o mică obște de călugărițe pustnice. Acolo a trăit în post aspru, priveghere și rugăciune, asemenea Cuvioasei Maria Egipteanca.</p>

  <h2 id="adormirea">Întoarcerea acasă și adormirea</h2>
  <p>Pe când avea în jur de 25 de ani, un înger i s-a arătat în vis și i-a spus să se întoarcă în patria sa. Ascultătoare, Parascheva s-a întors în ținutul natal, la Calicratia, lângă Epivata. Acolo a trăit încă doi ani, smerită și necunoscută, rugându-se lângă biserica Sfinților Apostoli. A trecut la Domnul în jurul vârstei de 27 de ani și a fost îngropată ca o străină, fără ca cineva să știe cine fusese.</p>

  <h2 id="moastele">Aflarea sfintelor moaște</h2>
  <p>După mulți ani, Sfânta s-a arătat în vis unui monah evlavios și unei femei, cerând ca trupul ei să fie mutat cu cinste. Credincioșii au săpat locul și au aflat trupul ei întreg și neputrezit, răspândind bună mireasmă. Sfintele moaște au fost așezate în biserica Sfinților Apostoli din Epivata, unde au rămas aproximativ 175 de ani. Prin ele s-au săvârșit multe vindecări.</p>

  <h2 id="drumul">Drumul moaștelor până la Iași</h2>
  <ol class="cronologie">
    <li><span class="an">Epivata</span>Moaștele sunt cinstite în biserica Sfinților Apostoli, unde au rămas aproximativ 175 de ani.</li>
    <li><span class="an">1238</span>Țarul bulgar Ioan Asan al II-lea le aduce la Târnovo, capitala Bulgariei de atunci.</li>
    <li><span class="an">1393</span>După cucerirea Târnovei de către turci, moaștele sunt duse la Vidin.</li>
    <li><span class="an">1396</span>Sunt mutate la Belgrad, unde rămân peste un secol.</li>
    <li><span class="an">1521</span>Sultanul Soliman Magnificul le duce la Constantinopol, unde sunt păstrate la Patriarhia Ecumenică.</li>
    <li><span class="an">1641</span>Patriarhia le dăruiește domnitorului Moldovei, Vasile Lupu, în semn de recunoștință. Sunt aduse cu mare cinste la Iași și așezate în biserica Sfinții Trei Ierarhi.</li>
    <li><span class="an">1888</span>Un incendiu cuprinde biserica Trei Ierarhi, dar racla cu sfintele moaște rămâne neatinsă de foc.</li>
    <li><span class="an">1889</span>Moaștele sunt mutate în Catedrala Mitropolitană din Iași, unde se află și astăzi.</li>
    <li><span class="an">1947</span>În anii de secetă și foamete, moaștele sunt purtate în procesiune prin satele Moldovei, iar credincioșii pomenesc ploaia care a urmat.</li>
    <li><span class="an">1950</span>Sfântul Sinod al Bisericii Ortodoxe Române hotărăște generalizarea cultului ei în toată țara, proclamat solemn în 1955.</li>
  </ol>

  <h2 id="ocrotitoarea">Ocrotitoarea Moldovei</h2>
  <p>De aproape patru secole, Sfânta Parascheva este socotită ocrotitoarea Moldovei. Credincioșii vin la racla ei pentru sănătate, pentru copii, pentru familie și în toate necazurile vieții. Pelerinajul de la Iași, în jurul zilei de 14 octombrie, a devenit unul dintre cele mai mari pelerinaje ortodoxe din Europa.</p>
  {video(V_10PRIC,'10 pricesne pentru Sfânta Parascheva – cântări ortodoxe')}
  <p class="mai-mult"><a href="/sfanta-parascheva/rugaciuni">Rugăciuni și Acatistul Sfintei Parascheva →</a></p>
{LEG('/sfanta-parascheva/viata')}
'''
faq2=[('Unde s-a născut Sfânta Parascheva?','Sfânta Parascheva s-a născut la începutul secolului al XI-lea, în Epivata, în Tracia răsăriteană, aproape de Constantinopol.'),
('La ce vârstă a murit Sfânta Parascheva?','Sfânta Parascheva a trecut la Domnul tânără, în jurul vârstei de 27 de ani, după doi ani petrecuți în rugăciune în ținutul natal.'),
('Când au fost aduse moaștele Sfintei Parascheva la Iași?','Moaștele au fost aduse la Iași în anul 1641, în timpul domnitorului Vasile Lupu, care le-a primit în dar de la Patriarhia Ecumenică de la Constantinopol.'),
('De ce se numește Sfânta Parascheva și Sfânta Vineri?','Numele Parascheva vine din grecescul Paraskevi, care înseamnă vineri. De aceea, în popor, Sfânta este numită și Sfânta Vineri.')]
pagina('/sfanta-parascheva/viata','Viața Sfintei Parascheva de la Iași – ocrotitoarea Moldovei',
 'Viața Sfintei Cuvioase Parascheva: copilăria la Epivata, nevoința în pustia Iordanului, aflarea moaștelor și drumul lor până la Iași, în 1641.',
 'Viața Sfintei Cuvioase Parascheva de la Iași','Viețile Sfinților · 14 octombrie',corp2,faq2,[('Acasă','/'),('Sfânta Parascheva 2026','/sfanta-parascheva'),('Viața Sfintei','/sfanta-parascheva/viata')])

# ═══════════ 3. RUGĂCIUNI ═══════════
RUG = json.load(open(os.path.join(os.path.dirname(__file__),'rugaciuni_parascheva.json'),encoding='utf-8')) if os.path.exists(os.path.join(os.path.dirname(__file__),'rugaciuni_parascheva.json')) else []
def bloc_rug(i,r):
    paras=''.join(f'<p>{p}</p>' for p in r['text'].strip().split('\n') if p.strip())
    return f'''<section class="rugaciune-bloc-text" id="rugaciunea-{i}"><h2>{r['titlu']}</h2><div class="text-rugaciune">{paras}</div>
  <div class="actiuni-text"><button type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(this.closest('section').querySelector('.text-rugaciune').innerText)">Copiază rugăciunea</button><button type="button" onclick="window.open('https://wa.me/?text='+encodeURIComponent(this.closest('section').querySelector('h2').innerText+'\\n\\n'+this.closest('section').querySelector('.text-rugaciune').innerText.slice(0,600)+'\\n\\n'+location.href))">Trimite pe WhatsApp</button></div></section>'''
rug_html=''.join(bloc_rug(i+1,r) for i,r in enumerate(RUG))
corp3=f'''
  <p class="lead">Sfânta Cuvioasă Parascheva este cunoscută ca grabnic ajutătoare celor care o cheamă cu credință: în boală, în necazuri, pentru copii și pentru familie. Mai jos găsești rugăciunile către Sfânta Parascheva, Acatistul și pricesne, pe care le poți asculta sau citi acasă.</p>
  <nav class="cuprins cuprins-rug" aria-label="Cuprins"><p class="caseta-titlu">Pe această pagină</p><ol>{''.join(f'<li><a href="#rugaciunea-{i+1}">{r["titlu"]}</a></li>' for i,r in enumerate(RUG))}<li><a href="#acatist">Acatistul Sfintei Parascheva (video)</a></li></ol></nav>
  <div id="acatist"></div>
  {video(V_ACATIST,'Acatistul Sfintei Cuvioase Parascheva – citit integral')}
{rug_html}
  <h2>Pricesnă pentru Sfânta Parascheva</h2>
  <p>O cântare de rugăciune pentru vindecare și lumină, închinată Sfintei Parascheva.</p>
  {video(V_PRICVIND,'Pricesnă Sfânta Parascheva – rugăciune pentru vindecare și lumină')}
  <h2>Când se citește rugăciunea către Sfânta Parascheva</h2>
  <p>Rugăciunea către Sfânta Parascheva se poate citi oricând, mai ales în ziua prăznuirii ei, pe <a href="/sfanta-parascheva">14 octombrie</a>, și vinerea, zi legată de numele ei. Credincioșii o citesc în boală, înaintea unei operații, pentru copii, pentru liniștea casei și în necazurile grele. Rugăciunea se face cu credință și smerenie, de preferat după rugăciunile obișnuite de dimineață sau de seară.</p>
{LEG('/sfanta-parascheva/rugaciuni')}
'''
faq3=[('Când se citește rugăciunea către Sfânta Parascheva?','Oricând, cu credință, mai ales pe 14 octombrie, în ziua prăznuirii ei, și vinerea. Credincioșii o citesc în boală, pentru copii, pentru familie și în necazuri.'),
('Ce se cere de la Sfânta Parascheva?','Sfânta Parascheva este rugată pentru sănătate, vindecare, ocrotirea copiilor și a familiei, pentru liniște sufletească și în toate necazurile vieții.'),
('Unde pot asculta Acatistul Sfintei Parascheva?','Pe această pagină poți asculta Acatistul Sfintei Cuvioase Parascheva, citit integral, de pe canalul nostru de YouTube.')]
pagina('/sfanta-parascheva/rugaciuni','Rugăciune către Sfânta Parascheva – text, Acatist și pricesne',
 'Rugăciune către Sfânta Parascheva pentru copii, părinți, familie, bolnavi și românii plecați departe. Text de citit, Acatistul Sfintei Parascheva și pricesne.',
 'Rugăciuni către Sfânta Cuvioasă Parascheva','Rugăciuni · Sfânta Parascheva',corp3,faq3,[('Acasă','/'),('Rugăciuni','/rugaciuni'),('Sfânta Parascheva','/sfanta-parascheva'),('Rugăciuni','/sfanta-parascheva/rugaciuni')])
