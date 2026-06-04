/**
 * rugaciuni-saptamana.js
 * Povești de Credință — povestidecredinta.ro
 *
 * Textele liturgice oficiale ale celor 7 rugăciuni ale săptămânii.
 * Surse: Ceaslov BOR, Rugăcionar ortodox, domeniu public.
 * NU se generează cu AI — texte fixe, verificate teologic.
 *
 * Structura: RUGACIUNI_SAPTAMANA[ziIndex] unde ziIndex = getDay()
 * 0=Duminică, 1=Luni, 2=Marți, 3=Miercuri, 4=Joi, 5=Vineri, 6=Sâmbătă
 */

const RUGACIUNI_SAPTAMANA = {

  // ─── LUNI — Rugăciunea către Sfinții Îngeri ──────────────────────────────────
  1: {
    zi: 'Luni',
    slug: 'luni',
    titlu: 'Rugăciunea Zilei de Luni — Către Sfinții Îngeri Păzitori',
    titluSeo: '🙏 Rugăciunea Zilei de Luni — Sfinții Îngeri Păzitori | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de luni din tradiția Bisericii Ortodoxe, adresată Sfinților Îngeri Păzitori. Text integral, curat, din Ceaslovul BOR.',
    dedicatie: 'Lunea este ziua închinată Sfinților Îngeri, slujitori nevăzuți ai lui Dumnezeu și păzitori ai oamenilor.',
    culoare: '#4A90D9',
    icon: '👼',
    paragrafe: [
      'Sfinte Îngerule, păzitorul vieții mele, cel ce ești rânduit de Dumnezeu spre paza și ocrotirea sufletului și trupului meu, iartă-mi toate greșelile cu care te-am mâhnit în ziua și în noaptea aceasta, și mă apără de toată ispita vrăjmașului celui rău, ca să nu-l mânii pe Dumnezeu cu niciun păcat.',
      'Roagă-te pentru mine, păcătosul și nevrednicul robul lui Dumnezeu, ca să mă arăți vrednic de bunătatea și mila lui Dumnezeu. Amin.',
      '— — —',
      'Îngerule al lui Dumnezeu, păzitorul meu cel sfânt, dat mie din cer de Dumnezeu spre paza mea, rog pe tine cu fierbinte rugăciune: luminează-mă astăzi și mă păzește de tot răul, îndreptează-mă la fapte bune și mă povățuiește pe calea mântuirii.',
      'Îngerule sfânt, ocrotitorul meu, ajutor și apărare în toate zilele vieții mele, nu mă lăsa singur în lupta cu ispitele lumii și ale vrăjmașului diavol. Fii cu mine dimineața, la amiază și seara, în toate ceasurile zilei și ale nopții.',
      'Când mă trezesc din somn, fii lângă mine. Când merg la lucru, călăuzește pașii mei. Când mă odihnesc, veghează asupra mea. Când mă rog, înalță rugăciunile mele la tronul lui Dumnezeu. Când greșesc, mustră-mă cu blândețe și întoarce-mă la pocăință.',
      'Sfinte Îngerule, tu care ai văzut toate greșelile mele și totuși nu m-ai părăsit, mulțumesc lui Dumnezeu pentru darul tău. Ajută-mă să trăiesc această zi de luni în curăție, în rugăciune și în fapte bune, spre slava lui Dumnezeu și mântuirea sufletului meu.',
      'Roagă-te pentru mine la Dumnezeu, Cel în Treime slăvit, Tatăl, Fiul și Sfântul Duh, acum și pururea și în vecii vecilor. Amin.',
      '— — —',
      'Tropar al Sfinților Îngeri (glasul 4):',
      'Conducătorii oștilor cerești, rugămu-vă pe voi noi nevrednicii, ca prin rugăciunile voastre să ne acoperiți cu acoperământul aripilor slavei voastre celei netrupești, păzindu-ne pe noi, cei ce cădem cu dinadinsul și strigăm: Izbăviți-ne din nevoi, ca niște mai-mari ai puterilor celor de sus.',
      '— — —',
      'Condac (glasul 2):',
      'Conducătorii oștilor lui Dumnezeu și slujitorii slavei Domnului, căpeteniile îngerilor și povățuitorii oamenilor, cereți-ne nouă cele de folos și mare milă, ca unii ce sunteți mai-marii puterilor celor netrupești.',
    ],
    faq: [
      {
        q: 'De ce lunea este ziua Sfinților Îngeri în tradiția ortodoxă?',
        a: 'În rânduiala liturgică ortodoxă, lunea este ziua dedicată Sfinților Îngeri, slujitori nevăzuți ai lui Dumnezeu. Această tradiție vine din Tipicul Bisericii, care rânduiește ca în fiecare luni să se facă pomenire specială a puterilor cerești, care sunt mijlocitori între Dumnezeu și oameni.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── MARȚI — Rugăciunea către Sfântul Ioan Botezătorul ───────────────────────
  2: {
    zi: 'Marți',
    slug: 'marti',
    titlu: 'Rugăciunea Zilei de Marți — Către Sfântul Ioan Botezătorul',
    titluSeo: '🙏 Rugăciunea Zilei de Marți — Sfântul Ioan Botezătorul | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de marți din tradiția Bisericii Ortodoxe, adresată Sfântului Ioan Botezătorul, Înaintemergătorul Domnului. Text integral din Ceaslovul BOR.',
    dedicatie: 'Marțea este ziua închinată Sfântului Ioan Botezătorul, Înaintemergătorul și Botezătorul Domnului nostru Iisus Hristos.',
    culoare: '#2E7D32',
    icon: '✝️',
    paragrafe: [
      'Sfinte Ioane, Înaintemergătorule și Botezătorule al Domnului, propovăduitorul pocăinței, cel ce ești mai mare decât toți proorocii, tu care ai fost învrednicit a pune mâna pe capul lui Hristos și a-L boteza în Iordan, roagă-te pentru noi, păcătoșii, la Mântuitorul nostru Iisus Hristos, să ne dăruiască iertarea păcatelor și viața de veci.',
      'Sfinte Ioane Botezătorule, cel ce ai propovăduit pocăința și ai pregătit calea Domnului, ajută-ne și pe noi să ne pocăim de păcatele noastre și să ne întoarcem la Dumnezeu cu toată inima.',
      '— — —',
      'Înaintemergătorule al harului, primește rugăciunea noastră și o du la Stăpânul cel iubitor de oameni. Roagă-te pentru noi, cei ce suntem legați de patimi, ca să ne slobozim de ele prin pocăință și prin lacrimile mărturisirii.',
      'Tu, care ai trăit în pustie cu post și rugăciune, și ai propovăduit pocăința la Iordan, fii mijlocitor pentru noi înaintea lui Hristos Dumnezeu. Cere pentru noi iertare de greșeli, sănătate trupului și sufletului, pace în familie și binecuvântare în toate lucrările noastre.',
      'Sfinte Ioane, glasul celui ce strigă în pustie: „Pregătiți calea Domnului, drepte faceți cărările Lui!", ajută-ne să pregătim și noi calea Domnului în inimile noastre, prin pocăință, prin post și prin rugăciune.',
      'Tu, cel ce ai fost tăiat cu sabia pentru dreptate și adevăr, întărește-ne și pe noi în credință și în mărturisirea dreptei credințe ortodoxe. Fii cu noi în această zi de marți și în toate zilele vieții noastre.',
      'Roagă-te pentru noi, Sfinte Ioane Botezătorule, la Hristos Dumnezeu, Cel ce S-a botezat de tine în Iordan și a sfințit apele, ca să ne dăruiască și nouă botezul pocăinței și curăția sufletului. Amin.',
      '— — —',
      'Tropar (glasul 2):',
      'Pomenirea dreptului cu laude; iar ție îți este de ajuns mărturia Domnului, Înaintemergătorule; că te-ai arătat cu adevărat mai cinstit decât proorocii, că te-ai învrednicit a boteza în râuri pe Cel propovăduit. Drept aceea, pentru adevăr luptând, bucurându-te, ai binevestit și celor din iad pe Dumnezeu Cel arătat în trup, Cel ce a ridicat păcatul lumii și ne-a dăruit nouă mare milă.',
      '— — —',
      'Condac (glasul 3):',
      'Fecioara astăzi pe Cel mai presus de ființă naște, și pământul peștera Celui neapropiat aduce; îngerii cu păstorii slavoslovesc, magii cu steaua călătoresc; că pentru noi S-a născut Prunc tânăr, Dumnezeu Cel mai înainte de veci.',
    ],
    faq: [
      {
        q: 'De ce marțea este ziua Sfântului Ioan Botezătorul în tradiția ortodoxă?',
        a: 'Marțea este dedicată Sfântului Ioan Botezătorul, Înaintemergătorul Domnului, conform Tipicului Bisericii Ortodoxe. Ioan Botezătorul este cel mai mare dintre prooroci, cel care a pregătit calea Mântuitorului și L-a botezat în Iordan.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── MIERCURI — Rugăciunea Sfintei Cruci ────────────────────────────────────
  3: {
    zi: 'Miercuri',
    slug: 'miercuri',
    titlu: 'Rugăciunea Zilei de Miercuri — Rugăciunea Sfintei Cruci',
    titluSeo: '🙏 Rugăciunea Zilei de Miercuri — Sfânta Cruce | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de miercuri din tradiția Bisericii Ortodoxe, dedicată Sfintei Cruci. Text integral, curat, din tradiția liturgică BOR.',
    dedicatie: 'Miercurea este zi de post și de cinstire a Sfintei Cruci, amintind de vânzarea Mântuitorului de către Iuda.',
    culoare: '#7B1FA2',
    icon: '✠',
    paragrafe: [
      'Doamne Iisuse Hristoase, Fiul lui Dumnezeu, Cel ce Te-ai răstignit pe Cruce pentru păcatele noastre și ai murit și ai înviat a treia zi, miluiește-ne pe noi, păcătoșii.',
      'Crucea Ta o cinstim, Hristoase, și Sfânta Ta Înviere o slăvim.',
      '— — —',
      'Sfântă Cruce a Domnului nostru Iisus Hristos, armă nebiruită împotriva diavolului, zid de apărare al credincioșilor, lumina celor din întuneric, mângâierea celor întristați, vindecarea celor bolnavi, ocrotirea celor asupriți, ajutorul celor în primejdie — fii cu mine și în această zi de miercuri.',
      'Prin Sfânta Cruce, Hristos a biruit moartea și a dăruit viață lumii. Prin Sfânta Cruce, diavolul a fost rușinat și alungat. Prin Sfânta Cruce, noi, cei credincioși, avem nădejde de mântuire.',
      'Doamne Iisuse Hristoase, Cel ce ai purtat Crucea pentru noi și ai murit pe ea din dragoste față de noi, ajută-ne să purtăm și noi crucea vieții noastre cu răbdare, cu credință și cu nădejde în învierea Ta.',
      'Fă-ne vrednici să ne însemnăm cu semnul Sfintei Cruci în toată ziua și în tot ceasul, ca să fim apărați de toată răutatea și ispita diavolului. Căci Crucea Ta este puterea noastră, Crucea Ta este scutul nostru, Crucea Ta este nădejdea noastră.',
      'Slavă Ție, Hristoase Dumnezeule, Cel ce ai pătimit pe Cruce pentru noi și ne-ai mântuit. Slavă Ție pentru dragostea Ta cea nemăsurată față de noi, păcătoșii. Slavă Ție, că nu ne-ai lăsat în moarte, ci ne-ai dăruit viața cea veșnică prin Sfânta Ta Cruce și Înviere. Amin.',
      '— — —',
      'Tropar al Sfintei Cruci (glasul 1):',
      'Mântuiește, Doamne, poporul Tău și binecuvântează moștenirea Ta, biruință binecredincioșilor creștini asupra celui potrivnic dăruiește și cu Crucea Ta păzește pe poporul Tău.',
      '— — —',
      'Condac (glasul 4):',
      'Cel ce Te-ai înălțat pe Cruce de bunăvoie, poporului Tău celui nou, numit cu numele Tău, îndurările Tale dăruiește-i, Hristoase Dumnezeule; veselește cu puterea Ta pe credincioșii noștri, dăruindu-le lor biruință asupra potrivnicilor, având ajutorul Tău armă de pace, nebiruită biruință.',
    ],
    faq: [
      {
        q: 'De ce miercurea este zi de post și de cinstire a Sfintei Cruci?',
        a: 'Miercurea este zi de post în amintirea vânzării Mântuitorului de către Iuda Iscarioteanul, care a avut loc într-o miercuri. Este și zi de cinstire a Sfintei Cruci, pe care Hristos a pătimit pentru mântuirea lumii.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── JOI — Rugăciunea consacrată (Cina cea de Taină) ────────────────────────
  4: {
    zi: 'Joi',
    slug: 'joi',
    titlu: 'Rugăciunea Consacrată a Zilei de Joi — Cina cea de Taină',
    titluSeo: '🙏 Rugăciunea Consacrată a Zilei de Joi — Text Integral și Curat',
    descSeo: 'Citeste rugăciunea oficială a zilei de joi din tradiția Bisericii Ortodoxe. Un text sacru de umilință care amintește de Cina cea de Taină și spălarea picioarelor ucenicilor.',
    dedicatie: 'Joia este ziua Sfinților Apostoli și a Sfântului Ierarh Nicolae, amintind de Cina cea de Taină și de spălarea picioarelor ucenicilor de către Hristos.',
    culoare: '#F57F17',
    icon: '🕯️',
    paragrafe: [
      'Doamne Iisuse Hristoase, Dumnezeul nostru, Cel ce în noaptea în care ai fost vândut ai luat pâine în sfintele și preacuratele Tale mâini și, mulțumind, ai binecuvântat, ai sfințit, ai frânt și ai dat Sfinților Tăi Ucenici și Apostoli, zicând: Luați, mâncați, acesta este Trupul Meu, Cel ce se frânge pentru voi, spre iertarea păcatelor — miluiește-ne pe noi.',
      'Și, asemenea, luând paharul după Cină, zicând: Beți dintru acesta toți, acesta este Sângele Meu al Legii celei Noi, Cel ce pentru voi și pentru mulți se varsă, spre iertarea păcatelor — miluiește-ne pe noi.',
      '— — —',
      'Doamne Iisuse Hristoase, Cel ce în aceeași noapte sfântă Te-ai sculat de la Cină și ai turnat apă în vasul de spălat și ai început să speli picioarele ucenicilor Tăi, arătând prin aceasta smerenia Ta cea dumnezeiască și poruncindu-ne să ne smerim unii față de alții — ajută-ne să urmăm pilda Ta.',
      'Tu, Doamne, Cel ce ești Stăpânul și Învățătorul nostru, ne-ai dat pildă de smerenie, spălând picioarele ucenicilor Tăi. Ajută-ne și pe noi să slujim unii altora cu dragoste, să ne smerim în fața aproapelui nostru și să nu căutăm mărire deșartă.',
      'Sfinte Apostoli ai lui Hristos, care ați primit din mâinile Lui Trupul și Sângele Său la Cina cea de Taină, rugați-vă pentru noi la Hristos Dumnezeu, ca să ne învrednicim și noi a ne împărtăși cu vrednicie din Sfintele Taine ale lui Hristos.',
      'Sfinte Ierarhe Nicolae, arhiepiscopul Mirelor Lichiei, făcătorule de minuni, cel ce ești prăznuit în fiecare joi, roagă-te pentru noi la Hristos Dumnezeu, ca să ne dăruiască sănătate, pace, belșug și mântuire sufletelor noastre.',
      'Doamne, în această zi de joi, când ne aducem aminte de Cina Ta cea de Taină și de dragostea Ta nemăsurată față de noi, umple inimile noastre de recunoștință și de dorința de a Te urma în toate zilele vieții noastre. Amin.',
      '— — —',
      'Tropar al Sfinților Apostoli (glasul 3):',
      'Sfinților Apostoli, rugați pe Milostivul Dumnezeu, ca să dăruiască iertare de greșeli sufletelor noastre.',
      '— — —',
      'Tropar al Sfântului Ierarh Nicolae (glasul 4):',
      'Îndreptarul credinței și chipul blândeților, învățătorul înfrânării te-a arătat pe tine turmei tale adevărul lucrurilor; pentru aceasta ai câștigat cu smerenia cele înalte, cu sărăcia cele bogate. Părinte Ierarhe Nicolae, roagă pe Hristos Dumnezeu să mântuiască sufletele noastre.',
    ],
    faq: [
      {
        q: 'De ce joia este ziua Sfinților Apostoli și a Sfântului Nicolae?',
        a: 'Joia este dedicată Sfinților Apostoli, amintind de Cina cea de Taină care a avut loc într-o joi seara, când Hristos a instituit Sfânta Euharistie. Este și ziua Sfântului Ierarh Nicolae, unul dintre cei mai iubiți sfinți ai Bisericii Ortodoxe.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── VINERI — Rugăciunea Sfintei Cruci și a Patimilor ───────────────────────
  5: {
    zi: 'Vineri',
    slug: 'vineri',
    titlu: 'Rugăciunea Zilei de Vineri — Patimile și Crucea Domnului',
    titluSeo: '🙏 Rugăciunea Zilei de Vineri — Patimile Domnului | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de vineri din tradiția Bisericii Ortodoxe, dedicată Patimilor și Crucii Mântuitorului. Text integral din Ceaslovul BOR.',
    dedicatie: 'Vinerea este zi de post și de cinstire a Patimilor Mântuitorului, amintind de răstignirea și moartea Sa pe Cruce.',
    culoare: '#C62828',
    icon: '☩',
    paragrafe: [
      'Doamne Iisuse Hristoase, Fiul lui Dumnezeu, Cel ce ai pătimit pentru noi și ai murit pe Cruce, ridicând păcatele lumii, miluiește-ne pe noi, păcătoșii.',
      'Patimile Tale, Hristoase, le cinstim și Sfânta Ta Cruce o sărutăm, și Învierea Ta o slăvim.',
      '— — —',
      'Doamne Iisuse Hristoase, în această zi de vineri, când ne aducem aminte de pătimirile Tale pentru noi, inimile noastre se umplu de durere și de recunoștință. Tu, Cel fără de păcat, ai primit să fii batjocorit, biciuit, încoronat cu spini și răstignit pe Cruce, pentru ca noi, cei plini de păcate, să fim mântuiți.',
      'Doamne, Tu ai purtat pe umerii Tăi Crucea cea grea, mergând pe drumul Golgotei, și nu Te-ai întors înapoi din iubire față de noi. Ajută-ne și pe noi să purtăm cu răbdare crucea vieții noastre, știind că Tu ești cu noi în toate suferințele noastre.',
      'Tu, Cel ce ai strigat pe Cruce: „Tată, iartă-le lor, că nu știu ce fac", ajută-ne și pe noi să iertăm pe cei ce ne-au greșit, să nu purtăm ură și să nu căutăm răzbunare, ci să urmăm pilda iubirii Tale.',
      'Tu, Cel ce ai zis: „Însetat sunt", și ai primit oțet și fiere în loc de apă, ajută-ne să însetăm după dreptate și sfințenie, să nu ne mulțumim cu puțin în viața duhovnicească, ci să căutăm mereu mai mult din harul Tău.',
      'Tu, Cel ce ai zis: „Săvârșitu-s-a", și Ți-ai dat duhul în mâinile Tatălui, ajută-ne să ne încredințăm și noi viața noastră în mâinile lui Dumnezeu, în fiecare zi, cu credință și cu pace.',
      'Doamne Iisuse Hristoase, prin Patimile Tale cele mântuitoare, iartă-ne păcatele, vindecă bolile noastre, mângâie întristările noastre și dă-ne putere să trăim această zi de vineri în post, rugăciune și pocăință. Amin.',
      '— — —',
      'Tropar al Sfintei Cruci (glasul 1):',
      'Mântuiește, Doamne, poporul Tău și binecuvântează moștenirea Ta, biruință binecredincioșilor creștini asupra celui potrivnic dăruiește și cu Crucea Ta păzește pe poporul Tău.',
    ],
    faq: [
      {
        q: 'De ce vinerea este zi de post în tradiția ortodoxă?',
        a: 'Vinerea este zi de post în amintirea răstignirii și morții Mântuitorului Iisus Hristos pe Cruce, care a avut loc într-o vineri. Postul de vineri este o formă de participare la suferințele lui Hristos și de recunoștință față de jertfa Sa pentru mântuirea noastră.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── SÂMBĂTĂ — Rugăciunea pentru cei adormiți ───────────────────────────────
  6: {
    zi: 'Sâmbătă',
    slug: 'sambata',
    titlu: 'Rugăciunea Zilei de Sâmbătă — Pentru Cei Adormiți și Toți Sfinții',
    titluSeo: '🙏 Rugăciunea Zilei de Sâmbătă — Cei Adormiți și Sfinții | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de sâmbătă din tradiția Bisericii Ortodoxe, pentru cei adormiți și pentru toți sfinții. Text integral din Ceaslovul BOR.',
    dedicatie: 'Sâmbăta este ziua de pomenire a tuturor celor adormiți întru nădejdea învierii și a tuturor sfinților, conform rânduielii Tipicului Bisericii Ortodoxe.',
    culoare: '#37474F',
    icon: '🕯️',
    paragrafe: [
      'Doamne Iisuse Hristoase, Dumnezeul nostru, Cel ce ești învierea și viața tuturor, Care ai zis: „Eu sunt învierea și viața; cel ce crede în Mine, chiar dacă va muri, va trăi" — miluiește pe robii Tăi adormiți și odihnește-i în loc de lumină, în loc de verdeață, în loc de odihnă, de unde a fugit toată durerea, întristarea și suspinarea.',
      'Iartă-le toate greșelile lor, cele de voie și cele fără de voie, cele cu cuvântul, cu fapta și cu gândul, și-i odihnește în sânurile lui Avraam, ale lui Isaac și ale lui Iacov.',
      '— — —',
      'Doamne, în această zi de sâmbătă, când Biserica Ta face pomenire pentru toți cei adormiți, ne aducem aminte cu dragoste și cu durere de toți cei care au plecat înaintea noastră: părinții noștri, bunicii, frații, surorile, prietenii și toți cei pe care i-am iubit.',
      'Ei au trăit pe acest pământ, au suferit, s-au bucurat, au greșit și s-au pocăit. Acum sunt în mâinile Tale, Doamne, și noi nu putem face altceva decât să ne rugăm pentru ei și să nădăjduim în mila Ta cea nemărginită.',
      'Doamne, Tu care ai zis că nu voiești moartea păcătosului, ci să se întoarcă și să fie viu, miluiește pe toți cei adormiți, chiar și pe cei care au murit fără pocăință, căci Tu singur știi tainele inimilor lor.',
      'Și pe noi, cei vii, ajută-ne să ne pregătim pentru ceasul morții, trăind în pocăință, în rugăciune și în fapte bune, ca atunci când va veni rândul nostru să plecăm din această viață, să fim primiți în împărăția Ta cea veșnică.',
      'Toți Sfinții lui Dumnezeu, care ați trăit pe acest pământ și acum vă bucurați de slava lui Dumnezeu în ceruri, rugați-vă pentru noi, cei ce suntem încă în lupta vieții acesteia, și pentru toți cei adormiți întru nădejdea învierii. Amin.',
      '— — —',
      'Condac pentru cei adormiți (glasul 8):',
      'Cu Sfinții odihnește, Hristoase, sufletele robilor Tăi, unde nu este durere, nici întristare, nici suspin, ci viață fără de sfârșit.',
      '— — —',
      'Icos:',
      'Tu singur ești fără de moarte, Cel ce ai făcut și ai zidit pe om; iar noi, pământenii, din pământ suntem zidiți și în același pământ vom merge, precum ai poruncit Tu, Cel ce m-ai zidit și mi-ai zis: Pământ ești și în pământ te vei întoarce; unde toți noi mergem, făcând cântare de îngropăciune: Aliluia, Aliluia, Aliluia.',
    ],
    faq: [
      {
        q: 'De ce sâmbăta este ziua de pomenire a celor adormiți în tradiția ortodoxă?',
        a: 'Sâmbăta este ziua de pomenire a celor adormiți conform Tipicului Bisericii Ortodoxe. Această tradiție vine din faptul că Hristos a stat în mormânt sâmbăta, sfințind astfel odihna morților. De aceea, în fiecare sâmbătă, Biserica face pomenire pentru toți cei adormiți.'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  },

  // ─── DUMINICĂ — Rugăciunea de laudă a Învierii Domnului ─────────────────────
  0: {
    zi: 'Duminică',
    slug: 'duminica',
    titlu: 'Rugăciunea Zilei de Duminică — Lauda Învierii Domnului',
    titluSeo: '🙏 Rugăciunea Zilei de Duminică — Învierea Domnului | Text Integral',
    descSeo: 'Rugăciunea oficială a zilei de duminică din tradiția Bisericii Ortodoxe, de laudă a Învierii Mântuitorului. Text integral din Ceaslovul BOR.',
    dedicatie: 'Duminica este ziua Învierii Domnului nostru Iisus Hristos, „ziua cea dintâi a săptămânii" și „ziua Domnului", ziua de prăznuire și de bucurie duhovnicească.',
    culoare: '#FFD600',
    icon: '☀️',
    paragrafe: [
      'Hristos a Înviat din morți, cu moartea pe moarte călcând, și celor din morminte viață dăruindu-le!',
      'Hristos a Înviat! Adevărat a Înviat!',
      '— — —',
      'Doamne Iisuse Hristoase, Cel ce ai Înviat din morți a treia zi și ai umplut de bucurie pe Sfinții Tăi Apostoli și pe toate femeile mironosițe, umple și inima mea de bucuria Învierii Tale în această sfântă zi de Duminică.',
      'Tu, Cel ce ai biruit moartea și ai deschis porțile raiului, ajută-mă să trăiesc această zi ca pe o zi de Paști, cu bucurie, cu rugăciune, cu participare la Sfânta Liturghie și cu fapte bune.',
      'Doamne, Duminica este ziua Ta, ziua Învierii, ziua în care Tu ai arătat că dragostea este mai puternică decât moartea. Ajută-mă să nu irosesc această zi în lucruri deșarte, ci să o petrec în rugăciune, în citirea Sfintei Scripturi, în participarea la Sfânta Liturghie și în odihna binecuvântată.',
      'Învierea Ta, Hristoase, este nădejdea noastră. Prin Învierea Ta, noi știm că moartea nu este sfârșitul, că există viață după moarte, că cei adormiți vor învia, că vom vedea din nou pe cei dragi care au plecat înaintea noastră.',
      'Slavă Ție, Hristoase, pentru Învierea Ta! Slavă Ție pentru că ai biruit moartea! Slavă Ție pentru că ne-ai dăruit nădejdea vieții veșnice! Slavă Ție pentru că ne-ai arătat că dragostea Ta este mai puternică decât orice!',
      'Doamne Iisuse Hristoase, Cel Înviat din morți, binecuvântează această zi de Duminică pentru mine și pentru toți cei dragi mie. Fii cu noi la Sfânta Liturghie, în rugăciunile noastre, în masa noastră de prânz și în toată ziua aceasta. Amin.',
      '— — —',
      'Tropar al Învierii (glasul 1):',
      'Piatra fiind pecetluită de iudei și ostașii străjuind preacurat Trupul Tău, Înviezi a treia zi, Mântuitorule, dăruind viață lumii. Pentru aceasta Puterile cerurilor strigau Ție, Dătătorule de viață: Slavă Învierii Tale, Hristoase; slavă Împărăției Tale; slavă rânduielii Tale, Unule Iubitorule de oameni.',
      '— — —',
      'Condac al Învierii (glasul 1):',
      'Înviind Tu în ziua a treia din mormânt, Hristoase, ai ridicat din stricăciune viața noastră și ne-ai dăruit viață și nestricăciune, pe Tine Te lăudăm, Unule Iubitorule de oameni.',
    ],
    faq: [
      {
        q: 'De ce duminica este ziua Învierii Domnului în tradiția creștină?',
        a: 'Duminica este „ziua cea dintâi a săptămânii" în care Hristos a Înviat din morți. Creștinii se adună în fiecare duminică la Sfânta Liturghie pentru a celebra Învierea, care este fundamentul credinței creștine. Duminica este „ziua Domnului" (Kyriake hemera în greacă).'
      },
      {
        q: 'Ce este Rugăciunea Zilei în tradiția Ortodoxă?',
        a: 'În Biserica Ortodoxă, fiecare zi a săptămânii are o semnificație teologică unică și este ocrotită de anumiți sfinți sau puteri cerești. Lunea este dedicată Sfinților Îngeri, Joia Sfinților Apostoli și Sfântului Nicolae. Rugăciunile zilnice consacrate reflectă aceste rânduieli neschimbate.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      },
      {
        q: 'Unde pot găsi textul integral pentru rugăciunile săptămânii?',
        a: 'Platforma „Povești de Credință" oferă textul oficial, curat și integral al tuturor celor 7 rugăciuni ale săptămânii, aprobat în sinaxarele și cărțile de rugăciune ale Bisericii Ortodoxe Române.'
      }
    ]
  }
};

// ─── Helper: obține rugăciunea pentru ziua curentă ────────────────────────────
function getRugaciuneaZilei() {
  const zi = new Date().getDay(); // 0=Duminică, 1=Luni, ..., 6=Sâmbătă
  return RUGACIUNI_SAPTAMANA[zi];
}

// ─── Helper: obține rugăciunea după slug ─────────────────────────────────────
function getRugaciuneaDupaSlug(slug) {
  return Object.values(RUGACIUNI_SAPTAMANA).find(r => r.slug === slug) || null;
}

// ─── Helper: lista tuturor zilelor pentru interlinking ───────────────────────
const ZILE_RUGACIUNI = [
  { slug: 'duminica', zi: 'Duminică', icon: '☀️' },
  { slug: 'luni',     zi: 'Luni',     icon: '👼' },
  { slug: 'marti',    zi: 'Marți',    icon: '✝️' },
  { slug: 'miercuri', zi: 'Miercuri', icon: '✠' },
  { slug: 'joi',      zi: 'Joi',      icon: '🕯️' },
  { slug: 'vineri',   zi: 'Vineri',   icon: '☩' },
  { slug: 'sambata',  zi: 'Sâmbătă',  icon: '🕯️' }
];
