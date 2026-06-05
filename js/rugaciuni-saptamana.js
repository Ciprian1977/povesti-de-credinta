/**
 * rugaciuni-saptamana.js
 * Povești de Credință — povestidecredinta.ro
 *
 * Textele liturgice autentice ale celor 7 rugăciuni ale săptămânii.
 * Sursă: OrthodoxWiki România (ro.orthodoxwiki.org), licență GFDL / CC by-sa
 * Textele sunt din domeniu public liturgic ortodox, transmise prin tradiție de secole.
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
    titluSeo: 'Rugăciunea Zilei de Luni — Sfinții Îngeri Păzitori | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de luni din Ceaslov, adresată Sfinților Îngeri Păzitori. Text integral din tradiția liturgică ortodoxă, domeniu public.',
    dedicatie: 'Lunea este ziua închinată Sfinților Îngeri, slujitori nevăzuți ai lui Dumnezeu și păzitori ai oamenilor.',
    culoare: '#4A90D9',
    icon: '👼',
    paragrafe: [
      'Doamne Iisuse Hristoase, cu adâncă umilință recunosc și mărturisesc, că în toată ziua păcătuiesc contra iubirii Tale Dumnezeiești. Deci astăzi, că este luni și începutul săptămânii, mă rog cu umilință îndurării Tale celei mari: iartă-mi păcatele cele de voie și fără de voie, și-mi ajută să pun început bun și să port mai multă grijă de sufletul meu, pentru care ai răbdat atâtea dureri la Sfânta Ta Răstignire!',
      'O Doamne, astăzi Îți dau sufletul și trupul meu și voința mea, rugându-Te să fie voia Ta cu mine, după bună plăcerea Ta. Pedepsește-mă, Doamne, după îndurarea Ta, în această lume, iar nu în cealaltă viață. Și iartă pe cei vii și pe cei răposați, pentru rugăciunile Sfintei Tale Biserici, și pe toți ne învrednicește de mărirea Ta în rai.',
      'La aceasta pun mijlocitori pe Sfinții Tăi îngeri, către care zic: O, cereștilor ajutători și păzitori ai oamenilor, vouă mă închin și vă mulțumesc pentru ajutorul și conducerea ce ne-o dați în toate zilele nouă, nevrednicilor și păcătoșilor. Scutiți-mă de vrăjmașii cei văzuți și nevăzuți, ca să nu mai păcătuiesc de acum înaintea Dumnezeului meu!',
      'Învredniciți-mă să vă văd la moartea mea stând în jurul meu, și să duceți sufletul meu în cer, ca să se închine măririi Feței lui Dumnezeu, iar vouă să vă mulțumesc acolo pentru purtarea de grijă ce ați avut pentru mine și binele vostru să-l spun cu glas neîncetat în veci. Amin.',
    ],
    tropar: 'Tropar, glasul al 4-lea: Conducătorii oștilor cerești, rugămu-vă pe voi noi nevrednicii, ca prin rugăciunile voastre să ne acoperiți cu acoperământul aripilor slavei voastre celei netrupești, păzindu-ne pe noi, cei ce cădem cu dinadinsul și strigăm: Izbăviți-ne din nevoi, ca niște mai-mari ai puterilor celor de sus.',
    condac: 'Condac, glasul al 2-lea: Conducătorii oștilor lui Dumnezeu și slujitorii slavei Domnului, căpeteniile îngerilor și povățuitorii oamenilor, cereți-ne nouă cele de folos și mare milă, ca unii ce sunteți mai-marii puterilor celor netrupești.',
    faq: [
      {
        q: 'De ce lunea este ziua Sfinților Îngeri în tradiția ortodoxă?',
        a: 'În rânduiala liturgică ortodoxă, lunea este ziua dedicată Sfinților Îngeri, slujitori nevăzuți ai lui Dumnezeu. Această tradiție vine din Tipicul Bisericii, care rânduiește ca în fiecare luni să se facă pomenire specială a puterilor cerești.'
      },
      {
        q: 'Ce cere rugăciunea de Luni din Ceaslov?',
        a: 'Rugăciunea de Luni din Ceaslov cere iertarea păcatelor, ajutorul îngeresc pentru a pune un bun început săptămânii și ocrotire de vrăjmașii văzuți și nevăzuți.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── MARȚI — Rugăciunea către Sfântul Ioan Botezătorul ───────────────────────
  2: {
    zi: 'Marți',
    slug: 'marti',
    titlu: 'Rugăciunea Zilei de Marți — Către Sfântul Ioan Botezătorul',
    titluSeo: 'Rugăciunea Zilei de Marți — Sfântul Ioan Botezătorul | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de marți din Ceaslov, adresată Sfântului Ioan Botezătorul, Înaintemergătorul Domnului. Text integral din tradiția ortodoxă.',
    dedicatie: 'Marțea este ziua închinată Sfântului Ioan Botezătorul, Înaintemergătorul și Botezătorul Domnului nostru Iisus Hristos.',
    culoare: '#2E7D32',
    icon: '✝️',
    paragrafe: [
      'Doamne, Dumnezeul meu! Osândit stau înaintea Feței Tale celei Sfinte și-mi mărturisesc nevrednicia, neputința și sărăcia mea cea mare. Pentru aceasta mă rog Ție, o, Izvor dulce și noianul îndurării, deschide stavilele cerului și plouă asupra mea bunătățile îndurării Tale, ca să pot scoate lacrimi, să plâng, să spăl și să curățesc sufletul meu de întinăciunea păcatelor, cu căință tare și adevărată.',
      'Și ca să-mi dai acest Dar, Stăpâne, pun mijlocitor pe Înainte-Mergătorul Ioan, către care zic: O, învățătorule al credinței și mărite Proorocule, care ești mai mare decât toți proorocii, precum Însuși Fiul lui Dumnezeu te-a numit în Sfânta Evanghelie, tu, care ai arătat poporului pe Stăpânul Hristos, tu, care L-ai botezat în Iordan și ai văzut cerurile deschizându-se, tu, care ai auzit glasul Părintelui Ceresc și ai văzut pe Duhul Sfânt ca un porumbel pogorându-Se peste El.',
      'Rogu-te, ajută-mi cu mijlocirea ta, tu, care stai în cer înaintea Judecătorului Veșnic, și fă să se îndure de mine, că ai multă îndrăzneală la iubirea Lui.',
      'Întinde mâna aceea, cu care L-ai botezat și strică cugetele mele cele rele și mă întărește să-mi petrec viața pe calea cea bună a lui Dumnezeu. O, Proorocule! Luminează-mi mintea cu poruncile Domnului, ca să le țin minte și să le păzesc, până la capătul vieții mele.',
      'Și să stai lângă mine în ora morții mele, să mă duci pocăit înaintea Stăpânului meu, Dumnezeu. Roagă-te încă și pentru toată lumea, ca Dumnezeu să dea ajutor creștinilor, și celor vii și celor răposați, și să-i odihnească de nevoile cele multe, să le dea toate cele de trebuință și să-i învrednicească Împărăției Sale. Amin.',
    ],
    tropar: 'Tropar, glasul al 2-lea: Pomenirea dreptului cu laude; iar ție îți este de ajuns mărturia Domnului, Înaintemergătorule; că te-ai arătat cu adevărat mai cinstit decât proorocii, că te-ai învrednicit a boteza în râuri pe Cel propovăduit. Drept aceea, pentru adevăr luptând, bucurându-te, ai binevestit și celor din iad pe Dumnezeu Cel arătat în trup, Cel ce a ridicat păcatul lumii și ne-a dăruit nouă mare milă.',
    condac: 'Condac, glasul al 3-lea: Proorocul cel mai înainte de har, cel de față cu harul, a pus temelia a amândurora testamentelor; Înaintemergătorul cel ce a propovăduit pocăința și a botezat în Iordan pe Cel ce a venit să ridice păcatele lumii.',
    faq: [
      {
        q: 'De ce marțea este ziua Sfântului Ioan Botezătorul în tradiția ortodoxă?',
        a: 'Marțea este dedicată Sfântului Ioan Botezătorul, Înaintemergătorul Domnului, conform Tipicului Bisericii Ortodoxe. Ioan Botezătorul este cel mai mare dintre prooroci, cel care a pregătit calea Mântuitorului și L-a botezat în Iordan.'
      },
      {
        q: 'Ce cere rugăciunea de Marți din Ceaslov?',
        a: 'Rugăciunea de Marți cere lacrimi de pocăință, curățirea sufletului de păcate și mijlocirea Sfântului Ioan Botezătorul pentru a trăi pe calea cea bună a lui Dumnezeu.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── MIERCURI — Rugăciunea Sfintei Cruci ────────────────────────────────────
  3: {
    zi: 'Miercuri',
    slug: 'miercuri',
    titlu: 'Rugăciunea Zilei de Miercuri — Rânduiala pentru Sfânta Cruce',
    titluSeo: 'Rugăciunea Zilei de Miercuri — Sfânta Cruce | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de miercuri din Ceaslov, dedicată Sfintei Cruci și amintirii vânzării Domnului. Text integral din tradiția liturgică ortodoxă.',
    dedicatie: 'Miercurea este zi de post și de cinstire a Sfintei Cruci, amintind de vânzarea Mântuitorului de către Iuda.',
    culoare: '#7B1FA2',
    icon: '✠',
    paragrafe: [
      'Doamne Atotputernice și Atotîndurate! Îmi aduc aminte că Te-ai născut Om din Sfânta Fecioară în peșteră și ai fost vândut cu treizeci de arginți de ucenicul cel viclean, ca să ne răscumperi pe noi, păcătoșii, de sub puterea diavolului. Pentru aceasta, Te rog, îndură-Te de mine, păcătosul!',
      'Primește, Doamne, această mică a mea rugăciune și umilită a mea voință, că mă întristez pentru că Te-am întristat și mă amărăsc pentru că Te-am supărat fără de număr. La Tine, Prea Bunule Mântuitor, am toată speranța și cred că Tu, care din iubire de oameni ai primit să fii vândut pentru noi, Te vei îndura și de mine acum, ca să mă mântuiești de chinurile cele de veci și să mă învrednicești Împărăției Tale.',
      'Nu Te depărta de la mine, Doamne, și ajută-mi ca în toate să fac voia Ta și să nu Te mai răstignesc în toate zilele cu faptele mele cele păcătoase, nici să Te batjocoresc cu cugetele mele cele rele, precum făceau iudeii cei necredincioși în timpul Sfintelor Tale Patimi, ci ca femeia cea păcătoasă să-Ți spăl picioarele, cu lacrimile ochilor mei, pentru ca să mă învrednicesc a auzi și eu din gura Ta cea dulce: „Iertate să-ți fie păcatele..." Amin.',
    ],
    tropar: 'Tropar al Sfintei Cruci, glasul al 1-lea: Mântuiește, Doamne, poporul Tău și binecuvântează moștenirea Ta, biruință binecredincioșilor creștini asupra celui potrivnic dăruiește și cu Crucea Ta păzește pe poporul Tău.',
    condac: 'Condac al Sfintei Cruci, glasul al 4-lea: Cel ce Te-ai înălțat pe Cruce de bunăvoie, poporului Tău celui nou, numit cu numele Tău, îndurările Tale dăruiește-i, Hristoase Dumnezeule; veselește cu puterea Ta pe binecredincioșii creștini, dăruindu-le lor biruință asupra potrivnicului, având ajutorul Tău armă de pace, nebiruită biruință.',
    faq: [
      {
        q: 'De ce miercurea este zi de post și de cinstire a Sfintei Cruci?',
        a: 'Miercurea este zi de post în amintirea vânzării Mântuitorului de către Iuda Iscarioteanul, care a avut loc într-o miercuri. Este și zi de cinstire a Sfintei Cruci, pe care Hristos a pătimit pentru mântuirea lumii.'
      },
      {
        q: 'Ce cere rugăciunea de Miercuri din Ceaslov?',
        a: 'Rugăciunea de Miercuri cere iertarea păcatelor, ajutorul de a face voia lui Dumnezeu și harul de a nu-L mai răstigni pe Hristos prin faptele noastre păcătoase.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── JOI — Rugăciunea Sfinților Apostoli și Sfântul Nicolae ─────────────────
  4: {
    zi: 'Joi',
    slug: 'joi',
    titlu: 'Rugăciunea Zilei de Joi — Cina cea de Taină și Sfinții Apostoli',
    titluSeo: 'Rugăciunea Zilei de Joi — Sfinții Apostoli și Sfântul Nicolae | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de joi din Ceaslov, dedicată Sfinților Apostoli și Sfântului Ierarh Nicolae. Text integral din tradiția liturgică ortodoxă.',
    dedicatie: 'Joia este ziua închinată Sfinților Apostoli și Sfântului Ierarh Nicolae, amintind de Cina cea de Taină.',
    culoare: '#E65100',
    icon: '🕊️',
    paragrafe: [
      'Doamne Iisuse Hristoase, Fiule și Cuvântul lui Dumnezeu Tatăl, Care în ziua de astăzi ai luat Cina cea de pe urmă cu ucenicii Tăi și cu mare umilință ai spălat picioarele lor și ale ucenicului care Te-a vândut! Apoi, luând pâine și vin în mâinile Tale cele sfinte și binecuvântându-le cu puterea Ta cea dumnezeiască, le-ai făcut însuși Trupul și Sângele Tău, cu care i-ai împărtășit zicând: „Luați, mâncați și beți, că acestea sânt Trupul și Sângele Meu, pentru ca să se ierte păcatele voastre."',
      'Cela ce tot în ziua aceasta Te-ai înălțat la cer și ai șezut de-a dreapta lui Dumnezeu, Tatălui Tău, să împărățești împreună cu El în veci, ca Unul-Născut Fiul Său preaiubit.',
      'Rogu-Te deci, pentru rugăciunile ucenicilor Tăi și ale Sfântului Nicolae, iartă păcatele noastre ale tuturor, ale celor vii și ale celor răposați. Dă-mi, Doamne, lacrimi fierbinți, ca să-mi plâng păcatele.',
      'Darul Tău cel curățitor, care a spălat picioarele ucenicilor Tăi, să spele și să curățească inima și sufletul meu, ca așa, cu vrednicie, cu curăție și cu umilință să mă împărtășesc cu Sfintele Tale Taine, acum și în timpul morții mele, iar în ceasul despărțirii mele, cu bucurie să se suie sufletul meu la Tine, fără de nici o frică, întrebare sau împiedicare să trec vămile văzduhului, intrând în mărirea Ta cea cerească.',
      'Ajută-mi, Doamne, ca să Te măresc în veci, să mă închin Numelui Tău Celui Sfânt. Amin.',
    ],
    tropar: 'Tropar al Sfinților Apostoli, glasul al 3-lea: Sfinților Apostoli, rugați pe Milostivul Dumnezeu, ca să dăruiască iertare de greșeli sufletelor noastre.',
    condac: 'Condac al Sfântului Nicolae, glasul al 3-lea: În Mira, sfinte, sfințitor te-ai arătat; că, Evanghelia lui Hristos împlinind-o, viața ta ai pus-o pentru poporul tău și i-ai mântuit pe cei nevinovați de moarte. Pentru aceasta te-ai sfințit, ca un mare cunoscător al darului lui Dumnezeu.',
    faq: [
      {
        q: 'De ce joia este ziua Apostolilor în tradiția ortodoxă?',
        a: 'Joia este dedicată Sfinților Apostoli deoarece în această zi Hristos a instituit Sfânta Euharistie la Cina cea de Taină și tot joi S-a înălțat la cer în fața Apostolilor.'
      },
      {
        q: 'Ce cere rugăciunea de Joi din Ceaslov?',
        a: 'Rugăciunea de Joi cere lacrimi de pocăință, vrednicia de a se împărtăși cu Sfintele Taine și trecerea cu bine a vămilor văzduhului la moarte, prin mijlocirea Apostolilor și a Sfântului Nicolae.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── VINERI — Rugăciunea Sfintei Cruci și a Patimilor ───────────────────────
  5: {
    zi: 'Vineri',
    slug: 'vineri',
    titlu: 'Rugăciunea Zilei de Vineri — Rânduiala de umilință către Sfânta Cruce',
    titluSeo: 'Rugăciunea Zilei de Vineri — Sfânta Cruce și Patimile | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de vineri din Ceaslov, dedicată Sfintei Cruci și Patimilor Mântuitoare. Text integral din tradiția liturgică ortodoxă.',
    dedicatie: 'Vinerea este zi de post și de cinstire a Sfintei Cruci, amintind de Răstignirea și Moartea Mântuitorului.',
    culoare: '#B71C1C',
    icon: '✠',
    paragrafe: [
      'Doamne Iisuse Hristoase, Mântuitorul cel dulce al sufletului meu, în această zi a Răstignirii Tale pe Cruce ai pătimit și ai luat moarte pentru păcatele noastre, mă mărturisesc înaintea Ta, cum că eu sunt cel ce Te-am răstignit cu păcatele mele cele multe.',
      'Mă rog însă bunătății Tale celei nespuse să mă învrednicești cu Darul Tău, Doamne, ca și eu să pot răbda patimi pentru credința, speranța și iubirea ce le am către Tine, precum Tu, Cel îndurat, ai răbdat pentru mântuirea mea.',
      'Întărește-mă, o, Doamne ca de astăzi înainte să port Crucea Ta cu bucurie și cu mare căință, și să urăsc cugetele mele și voințele mele cele rele. Sădește în inima mea întristare de moartea Ta, ca să o simt precum au simțit-o iubita Ta Maică, ucenicii Tăi și femeile purtătoare de mir care stăteau lângă Crucea Ta.',
      'Luminează-mi simțirile cele sufletești, ca să se miște și să priceapă moartea Ta, precum ai făcut de Te-au cunoscut făpturile cele neînsuflețite, când s-au mișcat la răstignirea Ta, și mai vârtos cum Te-a cunoscut tâlharul cel credincios și pocăit, și Ți s-a plecat, de l-ai pus în Rai. Dă-mi, Doamne, și mie, tâlharului celui rău, Darul Tău, precum atunci l-ai dat aceluia și-mi iartă păcatele, pentru Sfintele Tale Patimi, și cu bună întoarcere și căință mă așează împreună cu el în Rai, ca un Dumnezeu și Ziditor ce-mi ești.',
      'Mă închin Crucii Tale, Hristoase, și pentru iubirea Ta către noi, zic către dânsa:',
      'Bucură-te, cinstită Cruce a lui Hristos, pe care ridicat și pironit fiind Domnul, a mântuit lumea!',
      'Bucură-te, pom binecuvântat, pentru că tu ai ținut rodul vieții, care ne-a mântuit de moartea păcatului.',
      'Bucură-te, drugul cel tare, care ai sfărâmat ușile iadului.',
      'Bucură-te, cheie împărătească, ce ai deschis ușa raiului.',
      'O, Hristoase al meu răstignit, câte ai pătimit pentru noi! Câte răni, câte scuipări și câtă ocară ai răbdat pentru păcatele noastre și pentru a ne da încă pildă de adevărată răbdare în suferințele și necazurile vieții acesteia! Și fiindcă acestea ni le trimite Dumnezeu pentru păcatele noastre, ca să ne îndreptăm și să ne apropiem de El, și așa, numai spre folosul nostru ne pedepsește în această viață; de aceea, rogu-mă Ție, Stăpâne, ca la necazurile, ispitele și durerile câte ar veni asupra mea, să-mi înmulțești împreună și răbdarea, puterea și mulțumirea, căci cunosc, că neputincios sunt de nu mă vei întări; orb de nu mă vei lumina; legat de nu mă vei dezlega; fricos de nu mă vei face îndrăzneț; pierdut de nu mă vei cerca; sclav de nu mă vei răscumpăra cu bogata și Dumnezeiasca Ta putere și cu Darul Sfintei Tale Cruci, căreia mă închin și o măresc acum și pururea și în vecii vecilor. Amin.',
    ],
    tropar: 'Tropar al Sfintei Cruci, glasul al 1-lea: Mântuiește, Doamne, poporul Tău și binecuvântează moștenirea Ta, biruință binecredincioșilor creștini asupra celui potrivnic dăruiește și cu Crucea Ta păzește pe poporul Tău.',
    condac: 'Condac al Sfintei Cruci, glasul al 4-lea: Cel ce Te-ai înălțat pe Cruce de bunăvoie, poporului Tău celui nou, numit cu numele Tău, îndurările Tale dăruiește-i, Hristoase Dumnezeule; veselește cu puterea Ta pe binecredincioșii creștini, dăruindu-le lor biruință asupra potrivnicului, având ajutorul Tău armă de pace, nebiruită biruință.',
    faq: [
      {
        q: 'De ce vinerea este zi de post în tradiția ortodoxă?',
        a: 'Vinerea este zi de post pentru că în această zi Hristos a fost răstignit pe Cruce pentru mântuirea lumii. Postul de vineri este o rânduială apostolică, una dintre cele mai vechi din tradiția creștină.'
      },
      {
        q: 'Ce cere rugăciunea de Vineri din Ceaslov?',
        a: 'Rugăciunea de Vineri cere puterea de a purta Crucea cu bucurie, răbdare în necazuri și iertarea păcatelor prin mijlocirea Sfintei Cruci și a Patimilor Mântuitoare.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── SÂMBĂTĂ — Rugăciunea pentru cei vii și adormiți ────────────────────────
  6: {
    zi: 'Sâmbătă',
    slug: 'sambata',
    titlu: 'Rugăciunea Zilei de Sâmbătă — Pentru cei vii și cei adormiți',
    titluSeo: 'Rugăciunea Zilei de Sâmbătă — Toți Sfinții și Adormiții | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de sâmbătă din Ceaslov, pentru cei vii și cei adormiți. Text integral din tradiția liturgică ortodoxă, domeniu public.',
    dedicatie: 'Sâmbăta este ziua dedicată tuturor Sfinților și pomenirii celor adormiți în Domnul.',
    culoare: '#37474F',
    icon: '🕯️',
    paragrafe: [
      'Doamne Iisuse Hristoase, Judecătorul meu Preadrept! Cunosc că păcatele mele sunt fără de număr. De aceea Te rog, în această zi, în care de Iosif și de Nicodim pus fiind în Mormânt, Te-ai pogorât în iad cu Sfântul și Îndumnezeitul Tău suflet și de acolo ai depărtat întunericul cu lumina Dumnezeirii Tale și ai adus bucurie nespus de mare strămoșilor noștri, căci i-ai mântuit de sclavia cea cumplită și-ai suit în Rai.',
      'Îngroapă păcatele mele și cugetele mele cele rele și viclene, ca să piară din mintea mea și să nu se mai lupte cu sufletul meu. Luminează întunecatul iad al inimii mele, alungă întunericul păcatelor mele și suie mintea mea la cer, ca să mă bucur de Fața Ta.',
      'Așa, Doamne, primește umilita mea rugăciune ca o tămâie mirositoare, pentru rugăciunile iubitei Tale Maici, care Te-a văzut pe Cruce pironit între doi tâlhari și de durele Tale cumplite i s-a rănit inima; care împreună cu ucenicii și cu mironosițele Te-au pus în mormânt, care a treia zi Te-au văzut înviat din morți și la înălțarea Ta Te-a văzut suindu-Te de la pământ la cer, însoțit de Sfinții Tăi Îngeri.',
      'Îndură-Te, Doamne, și de cei vii și de cei răposați, pentru rugăciunile Sfinților Tăi, către care zic și eu, nevrednicul: O, fericiți servitori ai lui Dumnezeu! Nu încetați a vă ruga Lui ziua și noaptea pentru noi, nevrednicii, care pururea greșim cu atâtea nenumărate păcate! Mijlociți pentru noi Darul și ajutorul lui Dumnezeu, pe care nu știm a-l cere după cuviință.',
      'Nu încetați a vă ruga, pentru ca, prin rugăciunile voastre, păcătoșii să câștige iertare, săracii ajutor, întristații mângâiere, bolnavii sănătate, cei slabi la minte înțelepciune, cei tulburați liniște, cei asupriți ocrotire și toți împreună Darul lui Dumnezeu, spre folosul cel sufletesc, în mărirea lui Dumnezeu Celui în Treime lăudat, Căruia I Se cuvine cinste și închinăciune în veci. Amin.',
    ],
    tropar: 'Tropar al tuturor Sfinților, glasul al 8-lea: Apostolilor, mucenicilor și proorocilor, ierarhilor, cuvioșilor și drepților, care bine v-ați nevoit și ați păzit credința, îndrăzneală având către Mântuitorul, rugați-vă pentru noi, ca să mântuiască sufletele noastre.',
    condac: 'Condac pentru cei adormiți, glasul al 8-lea: Cu Sfinții odihnește, Hristoase, sufletele robilor Tăi, unde nu este durere, nici întristare, nici suspin, ci viață fără de sfârșit.',
    faq: [
      {
        q: 'De ce sâmbăta este zi de pomenire a morților în tradiția ortodoxă?',
        a: 'Sâmbăta este dedicată pomenirii celor adormiți deoarece Hristos a stat în mormânt sâmbăta, coborând la iad să elibereze sufletele drepților. De aceea se fac parastase sâmbăta.'
      },
      {
        q: 'Ce cere rugăciunea de Sâmbătă din Ceaslov?',
        a: 'Rugăciunea de Sâmbătă cere îngroparea păcatelor, luminarea inimii, iertare pentru cei vii și odihnă pentru cei adormiți, prin mijlocirea tuturor Sfinților.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  },

  // ─── DUMINICĂ — Rugăciunea Învierii Domnului ─────────────────────────────────
  0: {
    zi: 'Duminică',
    slug: 'duminica',
    titlu: 'Rugăciunea Zilei de Duminică — Ziua Învierii Domnului',
    titluSeo: 'Rugăciunea Zilei de Duminică — Învierea Domnului | Text Integral din Ceaslov',
    descSeo: 'Rugăciunea autentică a zilei de duminică din Ceaslov, dedicată Învierii Domnului nostru Iisus Hristos. Text integral din tradiția liturgică ortodoxă.',
    dedicatie: 'Duminica este ziua Învierii Domnului, cea mai importantă zi a săptămânii pentru creștinii ortodocși.',
    culoare: '#F9A825',
    icon: '☀️',
    paragrafe: [
      'Ziua Duminicii îmi aduce aminte de atotputernicia Ta, Stăpâne, cu care ai zidit lumea și ai răscumpărat pe om. Ție deci, iubitorule de oameni, Doamne, mă închin și-Ți mulțumesc foarte pentru Darurile cele mari pe care le-ai făcut și le faci tuturor făpturilor Tale.',
      'Inima mi se bucură și se desfată când stau și cuget cum că numai Tu Însuți ești Dumnezeu Atotsfânt, Atotînțelept, Atotputernic, necuprins, încât nici o bunătate și nici o mărire nu-ți lipsește. Tu ești Unul Dumnezeu în Trei Fețe: Tatăl, Fiul și Duhul Sfânt. Numai pe Tine Te cunosc Dumnezeu adevărat și Te mărturisesc și Te măresc, Ție mă închin și-Ți servesc pururea, cu toată inima și cu toată puterea.',
      'O, Părinte Sfinte, îndură-Te de noi! O, Binecuvântate Fiu al lui Dumnezeu, mântuiește-ne de iad! O, Duhule Sfinte, dă-mi Darul și acoperământul Tău!',
      'Mult îndurate Stăpâne, rogu-Te, să uiți păcatele mele cele multe, după mulțimea îndurărilor Tale. Mulțumesc din toată inima pentru bunătățile ce-mi trimiți în toate zilele, mai vârtos însă pentru răbdarea Ta cea mare, că nu m-ai pedepsit după mulțimea păcatelor mele, ci aștepți căința mea, ca un iertător, atotbun și îndurat.',
      'Doamne Iisuse Hristoase, dă-mi Darul Tău, ca să petrec bine și creștinește în această săptămână și să nu mai păcătuiesc Ție, nici cu cugetarea, nici cu cuvântul, nici cu fapta, întru mărirea și onoarea Învierii Tale celei de-a treia zi și a venirii Duhului Tău Celui Sfânt asupra Apostolilor.',
      'Îndeosebi mă rog pentru ajutorul Tău, Prea Bunule Stăpâne, ca să mă cunosc pe mine, să mă căiesc de păcatele mele și să mă îndreptez cu mărturisirea; iar în ora morții să fiu aflat pregătit, cuminecat și cu inima curată și să fiu aflat demn de Împărăția Ta cea veșnică. Amin.',
    ],
    tropar: 'Tropar al Învierii, glasul al 1-lea: Piatra fiind pecetluită de iudei și ostașii străjuind Preacurat Trupul Tău, înviat-ai a treia zi, Mântuitorule, dăruind lumii viață. Pentru aceasta Puterile cerurilor strigau Ție, Dătătorule de viață: Slavă Învierii Tale, Hristoase, slavă Împărăției Tale, slavă rânduielii Tale, Unule, Iubitorule de oameni.',
    condac: 'Condac al Învierii, glasul al 1-lea: Înviat-ai ca un Dumnezeu din mormânt întru slavă, și lumea împreună ai înviat-o; și firea omenească ca un Dumnezeu o ai lăudat, și moartea a murit. Adam saltă, Stăpâne, și Eva acum se bucură, strigând: Tu ești Cel ce ai dăruit, Hristoase, tuturor Învierea.',
    faq: [
      {
        q: 'De ce duminica este ziua Învierii în tradiția ortodoxă?',
        a: 'Duminica este ziua Învierii Domnului Iisus Hristos din morți. De aceea este numită „ziua Domnului" și este cea mai importantă zi a săptămânii pentru creștinii ortodocși.'
      },
      {
        q: 'Ce cere rugăciunea de Duminică din Ceaslov?',
        a: 'Rugăciunea de Duminică mulțumește lui Dumnezeu pentru darurile primite, cere ajutor pentru a trăi creștinește în săptămâna ce urmează și harul de a fi demn de Împărăția cerească.'
      },
      {
        q: 'De ce este important să citim rugăciunea specifică fiecărei zile?',
        a: 'Citirea rugăciunii rânduite pentru ziua respectivă ne ajută să rămânem în comuniune cu ritmul liturgic al Bisericii, aducând mulțumire, cereri de iertare și ocrotire adaptate momentului din săptămână.'
      }
    ]
  }

};

// Funcție utilitară: returnează datele rugăciunii pentru ziua curentă
function getRugaciuneaZileiCurente() {
  const zi = new Date().getDay(); // 0=Dum, 1=Lun, ..., 6=Sam
  return RUGACIUNI_SAPTAMANA[zi] || RUGACIUNI_SAPTAMANA[0];
}

// Funcție utilitară: returnează datele rugăciunii după slug
function getRugaciuneaDupaSlug(slug) {
  for (const key in RUGACIUNI_SAPTAMANA) {
    if (RUGACIUNI_SAPTAMANA[key].slug === slug) {
      return RUGACIUNI_SAPTAMANA[key];
    }
  }
  return null;
}

// Expune global pentru app.js
window.RUGACIUNI_SAPTAMANA = RUGACIUNI_SAPTAMANA;
window.getRugaciuneaZileiCurente = getRugaciuneaZileiCurente;
window.getRugaciuneaDupaSlug = getRugaciuneaDupaSlug;
